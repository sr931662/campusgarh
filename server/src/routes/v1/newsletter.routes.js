import express from 'express';
import { subscribe, unsubscribe, getAllSubscribers } from '../controllers/newsletter.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/subscribers', protect, restrictTo('admin'), getAllSubscribers);

export default router;
