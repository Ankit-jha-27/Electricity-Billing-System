const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  reading: { type: mongoose.Schema.Types.ObjectId, ref: 'Reading' },
  billMonth: { type: String, required: true }, // "2024-01"
  billDate: { type: Date, default: Date.now },
  dueDate: { type: Date },

  // Consumption
  previousReading: { type: Number, required: true },
  currentReading: { type: Number, required: true },
  unitsConsumed: { type: Number, required: true },

  // Charges breakdown
  energyCharges: { type: Number, default: 0 },
  fixedCharges: { type: Number, default: 0 },
  fuelAdjustmentCharge: { type: Number, default: 0 },
  electricityDuty: { type: Number, default: 0 },
  subsidyAmount: { type: Number, default: 0 },
  arrears: { type: Number, default: 0 },
  surcharge: { type: Number, default: 0 },
  otherCharges: { type: Number, default: 0 },

  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },

  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partial', 'Paid', 'Overdue'],
    default: 'Unpaid',
  },
  paymentDate: { type: Date },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Online', 'Cheque', 'UPI', 'Card', ''],
    default: '',
  },
  transactionId: { type: String },
  remarks: { type: String },
}, { timestamps: true });

billSchema.pre('save', async function (next) {
  if (!this.billNumber) {
    const count = await mongoose.model('Bill').countDocuments();
    this.billNumber = `BILL${String(count + 1).padStart(6, '0')}`;
  }
  if (!this.dueDate) {
    const d = new Date(this.billDate);
    d.setDate(d.getDate() + 30);
    this.dueDate = d;
  }
  this.balanceDue = this.totalAmount - this.amountPaid;
  if (this.amountPaid >= this.totalAmount) this.paymentStatus = 'Paid';
  else if (this.amountPaid > 0) this.paymentStatus = 'Partial';
  else if (new Date() > this.dueDate) this.paymentStatus = 'Overdue';
  next();
});

module.exports = mongoose.model('Bill', billSchema);