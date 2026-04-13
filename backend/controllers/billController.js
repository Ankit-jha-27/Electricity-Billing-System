const Bill = require('../models/Bill');
const Reading = require('../models/Reading');
const Customer = require('../models/Customer');
const Tariff = require('../models/Tariff');

// Calculate energy charges using slab tariff
const calcEnergyCharges = (units, slabs) => {
  let charge = 0;
  let remaining = units;
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const slabUnits = slab.toUnit ? Math.min(remaining, slab.toUnit - slab.fromUnit) : remaining;
    charge += slabUnits * slab.ratePerUnit;
    remaining -= slabUnits;
  }
  return charge;
};

exports.getBills = async (req, res) => {
  try {
    const { customerId, month, paymentStatus, page = 1, limit = 10, search } = req.query;
    const query = {};
    if (customerId) query.customer = customerId;
    if (month) query.billMonth = month;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      const customers = await Customer.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { customerId: { $regex: search, $options: 'i' } },
        ]
      }).select('_id');
      query.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { customer: { $in: customers.map(c => c._id) } },
      ];
    }

    const skip = (page - 1) * limit;
    const [bills, total] = await Promise.all([
      Bill.find(query).populate('customer', 'name customerId meterNumber connectionType').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Bill.countDocuments(query),
    ]);
    res.json({ success: true, data: bills, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('customer').populate('reading');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateBill = async (req, res) => {
  try {
    const { customerId, readingId, billMonth } = req.body;

    const [customer, reading] = await Promise.all([
      Customer.findById(customerId),
      Reading.findById(readingId),
    ]);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    if (!reading) return res.status(404).json({ success: false, message: 'Reading not found' });

    // Check if bill already generated for this reading
    const existing = await Bill.findOne({ reading: readingId });
    if (existing) return res.status(400).json({ success: false, message: 'Bill already generated for this reading' });

    // Get tariff
    const tariff = await Tariff.findOne({ connectionType: customer.connectionType, isActive: true });
    if (!tariff) return res.status(400).json({ success: false, message: 'No active tariff found for this connection type' });

    const units = reading.unitsConsumed;
    const energyCharges = calcEnergyCharges(units, tariff.slabs);
    const fixedCharges = tariff.fixedCharge;
    const fuelAdjustmentCharge = units * tariff.fuelAdjustmentCharge;
    const subtotal = energyCharges + fixedCharges + fuelAdjustmentCharge + (customer.outstandingBalance || 0);
    const electricityDuty = (subtotal * tariff.electricityDutyPercent) / 100;
    const totalAmount = subtotal + electricityDuty;

    const bill = await Bill.create({
      customer: customerId,
      reading: readingId,
      billMonth: billMonth || reading.readingMonth,
      previousReading: reading.previousReading,
      currentReading: reading.currentReading,
      unitsConsumed: units,
      energyCharges,
      fixedCharges,
      fuelAdjustmentCharge,
      electricityDuty,
      arrears: customer.outstandingBalance || 0,
      totalAmount,
    });

    // Mark reading as billed
    await Reading.findByIdAndUpdate(readingId, { status: 'Billed' });
    // Update customer outstanding
    await Customer.findByIdAndUpdate(customerId, { outstandingBalance: totalAmount });

    res.status(201).json({ success: true, data: await bill.populate('customer') });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const { amountPaid, paymentMode, transactionId } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    bill.amountPaid += amountPaid;
    bill.paymentMode = paymentMode;
    bill.transactionId = transactionId;
    bill.paymentDate = new Date();
    await bill.save();

    // Update customer balance
    await Customer.findByIdAndUpdate(bill.customer, {
      $inc: { outstandingBalance: -amountPaid }
    });

    res.json({ success: true, data: await bill.populate('customer') });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, message: 'Bill deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};