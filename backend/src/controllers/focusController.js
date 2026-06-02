import FocusSession from '../models/FocusSession.js';
import User from '../models/User.js';
import Reward from '../models/Reward.js';
import Notification from '../models/Notification.js';

// @desc    Start Focus Session (Student only)
// @route   POST /api/focus/start
// @access  Private (Student)
export const startSession = async (req, res) => {
  const { duration } = req.body; // Planned focus duration in seconds

  try {
    const session = await FocusSession.create({
      student: req.user.id,
      duration: Number(duration || 300), // Default 5 minutes
      distractionCount: 0,
      distractionLogs: [],
      status: 'completed', // Defaults to completed, updated if failed
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Start focus session error:', error);
    res.status(500).json({ message: 'Server error starting focus mode' });
  }
};

// @desc    Log Distraction (Student only)
// @route   POST /api/focus/:id/distraction
// @access  Private (Student)
export const logDistraction = async (req, res) => {
  const sessionId = req.params.id;
  const { type, details } = req.body; // type: 'blur' | 'tab-switch'

  try {
    const session = await FocusSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Active focus session not found' });
    }

    // Add log entry
    session.distractionCount += 1;
    session.distractionLogs.push({
      type,
      details: details || `Switched browser window/tab during study.`,
      timestamp: new Date()
    });

    // Check penalty levels
    let penaltyAction = 'warning'; // 1st distraction: warning
    if (session.distractionCount === 2) {
      penaltyAction = 'distracted_session_logged'; // 2nd distraction: logged as distracted
      session.status = 'failed_distracted';
    } else if (session.distractionCount >= 3) {
      penaltyAction = 'restart_session'; // 3rd distraction: restart focus session
      session.status = 'failed_distracted';
    }

    await session.save();

    // Create notifications for Student
    await Notification.create({
      user: req.user.id,
      type: 'distraction',
      content: `Focus Shield Warning: Distraction detected! (${type}). Alert Level: ${session.distractionCount}/3`,
    });

    // If student has a linked Parent, notify them immediately
    const student = await User.findById(req.user.id);
    if (student.parentId) {
      await Notification.create({
        user: student.parentId,
        type: 'distraction',
        content: `Alert: Distraction logged for ${student.name}. Switched tab/window during lock study. Total distractions: ${session.distractionCount}.`,
      });
    }

    res.json({
      session,
      penaltyAction,
      message: `Distraction registered (${session.distractionCount}/3 warnings)`
    });
  } catch (error) {
    console.error('Log distraction error:', error);
    res.status(500).json({ message: 'Server error logging distraction' });
  }
};

// @desc    End Focus Session Successfully (Student only)
// @route   POST /api/focus/:id/end
// @access  Private (Student)
export const endSession = async (req, res) => {
  const sessionId = req.params.id;
  const { actualDuration } = req.body; // actual duration focused in seconds

  try {
    const session = await FocusSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Focus session not found' });
    }

    // If they got too distracted, keep failed state, otherwise complete
    if (session.distractionCount < 2) {
      session.status = 'completed';
    }
    
    // Update actual duration if provided
    if (actualDuration) {
      session.duration = Number(actualDuration);
    }
    await session.save();

    let xpEarned = 0;
    let badgeUnlocked = null;

    if (session.status === 'completed') {
      // Award focus XP (e.g. 10 XP for 5 minutes, 20 XP for 10 minutes etc.)
      const mins = Math.floor(session.duration / 60);
      xpEarned = Math.max(5, mins * 2); // Minimum 5 XP, 2 XP per minute

      const student = await User.findById(req.user.id);
      student.xp += xpEarned;

      // Level check
      const newLevel = Math.floor(student.xp / 100) + 1;
      if (newLevel > student.level) {
        student.level = newLevel;
      }

      // Gamification Check: Award Focus Master badge if they focus for 10 mins (600s) with 0 distractions
      if (session.duration >= 600 && session.distractionCount === 0 && !student.badges.includes('focus_master')) {
        student.badges.push('focus_master');
        badgeUnlocked = 'Focus Master';
        await Reward.create({ student: student._id, type: 'badge', itemKey: 'focus_master' });
      }

      await student.save();

      // Create completion notification
      await Notification.create({
        user: req.user.id,
        type: 'motivation',
        content: `Great work! Focus session completed successfully. Earned ${xpEarned} XP.`,
      });
    }

    res.json({
      session,
      xpEarned,
      badgeUnlocked
    });
  } catch (error) {
    console.error('End focus session error:', error);
    res.status(500).json({ message: 'Server error ending session' });
  }
};
