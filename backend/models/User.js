const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar:   { type: String, default: 'dragon' },
  level:    { type: Number, default: 1 },
  xp:       { type: Number, default: 0 },
  badges:   [{ type: String }],
  streak:   { type: Number, default: 0 },
  lastLogin:{ type: Date, default: Date.now },
  createdAt:{ type: Date, default: Date.now },

  // Module unlock progression
  modules: {
    logical_basic:    { unlocked: { type: Boolean, default: true  }, bestScore: { type: Number, default: 0 } },
    logical_patterns: { unlocked: { type: Boolean, default: true  }, bestScore: { type: Number, default: 0 } },
    logical_sequences:{ unlocked: { type: Boolean, default: true  }, bestScore: { type: Number, default: 0 } },
    logical_spatial:  { unlocked: { type: Boolean, default: true  }, bestScore: { type: Number, default: 0 } },
    timer_quiz:       { unlocked: { type: Boolean, default: false }, bestScore: { type: Number, default: 0 } },
    coding_basic:     { unlocked: { type: Boolean, default: false }, bestScore: { type: Number, default: 0 } },
    coding_advanced:  { unlocked: { type: Boolean, default: false }, bestScore: { type: Number, default: 0 } },
  },

  // ML adaptive difficulty
  adaptiveProfile: {
    logical_basic:     { difficulty: { type: String, default: 'easy' }, avgScore: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
    logical_patterns:  { difficulty: { type: String, default: 'easy' }, avgScore: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
    logical_sequences: { difficulty: { type: String, default: 'easy' }, avgScore: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
    logical_spatial:   { difficulty: { type: String, default: 'easy' }, avgScore: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
    timer_quiz:        { difficulty: { type: String, default: 'easy' }, avgScore: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
    coding_basic:      { difficulty: { type: String, default: 'easy' }, avgScore: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
    coding_advanced:   { difficulty: { type: String, default: 'easy' }, avgScore: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
