const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const Reading = require('../models/Reading');

const toCSV = (headers, rows) => {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = headers.map(h => escape(h.label)).join(',');
  const body = rows.map(row => headers.map(h => escape(row[h.key])).join(',')).join('\n');
  return `${head}\n${body}`;
};

exports.customerReport = async (req, res) => {
  try {
    const { connectionType, connectionStatus, format = 'json' } = req.query;
    const query = {};
    if (connectionType) query.connectionType = connectionType;
    if (connectionStatus) query.connectionStatus = connectionStatus;

    const customers = await Customer.find(query).sort({ name: 1 }).lean();

    if (format === 'csv') {
      const headers = [
        { key: 'customerId', label: 'Customer ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'connectionType', label: 'Connection Type' },
        { key: 'connectionStatus', label: 'Status' },
        { key: 'meterNumber', label: 'Meter No.' },
        { key: 'sanctionedLoad', label: 'Sanctioned Load (kW)' },
        { key: 'outstandingBalance', label: 'Outstanding (₹)' },
      ];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
      return res.send(toCSV(headers, customers));
    }
    res.json({ success: true, data: customers, total: customers.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.billReport = async (req, res) => {
  try {
    const { month, paymentStatus, format = 'json' } = req.query;
    const query = {};
    if (month) query.billMonth = month;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const bills = await Bill.find(query).populate('customer', 'name customerId meterNumber').sort({ billDate: -1 }).lean();

    if (format === 'csv') {
      const rows = bills.map(b => ({
        billNumber: b.billNumber,
        customerName: b.customer?.name,
        customerId: b.customer?.customerId,
        billMonth: b.billMonth,
        units: b.unitsConsumed,
        totalAmount: b.totalAmount,
        amountPaid: b.amountPaid,
        balanceDue: b.balanceDue,
        paymentStatus: b.paymentStatus,
        billDate: new Date(b.billDate).toLocaleDateString(),
        dueDate: new Date(b.dueDate).toLocaleDateString(),
      }));
      const headers = [
        { key: 'billNumber', label: 'Bill Number' },
        { key: 'customerName', label: 'Customer' },
        { key: 'customerId', label: 'Customer ID' },
        { key: 'billMonth', label: 'Bill Month' },
        { key: 'units', label: 'Units Consumed' },
        { key: 'totalAmount', label: 'Total Amount (₹)' },
        { key: 'amountPaid', label: 'Amount Paid (₹)' },
        { key: 'balanceDue', label: 'Balance Due (₹)' },
        { key: 'paymentStatus', label: 'Payment Status' },
        { key: 'billDate', label: 'Bill Date' },
        { key: 'dueDate', label: 'Due Date' },
      ];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bills.csv');
      return res.send(toCSV(headers, rows));
    }
    res.json({ success: true, data: bills, total: bills.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.readingReport = async (req, res) => {
  try {
    const { month, status, format = 'json' } = req.query;
    const query = {};
    if (month) query.readingMonth = month;
    if (status) query.status = status;

    const readings = await Reading.find(query).populate('customer', 'name customerId meterNumber').sort({ readingDate: -1 }).lean();

    if (format === 'csv') {
      const rows = readings.map(r => ({
        customerName: r.customer?.name,
        customerId: r.customer?.customerId,
        meterNumber: r.meterNumber,
        previousReading: r.previousReading,
        currentReading: r.currentReading,
        unitsConsumed: r.unitsConsumed,
        readingMonth: r.readingMonth,
        readingDate: new Date(r.readingDate).toLocaleDateString(),
        status: r.status,
      }));
      const headers = [
        { key: 'customerName', label: 'Customer' },
        { key: 'customerId', label: 'Customer ID' },
        { key: 'meterNumber', label: 'Meter No.' },
        { key: 'previousReading', label: 'Previous Reading' },
        { key: 'currentReading', label: 'Current Reading' },
        { key: 'unitsConsumed', label: 'Units Consumed' },
        { key: 'readingMonth', label: 'Month' },
        { key: 'readingDate', label: 'Reading Date' },
        { key: 'status', label: 'Status' },
      ];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=readings.csv');
      return res.send(toCSV(headers, rows));
    }
    res.json({ success: true, data: readings, total: readings.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};