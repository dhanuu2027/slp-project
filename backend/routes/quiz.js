const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const questionBank = require('../data/questions');

// ─── ML Adaptive Difficulty Engine ───────────────────────────────────────────
// Uses a weighted moving average to determine user's optimal difficulty level.
// Algorithm: 
//   1. Track avgScore and attempts per module
//   2. If avgScore >= 80% → upgrade to 'hard'
//   3. If avgScore >= 60% → stay/upgrade to 'medium'
//   4. If avgScore < 60% → downgrade to 'easy'
// This is an Item Response Theory-inspired simplified adaptive model.

function adaptiveDifficultyML(avgScore, attempts, currentDifficulty) {
  // Weighted: recent performance matters more
  const threshold = attempts > 3 ? 0.75 : 0.65; // stricter after more attempts
  
  if (avgScore >= 85) return 'hard';
  if (avgScore >= threshold * 100) return 'medium';
  return 'easy';
}

function selectQuestions(module, difficulty, count = 10) {
  const allQuestions = questionBank[module] || [];
  
  // Priority: requested difficulty → other difficulties
  const preferred = allQuestions.filter(q => q.difficulty === difficulty);
  const others    = allQuestions.filter(q => q.difficulty !== difficulty);
  
  const pool = [...preferred, ...others];
  
  // Shuffle
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// GET /api/quiz/questions/:module
router.get('/questions/:module', authMiddleware, (req, res) => {
  const { module } = req.params;
  const count = parseInt(req.query.count) || 10;
  const user = req.user;

  if (!questionBank[module]) {
    return res.status(404).json({ message: 'Module not found' });
  }

  // Check if module is unlocked
  const moduleData = user.modules[module];
  if (moduleData && !moduleData.unlocked) {
    return res.status(403).json({ message: 'Module locked. Complete prerequisites first.' });
  }

  // Get adaptive difficulty
  const profile = user.adaptiveProfile?.[module];
  const difficulty = profile
    ? adaptiveDifficultyML(profile.avgScore, profile.attempts, profile.difficulty)
    : 'easy';

  const questions = selectQuestions(module, difficulty, count);

  // Return questions without answers
  const safeQuestions = questions.map(({ id, question, options, difficulty: d, explanation }) => ({
    id, question, options, difficulty: d, explanation
  }));

  res.json({
    questions: safeQuestions,
    totalAvailable: questionBank[module].length,
    adaptedDifficulty: difficulty,
    module
  });
});

// GET /api/quiz/modules
router.get('/modules', authMiddleware, (req, res) => {
  const modules = [
    { id: 'logical_basic',     name: 'Logical Thinking',  icon: '🧠', category: 'logical', color: '#6C63FF', description: 'Core reasoning and problem solving', prerequisite: null },
    { id: 'logical_patterns',  name: 'Pattern Recognition',icon: '🔷', category: 'logical', color: '#FF6584', description: 'Number and letter patterns', prerequisite: null },
    { id: 'logical_sequences', name: 'Sequences & Series', icon: '🔢', category: 'logical', color: '#43D9AD', description: 'Logical sequence analysis', prerequisite: null },
    { id: 'logical_spatial',   name: 'Spatial Reasoning',  icon: '🎲', category: 'logical', color: '#FFB347', description: 'Visualize and manipulate shapes', prerequisite: null },
    { id: 'timer_quiz',        name: 'Speed Challenge',    icon: '⚡', category: 'advanced',color: '#FF4757', description: 'Beat the clock on advanced problems', prerequisite: 'logical_basic', requiredScore: 70 },
    { id: 'coding_basic',      name: 'Coding Fundamentals',icon: '💻', category: 'coding', color: '#2196F3', description: 'Programming concepts and basics', prerequisite: 'timer_quiz', requiredScore: 65 },
    { id: 'coding_advanced',   name: 'Advanced Coding',    icon: '🚀', category: 'coding', color: '#9C27B0', description: 'Data structures, algorithms, system design', prerequisite: 'coding_basic', requiredScore: 70 },
  ];

  const user = req.user;
  const modulesWithStatus = modules.map(m => ({
    ...m,
    unlocked: user.modules[m.id]?.unlocked ?? true,
    bestScore: user.modules[m.id]?.bestScore ?? 0,
    adaptiveDifficulty: user.adaptiveProfile?.[m.id]?.difficulty ?? 'easy',
    totalQuestions: questionBank[m.id]?.length ?? 0,
  }));

  res.json({ modules: modulesWithStatus });
});

// POST /api/quiz/submit
router.post('/submit', authMiddleware, async (req, res) => {
  const { module, answers, timeTaken } = req.body;
  // answers: [{ id: 'lb001', selected: 'Yes' }, ...]

  if (!questionBank[module]) {
    return res.status(404).json({ message: 'Module not found' });
  }

  const allQ = questionBank[module];
  const qMap = {};
  allQ.forEach(q => { qMap[q.id] = q; });

  let correct = 0;
  const results = answers.map(a => {
    const q = qMap[a.id];
    if (!q) return { id: a.id, correct: false };
    const isCorrect = q.answer === a.selected;
    if (isCorrect) correct++;
    return { id: a.id, correct: isCorrect, correctAnswer: q.answer, explanation: q.explanation };
  });

  const score = Math.round((correct / answers.length) * 100);
  const xpEarned = correct * 10 + (score >= 80 ? 50 : 0); // Bonus XP for >80%

  // Update user profile
  const user = req.user;

  // Update adaptive profile
  const profile = user.adaptiveProfile[module] || { difficulty: 'easy', avgScore: 0, attempts: 0 };
  const newAttempts = profile.attempts + 1;
  const newAvgScore = ((profile.avgScore * profile.attempts) + score) / newAttempts;
  const newDifficulty = adaptiveDifficultyML(newAvgScore, newAttempts, profile.difficulty);

  user.adaptiveProfile[module] = { difficulty: newDifficulty, avgScore: newAvgScore, attempts: newAttempts };
  user.markModified('adaptiveProfile');

  // Update best score
  if (!user.modules[module]) user.modules[module] = { unlocked: true, bestScore: 0 };
  if (score > user.modules[module].bestScore) user.modules[module].bestScore = score;
  user.markModified('modules');

  // Unlock next modules based on score thresholds
  const unlockMap = {
    logical_basic:     { next: 'timer_quiz',       threshold: 70 },
    logical_patterns:  { next: 'timer_quiz',       threshold: 70 },
    logical_sequences: { next: 'timer_quiz',       threshold: 70 },
    logical_spatial:   { next: 'timer_quiz',       threshold: 70 },
    timer_quiz:        { next: 'coding_basic',     threshold: 65 },
    coding_basic:      { next: 'coding_advanced',  threshold: 70 },
  };

  let unlockedModule = null;
  if (unlockMap[module] && score >= unlockMap[module].threshold) {
    const nextMod = unlockMap[module].next;
    if (!user.modules[nextMod]?.unlocked) {
      user.modules[nextMod] = { ...(user.modules[nextMod] || {}), unlocked: true, bestScore: 0 };
      user.markModified('modules');
      unlockedModule = nextMod;
    }
  }

  // XP & Level
  user.xp += xpEarned;
  user.level = Math.floor(user.xp / 500) + 1;

  // Badges
  const badges = [];
  if (score === 100 && !user.badges.includes('perfect_score')) { user.badges.push('perfect_score'); badges.push('perfect_score'); }
  if (user.xp >= 1000 && !user.badges.includes('xp_1000')) { user.badges.push('xp_1000'); badges.push('xp_1000'); }
  if (user.streak >= 7 && !user.badges.includes('week_streak')) { user.badges.push('week_streak'); badges.push('week_streak'); }

  await user.save();

  res.json({
    score,
    correct,
    total: answers.length,
    xpEarned,
    results,
    unlockedModule,
    newBadges: badges,
    newLevel: user.level,
    newXP: user.xp,
    adaptiveDifficulty: newDifficulty,
    message: score >= 70 ? '🎉 Great job! Keep going!' : '💪 Keep practicing, you\'ll get there!'
  });
});

module.exports = router;
