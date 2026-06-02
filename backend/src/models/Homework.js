import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  pdfPath: {
    type: String, // Path on disk or local upload url
    required: true,
  },
  minStudyTime: {
    type: Number, // In seconds (minimum time student must view the PDF before unlocking MCQ)
    required: true,
    default: 60, // Default 1 minute
  },
  rewardXp: {
    type: Number,
    required: true,
    default: 50, // XP rewarded on completion
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Homework = mongoose.model('Homework', homeworkSchema);
export default Homework;
