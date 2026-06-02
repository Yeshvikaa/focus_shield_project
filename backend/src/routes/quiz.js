import express from 'express';
import { createQuiz, submitQuiz } from '../controllers/quizController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('teacher'), createQuiz);
router.post('/:id/submit', protect, authorizeRoles('student'), submitQuiz);

export default router;
