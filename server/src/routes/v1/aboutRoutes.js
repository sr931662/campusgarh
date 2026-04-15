const express = require('express');
const router  = express.Router();
const { getAbout, updateAbout } = require('../../controllers/aboutController');
const { protect, restrictTo } = require('../../middleware/auth');

router.get('/', getAbout);
router.put('/', protect, restrictTo('admin'), updateAbout);

module.exports = router;
