const express = require('express');
const router = express.Router();
const { getMyProfile, getMyBills, getMyReadings } = require('../controllers/customerPortalController');
const { protect, authorize } = require('../middleware/auth');

// All routes require login AND customer role
router.use(protect);
router.use(authorize('customer'));

router.get('/me',       getMyProfile);
router.get('/bills',    getMyBills);
router.get('/readings', getMyReadings);

module.exports = router;