import mongoose from 'mongoose';

const distractionLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['blur', 'tab-switch'],
    required: true,
  },
  details: {
    type: String,
    default: '',
  }
});

const focusSessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  duration: {
    type: Number, // Focus session duration in seconds
    required: true,
  },
  distractionCount: {
    type: Number,
    default: 0,
  },
  distractionLogs: [distractionLogSchema],
  status: {
    type: String,
    enum: ['completed', 'failed_distracted'],
    required: true,
    default: 'completed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
export default FocusSession;
