const express = require('express');
const router  = express.Router();
const { getRegistrations, approveRegistration, rejectRegistration } = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'operator'));

router.get('/',                    getRegistrations);
router.post('/:id/approve',        approveRegistration);
router.post('/:id/reject',         rejectRegistration);

module.exports = router;