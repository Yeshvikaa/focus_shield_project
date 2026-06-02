import Homework from '../models/Homework.js';
import Submission from '../models/Submission.js';
import Quiz from '../models/Quiz.js';

// @desc    Create Homework (Teacher only)
// @route   POST /api/homework
// @access  Private (Teacher)
export const createHomework = async (req, res) => {
  const { title, description, minStudyTime, rewardXp, dueDate } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF study document' });
    }

    const homework = await Homework.create({
      title,
      description,
      pdfPath: req.file.path.replace(/\\/g, '/'), // Standardize slashes
      minStudyTime: Number(minStudyTime || 60),
      rewardXp: Number(rewardXp || 50),
      teacher: req.user.id,
      dueDate: new Date(dueDate),
    });

    res.status(201).json(homework);
  } catch (error) {
    console.error('Create homework error:', error);
    res.status(500).json({ message: 'Server error creating homework', error: error.message });
  }
};

// @desc    Get Homework List (Student/Teacher filter)
// @route   GET /api/homework
// @access  Private
export const getHomeworkList = async (req, res) => {
  try {
    let homeworks;
    if (req.user.role === 'teacher') {
      homeworks = await Homework.find({ teacher: req.user.id }).sort({ createdAt: -1 });
      return res.json(homeworks);
    } else if (req.user.role === 'student') {
      homeworks = await Homework.find().sort({ createdAt: -1 }).populate('teacher', 'name email');
      
      // Pull student submissions
      const submissions = await Submission.find({ student: req.user.id });
      const submissionMap = {};
      submissions.forEach(sub => {
        submissionMap[sub.homework.toString()] = sub;
      });

      // Merge submission details into homework
      const mergedHomeworks = homeworks.map(hw => {
        const submission = submissionMap[hw._id.toString()];
        return {
          ...hw.toObject(),
          submission: submission || {
            pdfStudyTime: 0,
            pdfCompleted: false,
            quizCompleted: false,
            attempts: 0,
            status: 'studying'
          }
        };
      });

      return res.json(mergedHomeworks);
    } else {
      // Parent role - returns all homeworks or parent has a custom route
      homeworks = await Homework.find().sort({ createdAt: -1 }).populate('teacher', 'name');
      return res.json(homeworks);
    }
  } catch (error) {
    console.error('Get homework list error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get Homework by ID
// @route   GET /api/homework/:id
// @access  Private
export const getHomeworkById = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id).populate('teacher', 'name email');
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    let submission = null;
    let quiz = null;

    if (req.user.role === 'student') {
      submission = await Submission.findOne({ student: req.user.id, homework: homework._id });
      if (!submission) {
        // Create initial submission
        submission = await Submission.create({
          student: req.user.id,
          homework: homework._id,
        });
      }
      quiz = await Quiz.findOne({ homework: homework._id }).select('-questions.correctAnswerIndex'); // Hide answers from students
    } else {
      quiz = await Quiz.findOne({ homework: homework._id });
    }

    res.json({
      homework,
      submission,
      quiz
    });
  } catch (error) {
    console.error('Get homework by id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Log PDF Study Time (Student only)
// @route   POST /api/homework/:id/study
// @access  Private (Student)
export const updateStudyTime = async (req, res) => {
  const { seconds } = req.body; // Seconds studied in this tick (e.g. 5)
  const homeworkId = req.params.id;

  try {
    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    let submission = await Submission.findOne({ student: req.user.id, homework: homeworkId });
    if (!submission) {
      submission = new Submission({
        student: req.user.id,
        homework: homeworkId,
      });
    }

    // Increment study time
    submission.pdfStudyTime += Number(seconds || 5);
    submission.updatedAt = new Date();

    // Check if threshold reached
    if (submission.pdfStudyTime >= homework.minStudyTime && !submission.pdfCompleted) {
      submission.pdfCompleted = true;
      submission.status = 'quiz_ready';
    }

    await submission.save();

    res.json(submission);
  } catch (error) {
    console.error('Update study time error:', error);
    res.status(500).json({ message: 'Server error tracking study time' });
  }
};
