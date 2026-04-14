const User         = require('../models/User');
const Registration = require('../models/Registration');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, connectionType, address, message, role } = req.body;

    // Check duplicate email in both User and Registration
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    // 1. Create login credentials
    const user = await User.create({ name, email, password, role});

    // 2. Create a pending registration request for admin review
    await Registration.create({
      user:  user._id,
      name,
      email,
      phone:          phone || '',
      connectionType: connectionType || 'Domestic',
      address:        address || {},
      message:        message || '',
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted. An admin will review and activate your connection shortly.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = user.getSignedToken();
    res.json({
      success: true,
      token,
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        role:       user.role,
        customerId: user.customerId || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};