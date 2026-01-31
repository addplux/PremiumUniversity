const express = require('express');
const router = express.Router();
const { getContracts, createContract, getExpiringContracts } = require('../controllers/contractController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'procurement_manager'));

router.route('/')
    .get(getContracts)
    .post(createContract);

router.get('/expiring', getExpiringContracts);

module.exports = router;
