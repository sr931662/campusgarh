const express = require('express');
const ctrl = require('../../controllers/featuredLinkController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');

const router = express.Router();

router.get('/',        ctrl.getAll);                                     // public
router.post('/',       protect, restrictTo('admin'), ctrl.create);
router.patch('/:id',   protect, restrictTo('admin'), ctrl.update);
router.delete('/:id',  protect, restrictTo('admin'), ctrl.remove);

module.exports = router;
