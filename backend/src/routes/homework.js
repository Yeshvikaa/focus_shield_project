import express from 'express';
import { createHomework, getHomeworkList, getHomeworkById, updateStudyTime } from '../controllers/homeworkController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('teacher'), upload.single('pdf'), createHomework);
router.get('/', protect, getHomeworkList);
router.get('/:id', protect, getHomeworkById);
router.post('/:id/study', protect, authorizeRoles('student'), updateStudyTime);

export default router;
