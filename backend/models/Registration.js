const mongoose = require('mongoose');

// Stores pending registration requests submitted via the public register form.
// Admin reviews these and either approves (creates Customer record + links User)
// or rejects them.
const registrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name:  { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  address: {
    street: String,
    city:   String,
    state:  String,
    pincode: String,
  },
  connectionType: {
    type: String,
    enum: ['Domestic', 'Commercial', 'Industrial', 'Agricultural'],
    default: 'Domestic',
  },
  message: { type: String, default: '' }, // optional note from applicant

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:  { type: Date, default: null },
  rejectReason: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);