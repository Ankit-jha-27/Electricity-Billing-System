const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    unique: true,
    required: true,
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  connectionType: {
    type: String,
    enum: ['Domestic', 'Commercial', 'Industrial', 'Agricultural'],
    default: 'Domestic',
  },
  connectionStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Disconnected'],
    default: 'Active',
  },
  meterNumber: { type: String, unique: true, required: true },
  sanctionedLoad: { type: Number, default: 0 }, // in kW
  connectionDate: { type: Date, default: Date.now },
  securityDeposit: { type: Number, default: 0 },
  outstandingBalance: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate customerId before save
customerSchema.pre('save', async function (next) {
  if (!this.customerId) {
    const count = await mongoose.model('Customer').countDocuments();
    this.customerId = `CUST${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);