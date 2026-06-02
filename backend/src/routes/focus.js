import express from 'express';
import { startSession, logDistraction, endSession } from '../controllers/focusController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/start', protect, authorizeRoles('student'), startSession);
router.post('/:id/distraction', protect, authorizeRoles('student'), logDistraction);
router.post('/:id/end', protect, authorizeRoles('student'), endSession);

export default router;
