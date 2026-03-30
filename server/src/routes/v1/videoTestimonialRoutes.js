import express from 'express';
import { getAll, create, update, remove } from '../../controllers/VideoTestimonialController.js';
import { authenticate, restrictTo } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAll);

router.use(authenticate, restrictTo('admin', 'superAdmin'));
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
