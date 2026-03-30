const express = require('express');
const { getAll, create, update, remove } = require('../../controllers/VideoTestimonialController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');

const router = express.Router();

router.get('/', getAll);

router.use(protect, restrictTo('admin', 'superAdmin'));
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
