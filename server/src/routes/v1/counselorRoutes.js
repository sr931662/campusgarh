const express = require('express');
const router  = express.Router();
const { getAll, getAllAdmin, create, update, remove } = require('../../controllers/counselorController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');

router.get('/', getAll);
router.get('/admin/all', protect, restrictTo('admin'), getAllAdmin);
router.post('/', protect, restrictTo('admin'), create);
router.patch('/:id', protect, restrictTo('admin'), update);
router.delete('/:id', protect, restrictTo('admin'), remove);

module.exports = router;
