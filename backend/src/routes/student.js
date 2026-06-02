import express from 'express';
import { 
  getDashboardStats, 
  getNotifications, 
  markNotificationRead, 
  claimReward, 
  updateProfile 
} from '../controllers/studentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('student'), getDashboardStats);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id', protect, markNotificationRead);
router.post('/shop/purchase', protect, authorizeRoles('student'), claimReward);
router.put('/profile', protect, authorizeRoles('student'), updateProfile);

export default router;
