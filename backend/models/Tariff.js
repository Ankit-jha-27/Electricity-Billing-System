const mongoose = require('mongoose');

const tariffSlabSchema = new mongoose.Schema({
  fromUnit: Number,
  toUnit: Number,   // null means unlimited
  ratePerUnit: Number,
});

const tariffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  connectionType: {
    type: String,
    enum: ['Domestic', 'Commercial', 'Industrial', 'Agricultural'],
    required: true,
  },
  slabs: [tariffSlabSchema],
  fixedCharge: { type: Number, default: 0 },   // per month
  fuelAdjustmentCharge: { type: Number, default: 0 }, // per unit
  electricityDutyPercent: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  effectiveFrom: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Tariff', tariffSchema);