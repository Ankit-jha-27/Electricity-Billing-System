const Registration = require('../models/Registration');
const Customer     = require('../models/Customer');
const User         = require('../models/User');

// GET /api/registrations — list all (filter by status)
exports.getRegistrations = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const query = status === 'all' ? {} : { status };
    const registrations = await Registration.find(query)
      .populate('user', 'name email createdAt')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    const pendingCount = await Registration.countDocuments({ status: 'pending' });
    res.json({ success: true, data: registrations, pendingCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/registrations/:id/approve
// Body: { meterNumber, connectionType, phone, sanctionedLoad, securityDeposit, address }
exports.approveRegistration = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id).populate('user');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    if (reg.status !== 'pending') return res.status(400).json({ success: false, message: 'Already reviewed' });

    const { meterNumber, connectionType, phone, sanctionedLoad, securityDeposit, address } = req.body;
    if (!meterNumber) return res.status(400).json({ success: false, message: 'Meter number is required' });

    // Create the Customer record
    const customer = await Customer.create({
      user:           reg.user._id,
      name:           reg.name,
      email:          reg.email,
      phone:          phone || reg.phone,
      address:        address || reg.address,
      connectionType: connectionType || reg.connectionType,
      connectionStatus: 'Active',
      meterNumber,
      sanctionedLoad:  sanctionedLoad  || 0,
      securityDeposit: securityDeposit || 0,
    });

    // Link the Customer record back to the User
    await User.findByIdAndUpdate(reg.user._id, { customerId: customer._id });

    // Mark registration as approved
    reg.status     = 'approved';
    reg.reviewedBy = req.user._id;
    reg.reviewedAt = new Date();
    await reg.save();

    res.json({ success: true, message: `${reg.name} approved. Customer ID: ${customer.customerId}`, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/registrations/:id/reject
// Body: { reason }
exports.rejectRegistration = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    if (reg.status !== 'pending') return res.status(400).json({ success: false, message: 'Already reviewed' });

    reg.status       = 'rejected';
    reg.reviewedBy   = req.user._id;
    reg.reviewedAt   = new Date();
    reg.rejectReason = req.body.reason || 'No reason provided';
    await reg.save();

    res.json({ success: true, message: `Registration for ${reg.name} rejected.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};