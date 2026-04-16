const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const Reading = require('../models/Reading');

// GET /api/customer/me
exports.getMyProfile = async (req, res) => {
  try {
    if (!req.user.customerId)
      return res.status(404).json({ success: false, message: 'No customer record linked to this account' });

    const customer = await Customer.findById(req.user.customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const [bills, readings, unpaidCount, totalPaid] = await Promise.all([
      Bill.find({ customer: customer._id }).sort({ billDate: -1 }).limit(6),
      Reading.find({ customer: customer._id }).sort({ readingDate: -1 }).limit(6),
      Bill.countDocuments({ customer: customer._id, paymentStatus: { $in: ['Unpaid', 'Overdue'] } }),
      Bill.aggregate([
        { $match: { customer: customer._id, paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } },
      ]),
    ]);

    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisReading = readings.find(r => r.readingMonth === thisMonth);

    res.json({
      success: true,
      data: {
        customer,
        bills,
        readings,
        stats: {
          unpaidBills: unpaidCount,
          outstandingBalance: customer.outstandingBalance || 0,
          totalPaid: totalPaid[0]?.total || 0,
          unitsThisMonth: thisReading?.unitsConsumed || 0,
          lastReadingDate: readings[0]?.readingDate || null,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/customer/bills
exports.getMyBills = async (req, res) => {
  try {
    if (!req.user.customerId)
      return res.status(403).json({ success: false, message: 'No customer record linked' });

    const { page = 1, limit = 8, paymentStatus } = req.query;
    const query = { customer: req.user.customerId };
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    const [bills, total] = await Promise.all([
      Bill.find(query).sort({ billDate: -1 }).skip(skip).limit(Number(limit)),
      Bill.countDocuments(query),
    ]);

    res.json({ success: true, data: bills, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/customer/readings
exports.getMyReadings = async (req, res) => {
  try {
    if (!req.user.customerId)
      return res.status(403).json({ success: false, message: 'No customer record linked' });

    const readings = await Reading.find({ customer: req.user.customerId }).sort({ readingDate: -1 }).limit(12);
    res.json({ success: true, data: readings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/customer/bills/:id/pay
exports.payMyBill = async (req, res) => {
  try {
    if (!req.user.customerId)
      return res.status(403).json({ success: false, message: 'No customer record linked' });

    const bill = await Bill.findById(req.params.id);
    if (!bill)
      return res.status(404).json({ success: false, message: 'Bill not found' });

    if (bill.customer.toString() !== req.user.customerId.toString())
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (bill.paymentStatus === 'Paid')
      return res.status(400).json({ success: false, message: 'Bill is already paid' });

    // Auto-generate a reference ID — customer doesn't need to enter UTR
    const autoRef = 'UPI' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();

    bill.amountPaid    = bill.totalAmount;
    bill.balanceDue    = 0;
    bill.paymentStatus = 'Paid';
    bill.paymentMode   = 'UPI';
    bill.transactionId = req.body.transactionId?.trim() || autoRef;
    bill.paymentDate   = new Date();
    await bill.save();

    // Update customer outstanding balance
    await Customer.findByIdAndUpdate(req.user.customerId, {
      $inc: { outstandingBalance: -bill.totalAmount },
    });

    res.json({ success: true, message: 'Payment confirmed!', data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
