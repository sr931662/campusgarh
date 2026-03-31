const express = require('express');
const controller = require('../../controllers/partnerController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');
const partnerRoutes = require('./partnerRoutes');

const router = express.Router();

router.post('/apply', controller.apply);                                    // public
router.get('/', protect, restrictTo('admin'), controller.getAll);          // admin
router.patch('/:id/status', protect, restrictTo('admin'), controller.updateStatus); // admin
router.use('/partners', partnerRoutes);

module.exports = router;
