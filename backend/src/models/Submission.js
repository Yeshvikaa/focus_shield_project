import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  homework: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homework',
    required: true,
  },
  pdfStudyTime: {
    type: Number, // Accumulated seconds spent viewing PDF
    default: 0,
  },
  pdfCompleted: {
    type: Boolean,
    default: false, // Becomes true when pdfStudyTime >= homework.minStudyTime
  },
  quizCompleted: {
    type: Boolean,
    default: false, // Becomes true when quiz is passed
  },
  attempts: {
    type: Number,
    default: 0, // Number of quiz attempts
  },
  status: {
    type: String,
    enum: ['studying', 'quiz_ready', 'completed'],
    default: 'studying',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Ensure a student has one submission record per homework
submissionSchema.index({ student: 1, homework: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
