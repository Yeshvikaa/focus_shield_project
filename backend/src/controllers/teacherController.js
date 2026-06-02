import User from '../models/User.js';
import Homework from '../models/Homework.js';
import Submission from '../models/Submission.js';
import FocusSession from '../models/FocusSession.js';

// @desc    Get Class-wide Analytics Summary (Teacher only)
// @route   GET /api/teacher/analytics
// @access  Private (Teacher)
export const getClassAnalytics = async (req, res) => {
  try {
    // 1. Student rankings (sorted by XP descending)
    const rankings = await User.find({ role: 'student' })
      .select('name email xp level avatar streak')
      .sort({ xp: -1 });

    // 2. Class Summary Stats (completion rates & average quiz score)
    const submissions = await Submission.find().populate('homework');
    
    let totalScore = 0;
    let gradedCount = 0;
    let completedCount = 0;
    const totalSubmissions = submissions.length;

    // Map homework stats
    const homeworkStats = {};
    const homeworksList = await Homework.find({ teacher: req.user.id });
    homeworksList.forEach(hw => {
      homeworkStats[hw._id.toString()] = {
        title: hw.title,
        attempts: 0,
        completions: 0,
        totalScores: 0,
        completedSubmissions: 0
      };
    });

    submissions.forEach(sub => {
      const hwId = sub.homework?._id?.toString();
      if (hwId && homeworkStats[hwId]) {
        homeworkStats[hwId].attempts += sub.attempts;
        if (sub.status === 'completed') {
          homeworkStats[hwId].completions += 1;
        }
      }

      if (sub.status === 'completed') {
        completedCount++;
      }
    });

    const completionRate = totalSubmissions > 0 ? Math.round((completedCount / totalSubmissions) * 100) : 0;

    // 3. Weak Area Detection
    // Aggregate quizzes to find average attempts or scores
    // Find topics where quiz failed attempts is high or average status completed is low
    const weakAreas = [];
    for (const hwId in homeworkStats) {
      const stats = homeworkStats[hwId];
      // If average attempts > 1.5, mark as a difficult topic
      const totalStudents = rankings.length;
      const completionPct = totalStudents > 0 ? Math.round((stats.completions / totalStudents) * 100) : 0;
      
      if (completionPct < 50) {
        weakAreas.push({
          topic: stats.title,
          difficulty: 'High',
          suggestion: 'Review key concepts of this PDF in the next session. Students are struggling to unlock/pass the MCQ quiz.',
        });
      } else if (stats.attempts > stats.completions * 1.5) {
        weakAreas.push({
          topic: stats.title,
          difficulty: 'Medium',
          suggestion: 'High reattempt count. Provide extra review questions or clarification on this topic.',
        });
      }
    }

    // Default weak area warning if none found
    if (weakAreas.length === 0) {
      weakAreas.push({
        topic: 'None detected',
        difficulty: 'Low',
        suggestion: 'Keep up the current teaching pace. Students are passing quizzes within normal attempts.',
      });
    }

    // 4. Performance trends over homeworks
    const performanceTrend = [];
    for (const hwId in homeworkStats) {
      const stats = homeworkStats[hwId];
      const totalStudents = rankings.length;
      performanceTrend.push({
        name: stats.title.substring(0, 12) + '...',
        completionRate: totalStudents > 0 ? Math.round((stats.completions / totalStudents) * 100) : 0,
      });
    }

    res.json({
      summary: {
        totalStudents: rankings.length,
        totalHomeworks: homeworksList.length,
        completionRate,
        averageAttempts: totalSubmissions > 0 
          ? (submissions.reduce((acc, sub) => acc + sub.attempts, 0) / totalSubmissions).toFixed(1) 
          : 0,
      },
      rankings,
      weakAreas,
      performanceTrend
    });
  } catch (error) {
    console.error('Get class analytics error:', error);
    res.status(500).json({ message: 'Server error compiling teacher stats' });
  }
};
