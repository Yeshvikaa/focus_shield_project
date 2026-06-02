import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'parent'],
    required: true,
  },
  avatar: {
    type: String,
    default: 'avatar-1', // Default avatar string identifier
  },
  xp: {
    type: Number,
    default: 0, // Accumulates as student completes tasks
  },
  level: {
    type: Number,
    default: 1, // Calculated based on XP thresholds (e.g. 100 XP per level)
  },
  streak: {
    type: Number,
    default: 0, // Number of consecutive active days
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  parentCode: {
    type: String,
    unique: true,
    sparse: true, // Only exists on students; allows indexing unique values ignoring nulls
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links a student to their parent
  },
  unlockedAvatars: {
    type: [String],
    default: ['avatar-1'],
  },
  unlockedThemes: {
    type: [String],
    default: ['cyberpunk'],
  },
  badges: {
    type: [String], // e.g. ['focus_master', 'streak_gold', 'study_champ']
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
