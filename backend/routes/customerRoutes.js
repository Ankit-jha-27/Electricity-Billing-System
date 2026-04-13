const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, getCustomerStats } = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getCustomerStats);
router.route('/').get(getCustomers).post(createCustomer);
router.route('/:id').get(getCustomer).put(updateCustomer).delete(deleteCustomer);

module.exports = router;