const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  meterNumber: { type: String, required: true },
  previousReading: { type: Number, required: true },
  currentReading: { type: Number, required: true },
  unitsConsumed: { type: Number },
  readingDate: { type: Date, default: Date.now },
  readingMonth: { type: String }, // e.g. "2024-01"
  readingBy: { type: String, default: 'System' },
  status: {
    type: String,
    enum: ['Pending', 'Billed', 'Estimated'],
    default: 'Pending',
  },
  remarks: { type: String },
}, { timestamps: true });

readingSchema.pre('save', function (next) {
  this.unitsConsumed = this.currentReading - this.previousReading;
  if (!this.readingMonth) {
    const d = new Date(this.readingDate);
    this.readingMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Reading', readingSchema);