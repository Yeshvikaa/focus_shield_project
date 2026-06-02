import express from 'express';
import { linkChild, getChildren, getChildReport } from '../controllers/parentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/link', protect, authorizeRoles('parent'), linkChild);
router.get('/children', protect, authorizeRoles('parent'), getChildren);
router.get('/child/:id/report', protect, authorizeRoles('parent'), getChildReport);

export default router;
