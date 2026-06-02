import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, 'A question must have at least 2 options.'],
  },
  correctAnswerIndex: {
    type: Number,
    required: true,
    min: 0,
  }
});

const quizSchema = new mongoose.Schema({
  homework: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homework',
    required: true,
    unique: true, // One quiz per homework
  },
  title: {
    type: String,
    required: true,
  },
  questions: {
    type: [questionSchema],
    required: true,
    validate: [arr => arr.length > 0, 'A quiz must have at least one question.'],
  },
  timeLimit: {
    type: Number, // Total quiz time limit in seconds
    required: true,
    default: 120, // Default 2 minutes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
