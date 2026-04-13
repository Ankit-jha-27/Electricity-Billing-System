const Tariff = require('../models/Tariff');

exports.getTariffs = async (req, res) => {
  try {
    const tariffs = await Tariff.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tariffs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTariff = async (req, res) => {
  try {
    // Deactivate previous tariffs of same connection type
    await Tariff.updateMany({ connectionType: req.body.connectionType }, { isActive: false });
    const tariff = await Tariff.create(req.body);
    res.status(201).json({ success: true, data: tariff });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateTariff = async (req, res) => {
  try {
    const tariff = await Tariff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tariff) return res.status(404).json({ success: false, message: 'Tariff not found' });
    res.json({ success: true, data: tariff });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteTariff = async (req, res) => {
  try {
    await Tariff.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tariff deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};