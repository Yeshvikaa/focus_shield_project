import Quiz from '../models/Quiz.js';
import Homework from '../models/Homework.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Reward from '../models/Reward.js';
import Notification from '../models/Notification.js';

// @desc    Create Quiz (Teacher only)
// @route   POST /api/quiz
// @access  Private (Teacher)
export const createQuiz = async (req, res) => {
  const { homeworkId, title, questions, timeLimit } = req.body;

  try {
    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ message: 'Linked homework not found' });
    }

    // Check if quiz already exists for this homework
    const quizExists = await Quiz.findOne({ homework: homeworkId });
    if (quizExists) {
      return res.status(400).json({ message: 'Quiz already exists for this homework' });
    }

    const quiz = await Quiz.create({
      homework: homeworkId,
      title,
      questions,
      timeLimit: Number(timeLimit || 120),
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error creating quiz', error: error.message });
  }
};

// @desc    Submit Quiz Answers & Grade (Student only)
// @route   POST /api/quiz/:id/submit
// @access  Private (Student)
export const submitQuiz = async (req, res) => {
  const quizId = req.params.id;
  const { answers } = req.body; // Array of selected indices, matching questions list index

  try {
    const quiz = await Quiz.findById(quizId).populate('homework');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const submission = await Submission.findOne({ student: req.user.id, homework: quiz.homework._id });
    if (!submission) {
      return res.status(400).json({ message: 'No study logs found. You must study the PDF first!' });
    }

    if (!submission.pdfCompleted) {
      return res.status(400).json({ message: 'Study lock is active. You must complete PDF reading timer first!' });
    }

    // Grade Quiz
    const questions = quiz.questions;
    let correctCount = 0;
    const totalQuestions = questions.length;

    questions.forEach((q, index) => {
      const studentAnswer = answers[index];
      if (studentAnswer !== undefined && studentAnswer === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70; // 70% Passing Threshold

    submission.attempts += 1;
    submission.updatedAt = new Date();

    let xpEarned = 0;
    let levelUpOccurred = false;
    let badgesUnlocked = [];

    if (passed) {
      submission.quizCompleted = true;
      submission.status = 'completed';
      
      // Award XP
      xpEarned = quiz.homework.rewardXp;
      const student = await User.findById(req.user.id);
      
      // Add XP
      student.xp += xpEarned;
      
      // Calculate level (every 100 XP is a level)
      const newLevel = Math.floor(student.xp / 100) + 1;
      if (newLevel > student.level) {
        student.level = newLevel;
        levelUpOccurred = true;
      }

      // Gamification Check: Award Badges
      // 1. Study Champion (Completed first homework)
      const completedCount = await Submission.countDocuments({ student: student._id, status: 'completed' });
      if (completedCount === 0 && !student.badges.includes('study_champion')) {
        student.badges.push('study_champion');
        badgesUnlocked.push('Study Champion');
        await Reward.create({ student: student._id, type: 'badge', itemKey: 'study_champion' });
      }

      // Save Student Profile
      await student.save();

      // Send Peer Motivation notification: Classmate completed task
      const otherStudents = await User.find({ role: 'student', _id: { $ne: student._id } }).limit(5);
      for (const peer of otherStudents) {
        await Notification.create({
          user: peer._id,
          type: 'motivation',
          content: `${student.name} just completed "${quiz.homework.title}" and earned ${xpEarned} XP! Keep going!`,
        });
      }

    } else {
      // STRICT DISCIPLINE LOOP RESETS state!
      // Fail -> Retry study required
      submission.pdfCompleted = false;
      submission.pdfStudyTime = 0;
      submission.status = 'studying';

      // Log Notification
      await Notification.create({
        user: req.user.id,
        type: 'streak',
        content: `You failed the quiz for "${quiz.homework.title}" (Score: ${score}%). Lock activated! Re-read the study PDF to reattempt.`,
      });
    }

    await submission.save();

    res.json({
      passed,
      score,
      correctCount,
      totalQuestions,
      attempts: submission.attempts,
      xpEarned,
      levelUpOccurred,
      badgesUnlocked,
      nextStep: passed ? 'completed' : 'studying'
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: 'Server error scoring quiz' });
  }
};
