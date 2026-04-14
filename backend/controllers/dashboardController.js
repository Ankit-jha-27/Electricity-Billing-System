const Customer     = require('../models/Customer');
const Bill         = require('../models/Bill');
const Reading      = require('../models/Reading');
const Registration = require('../models/Registration');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      totalBills,
      unpaidBills,
      overdueB,
      recentBills,
      monthlyRevenue,
      pendingReadings,
      pendingRegistrations,
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ connectionStatus: 'Active' }),
      Bill.countDocuments(),
      Bill.countDocuments({ paymentStatus: 'Unpaid' }),
      Bill.countDocuments({ paymentStatus: 'Overdue' }),
      Bill.find().populate('customer', 'name customerId').sort({ createdAt: -1 }).limit(5),
      Bill.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: {
          _id: { $substr: ['$billMonth', 0, 7] },
          revenue: { $sum: '$amountPaid' },
          count: { $sum: 1 },
        }},
        { $sort: { _id: -1 } },
        { $limit: 6 },
      ]),
      Reading.countDocuments({ status: 'Pending' }),
      Registration.countDocuments({ status: 'pending' }),
    ]);

    const totalRevenue = await Bill.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);

    const pendingRevenue = await Bill.aggregate([
      { $match: { paymentStatus: { $in: ['Unpaid', 'Overdue', 'Partial'] } } },
      { $group: { _id: null, total: { $sum: '$balanceDue' } } },
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        totalBills,
        unpaidBills,
        overdueB,
        pendingReadings,
        pendingRegistrations,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingRevenue: pendingRevenue[0]?.total || 0,
        recentBills,
        monthlyRevenue: monthlyRevenue.reverse(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};