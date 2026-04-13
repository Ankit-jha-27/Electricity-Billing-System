const User = require('../models/User');
const Customer = require('../models/Customer');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    // Public registration always creates a customer role user.
    // Admin/operator accounts must be created via seeder or by an existing admin.
    const user = await User.create({ name, email, password, role: 'customer' });

    // Auto-create a Customer record linked to this user account
    const customer = await Customer.create({
      name,
      email,
      phone: 'N/A',
      meterNumber: `MTR-${user._id.toString().slice(-6).toUpperCase()}`,
      connectionType: 'Domestic',
      connectionStatus: 'Inactive', // admin activates after verification
    });

    // Link the user to their customer record
    user.customerId = customer._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created. Your connection will be activated after verification.',
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
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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