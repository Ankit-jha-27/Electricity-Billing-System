const express = require('express');
const router = express.Router();
const { getTariffs, createTariff, updateTariff, deleteTariff } = require('../controllers/tariffController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getTariffs).post(createTariff);
router.route('/:id').put(updateTariff).delete(deleteTariff);

module.exports = router;