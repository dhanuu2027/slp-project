const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// GET /api/progress/leaderboard (top users by XP)
router.get('/leaderboard', authMiddleware, async (req, res) => {
  const User = require('../models/User');
  const users = await User.find({}, 'username level xp badges avatar').sort({ xp: -1 }).limit(10);
  res.json({ leaderboard: users });
});

// GET /api/progress/stats
router.get('/stats', authMiddleware, (req, res) => {
  const user = req.user;
  const modules = user.modules || {};
  const adaptive = user.adaptiveProfile || {};

  const stats = Object.keys(modules).map(mod => ({
    module: mod,
    bestScore: modules[mod]?.bestScore || 0,
    attempts: adaptive[mod]?.attempts || 0,
    avgScore: Math.round(adaptive[mod]?.avgScore || 0),
    difficulty: adaptive[mod]?.difficulty || 'easy',
    unlocked: modules[mod]?.unlocked || false,
  }));

  res.json({
    level: user.level,
    xp: user.xp,
    streak: user.streak,
    badges: user.badges,
    stats,
    totalModulesUnlocked: stats.filter(s => s.unlocked).length,
  });
});

module.exports = router;
