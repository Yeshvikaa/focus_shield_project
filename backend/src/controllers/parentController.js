import User from '../models/User.js';
import Submission from '../models/Submission.js';
import FocusSession from '../models/FocusSession.js';

// @desc    Link Student Child to Parent using Student's Parent Code
// @route   POST /api/parent/link
// @access  Private (Parent)
export const linkChild = async (req, res) => {
  const { parentCode } = req.body;

  try {
    if (!parentCode) {
      return res.status(400).json({ message: 'Please enter a valid Parent Code' });
    }

    // Find student with matching parentCode
    const student = await User.findOne({ parentCode, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'No student found with this Parent Code' });
    }

    if (student.parentId) {
      return res.status(400).json({ message: 'This student is already linked to a parent' });
    }

    // Set parentId link
    student.parentId = req.user.id;
    await student.save();

    res.json({
      message: `Successfully linked to child account: ${student.name}`,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        level: student.level,
        xp: student.xp,
        avatar: student.avatar
      }
    });
  } catch (error) {
    console.error('Link child error:', error);
    res.status(500).json({ message: 'Server error linking student account' });
  }
};

// @desc    Get Linked Children List (Parent only)
// @route   GET /api/parent/children
// @access  Private (Parent)
export const getChildren = async (req, res) => {
  try {
    const children = await User.find({ parentId: req.user.id }).select('name email avatar xp level streak lastActive');
    res.json(children);
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ message: 'Server error loading children list' });
  }
};

// @desc    Get Detailed Report for a Linked Child (Parent only)
// @route   GET /api/parent/child/:id/report
// @access  Private (Parent)
export const getChildReport = async (req, res) => {
  const childId = req.params.id;

  try {
    // Verify child is linked to this parent
    const child = await User.findOne({ _id: childId, parentId: req.user.id }).select('-password');
    if (!child) {
      return res.status(403).json({ message: 'Access denied. Student is not linked to this parent account.' });
    }

    // Homework submissions
    const submissions = await Submission.find({ student: childId }).populate('homework', 'title rewardXp minStudyTime');

    // Focus Session history
    const focusSessions = await FocusSession.find({ student: childId }).sort({ createdAt: -1 });

    // Sum focus times
    const successfulSessions = focusSessions.filter(s => s.status === 'completed');
    const totalFocusTime = successfulSessions.reduce((sum, s) => sum + s.duration, 0);

    // Distraction statistics
    const totalDistractions = focusSessions.reduce((sum, s) => sum + s.distractionCount, 0);
    
    // Flat list of all distractions
    let distractionTimeline = [];
    focusSessions.forEach(session => {
      session.distractionLogs.forEach(log => {
        distractionTimeline.push({
          sessionCreated: session.createdAt,
          timestamp: log.timestamp,
          type: log.type,
          details: log.details,
        });
      });
    });

    // Sort distraction timeline by newest first
    distractionTimeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      child: {
        _id: child._id,
        name: child.name,
        email: child.email,
        avatar: child.avatar,
        xp: child.xp,
        level: child.level,
        streak: child.streak,
        badges: child.badges,
      },
      stats: {
        totalFocusTime, // seconds
        totalDistractions,
        completedHomeworkCount: submissions.filter(s => s.status === 'completed').length,
        totalHomeworkCount: submissions.length,
      },
      submissions,
      focusSessions: focusSessions.slice(0, 10), // Limit list to last 10
      distractions: distractionTimeline.slice(0, 20), // Limit to last 20 events
    });
  } catch (error) {
    console.error('Get child report error:', error);
    res.status(500).json({ message: 'Server error retrieving student report' });
  }
};
