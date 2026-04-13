const express = require('express');
const router = express.Router();
const { getReadings, createReading, updateReading, deleteReading } = require('../controllers/readingController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getReadings).post(createReading);
router.route('/:id').put(updateReading).delete(deleteReading);

module.exports = router;