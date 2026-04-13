const express = require('express');
const router = express.Router();
const { getBills, getBill, generateBill, recordPayment, deleteBill } = require('../controllers/billController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getBills).post(generateBill);
router.route('/:id').get(getBill).delete(deleteBill);
router.put('/:id/payment', recordPayment);

module.exports = router;