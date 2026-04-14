const express = require('express');
const router = express.Router();
const { getMyProfile, getMyBills, getMyReadings, payMyBill } = require('../controllers/customerPortalController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('customer'));

router.get('/me',              getMyProfile);
router.get('/bills',           getMyBills);
router.get('/readings',        getMyReadings);
router.post('/bills/:id/pay',  payMyBill);

module.exports = router;