import express from 'express';
import { getClassAnalytics } from '../controllers/teacherController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/analytics', protect, authorizeRoles('teacher'), getClassAnalytics);

export default router;
