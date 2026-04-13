const express = require('express');
const router = express.Router();
const { customerReport, billReport, readingReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/customers', customerReport);
router.get('/bills', billReport);
router.get('/readings', readingReport);

module.exports = router;