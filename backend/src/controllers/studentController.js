import User from '../models/User.js';
import Submission from '../models/Submission.js';
import FocusSession from '../models/FocusSession.js';
import Notification from '../models/Notification.js';
import Reward from '../models/Reward.js';
import Homework from '../models/Homework.js';

// @desc    Get Student Dashboard Stats
// @route   GET /api/student/dashboard
// @access  Private (Student)
export const getDashboardStats = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    
    // Update streak based on last active timestamp
    const now = new Date();
    const lastActiveDate = new Date(student.lastActive);
    
    // Check day difference (ignore hours)
    const diffTime = Math.abs(now.setHours(0,0,0,0) - lastActiveDate.setHours(0,0,0,0));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      student.streak += 1;
      student.lastActive = new Date();
      // Check Badge: Gold Streak (streak >= 7)
      if (student.streak >= 7 && !student.badges.includes('gold_streak')) {
        student.badges.push('gold_streak');
        await Reward.create({ student: student._id, type: 'badge', itemKey: 'gold_streak' });
      }
      await student.save();
    } else if (diffDays > 1) {
      student.streak = 1; // Reset to 1 day active
      student.lastActive = new Date();
      await student.save();
    }

    // Homework Aggregates
    const totalHomeworks = await Homework.countDocuments();
    const completedHomeworks = await Submission.countDocuments({ student: student._id, status: 'completed' });

    // Focus Session Aggregates
    const focusSessions = await FocusSession.find({ student: student._id, status: 'completed' });
    const totalFocusTime = focusSessions.reduce((acc, sess) => acc + sess.duration, 0); // in seconds
    const totalDistractions = await FocusSession.aggregate([
      { $match: { student: student._id } },
      { $group: { _id: null, total: { $sum: '$distractionCount' } } }
    ]);
    const totalDistractionsCount = totalDistractions[0]?.total || 0;

    // Next upcoming homework due
    const upcomingHomework = await Homework.findOne({ dueDate: { $gte: new Date() } })
      .sort({ dueDate: 1 })
      .select('title dueDate');

    res.json({
      xp: student.xp,
      level: student.level,
      streak: student.streak,
      badges: student.badges,
      totalHomeworks,
      completedHomeworks,
      totalFocusTime, // in seconds
      totalDistractions: totalDistractionsCount,
      upcomingHomework,
    });
  } catch (error) {
    console.error('Get student dashboard stats error:', error);
    res.status(500).json({ message: 'Server error loading dashboard' });
  }
};

// @desc    Get Student Notifications
// @route   GET /api/student/notifications
// @access  Private (Student/Teacher/Parent)
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark Notification as Read
// @route   PUT /api/student/notifications/:id
// @access  Private
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Shop Purchase: Themes or Avatars using XP
// @route   POST /api/student/shop/purchase
// @access  Private (Student)
export const claimReward = async (req, res) => {
  const { type, itemKey, xpCost } = req.body; // type: 'avatar' | 'theme', xpCost: e.g. 100 XP

  try {
    const student = await User.findById(req.user.id);
    if (student.xp < xpCost) {
      return res.status(400).json({ message: 'Insufficient XP points to purchase this item' });
    }

    if (type === 'avatar') {
      if (student.unlockedAvatars.includes(itemKey)) {
        return res.status(400).json({ message: 'Avatar already unlocked' });
      }
      student.unlockedAvatars.push(itemKey);
    } else if (type === 'theme') {
      if (student.unlockedThemes.includes(itemKey)) {
        return res.status(400).json({ message: 'Theme already unlocked' });
      }
      student.unlockedThemes.push(itemKey);
    } else {
      return res.status(400).json({ message: 'Invalid reward item type' });
    }

    // Deduct XP
    student.xp -= xpCost;
    await student.save();

    // Log Reward collection
    await Reward.create({
      student: student._id,
      type,
      itemKey,
    });

    res.json({
      xp: student.xp,
      unlockedAvatars: student.unlockedAvatars,
      unlockedThemes: student.unlockedThemes,
      message: 'Purchase successful!'
    });
  } catch (error) {
    console.error('Shop purchase error:', error);
    res.status(500).json({ message: 'Server error processing transaction' });
  }
};

// @desc    Update Student Profile Avatar
// @route   PUT /api/student/profile
// @access  Private (Student)
export const updateProfile = async (req, res) => {
  const { avatar } = req.body;

  try {
    const student = await User.findById(req.user.id);
    
    // Verify user owns the avatar
    if (avatar && !student.unlockedAvatars.includes(avatar)) {
      return res.status(400).json({ message: 'This avatar is locked. Unlock it in the shop!' });
    }

    if (avatar) student.avatar = avatar;
    await student.save();

    res.json({
      name: student.name,
      avatar: student.avatar,
      xp: student.xp,
      level: student.level,
      unlockedAvatars: student.unlockedAvatars,
      unlockedThemes: student.unlockedThemes,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
