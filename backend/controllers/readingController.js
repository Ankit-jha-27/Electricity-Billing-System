const Reading = require('../models/Reading');
const Customer = require('../models/Customer');

exports.getReadings = async (req, res) => {
  try {
    const { customerId, month, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (customerId) query.customer = customerId;
    if (month) query.readingMonth = month;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [readings, total] = await Promise.all([
      Reading.find(query).populate('customer', 'name customerId meterNumber').sort({ readingDate: -1 }).skip(skip).limit(Number(limit)),
      Reading.countDocuments(query),
    ]);
    res.json({ success: true, data: readings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createReading = async (req, res) => {
  try {
    const customer = await Customer.findById(req.body.customer);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    // Get last reading for this customer
    const lastReading = await Reading.findOne({ customer: req.body.customer }).sort({ readingDate: -1 });
    if (lastReading && req.body.currentReading < lastReading.currentReading) {
      return res.status(400).json({ success: false, message: 'Current reading cannot be less than previous reading' });
    }

    const reading = await Reading.create({
      ...req.body,
      meterNumber: customer.meterNumber,
      previousReading: lastReading ? lastReading.currentReading : (req.body.previousReading || 0),
    });
    res.status(201).json({ success: true, data: reading });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateReading = async (req, res) => {
  try {
    const reading = await Reading.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reading) return res.status(404).json({ success: false, message: 'Reading not found' });
    res.json({ success: true, data: reading });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteReading = async (req, res) => {
  try {
    const reading = await Reading.findByIdAndDelete(req.params.id);
    if (!reading) return res.status(404).json({ success: false, message: 'Reading not found' });
    res.json({ success: true, message: 'Reading deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};