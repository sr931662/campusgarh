const express = require('express');
const { subscribe, unsubscribe, getAllSubscribers } = require('../../controllers/newsletter.controller');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/subscribers', protect, restrictTo('admin'), getAllSubscribers);

module.exports = router;
