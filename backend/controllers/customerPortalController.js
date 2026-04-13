const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const Reading = require('../models/Reading');

// GET /api/customer/me — full profile + stats for the logged-in customer
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

    // Units consumed this month
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

// GET /api/customer/bills — paginated bills for this customer only
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

// GET /api/customer/readings — readings for this customer
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