import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['badge', 'avatar', 'theme'],
    required: true,
  },
  itemKey: {
    type: String, // e.g. 'focus_master', 'avatar-2', 'theme-neon'
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  }
});

// Avoid duplicate rewards for the same student
rewardSchema.index({ student: 1, type: 1, itemKey: 1 }, { unique: true });

const Reward = mongoose.model('Reward', rewardSchema);
export default Reward;
