import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AVATAR_EMOJIS = { dragon: '🐉', wizard: '🧙', robot: '🤖', ninja: '🥷', alien: '👾' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axios.get('/api/quiz/modules'),
      axios.get('/api/progress/stats'),
    ]).then(([modRes, statRes]) => {
      setModules(modRes.data.modules);
      setStats(statRes.data);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const xpForNextLevel = (user?.level || 1) * 500;
  const xpProgress = ((user?.xp || 0) % 500) / 500 * 100;

  const handleModuleClick = (mod) => {
    if (!mod.unlocked) {
      toast.error(`🔒 Complete prerequisite module and score 70%+ to unlock!`);
      return;
    }
    navigate(`/quiz/${mod.id}`);
  };

  const categoryColors = {
    logical: 'linear-gradient(135deg, #6C63FF22, #6C63FF44)',
    advanced: 'linear-gradient(135deg, #FF475722, #FF475744)',
    coding: 'linear-gradient(135deg, #2196F322, #2196F344)',
  };

  const difficultyColors = { easy: '#43D9AD', medium: '#FFB347', hard: '#FF4757' };

  if (loading) return <div className="loading-screen"><div className="loader"/></div>;

  return (
    <div style={styles.page}>
      <div className="stars" />

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <span style={styles.navTitle}>SMART<span style={{ color: '#43D9AD' }}>LEARN</span></span>
        </div>
        <div style={styles.navRight}>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => navigate('/leaderboard')}>🏆 Board</button>
          <button className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'rgba(255,71,87,0.1)', color: '#FF4757', border: '1px solid #FF4757' }}
            onClick={logout}>Exit</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* HERO SECTION */}
        <div style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.avatarBlock}>
              <div style={styles.avatar}>{AVATAR_EMOJIS[user?.avatar] || '🐉'}</div>
              <div>
                <h2 style={styles.heroName}>{user?.username}</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span className="badge badge-level">LVL {user?.level}</span>
                  <span className="badge badge-xp">⚡ {user?.xp} XP</span>
                  <span className="badge badge-streak">🔥 {user?.streak} day streak</span>
                </div>
                <div style={styles.xpBar}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#7f7fa3' }}>XP Progress</span>
                    <span style={{ fontSize: '0.75rem', color: '#FFB347' }}>{user?.xp % 500} / 500</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${xpProgress}%`, background: 'linear-gradient(90deg, #FFB347, #FF6584)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BADGES */}
          <div style={styles.badgesSection}>
            <h3 style={styles.sectionTitle}>ACHIEVEMENTS</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {user?.badges?.length > 0 ? user.badges.map(b => (
                <div key={b} style={styles.badgeIcon} title={b.replace(/_/g, ' ')}>
                  {b === 'perfect_score' ? '💯' : b === 'xp_1000' ? '⚡' : b === 'week_streak' ? '🔥' : '🏅'}
                </div>
              )) : <span style={{ color: '#7f7fa3', fontSize: '0.9rem' }}>Complete quizzes to earn badges!</span>}
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        {stats && (
          <div className="grid-3" style={{ marginBottom: '32px' }}>
            {[
              { label: 'MODULES UNLOCKED', value: stats.totalModulesUnlocked, icon: '🔓', color: '#43D9AD' },
              { label: 'TOTAL XP', value: stats.xp, icon: '⚡', color: '#FFB347' },
              { label: 'CURRENT LEVEL', value: stats.level, icon: '🎯', color: '#6C63FF' },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '2rem', fontFamily: 'Orbitron', color: s.color, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#7f7fa3', letterSpacing: '1.5px', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* LEARNING PATH HEADER */}
        <h2 style={{ ...styles.sectionTitle, marginBottom: '8px', fontSize: '1.2rem' }}>⚔️ YOUR LEARNING PATH</h2>
        <p style={{ color: '#7f7fa3', fontSize: '0.85rem', marginBottom: '28px' }}>
          Complete each stage to unlock the next. Score <strong style={{ color: '#43D9AD' }}>70%+</strong> in any Logical module → unlocks Timer Quiz → unlocks Coding.
        </p>

        {/* ── STAGE 1: LOGICAL THINKING ── */}
        <div style={styles.stageBlock}>
          <div style={styles.stageLabel}>
            <div style={{ ...styles.stageBadge, background: 'rgba(108,99,255,0.15)', border: '1px solid #6C63FF', color: '#6C63FF' }}>
              STAGE 1
            </div>
            <span style={{ color: '#6C63FF', fontFamily: 'Orbitron', fontSize: '0.85rem', letterSpacing: '2px' }}>🧠 LOGICAL THINKING</span>
            <span style={{ color: '#7f7fa3', fontSize: '0.8rem' }}>— All 4 topics unlocked by default</span>
          </div>
          <div className="grid-auto">
            {modules.filter(m => m.category === 'logical').map(mod => (
              <ModuleCard key={mod.id} mod={mod} onClick={() => handleModuleClick(mod)}
                gradient={categoryColors.logical} difficultyColors={difficultyColors} />
            ))}
          </div>
        </div>

        {/* ── ARROW + UNLOCK CONDITION ── */}
        <div style={styles.progressArrow}>
          <div style={styles.arrowLine} />
          <div style={styles.unlockCondition}>
            <span style={{ color: '#43D9AD', fontWeight: 700 }}>Score 70%+</span>
            <span style={{ color: '#7f7fa3' }}> in any Logical topic to unlock ↓</span>
          </div>
          <div style={styles.arrowLine} />
        </div>

        {/* ── STAGE 2: TIMER QUIZ ── */}
        <div style={styles.stageBlock}>
          <div style={styles.stageLabel}>
            <div style={{ ...styles.stageBadge, background: 'rgba(255,71,87,0.15)', border: '1px solid #FF4757', color: '#FF4757' }}>
              STAGE 2
            </div>
            <span style={{ color: '#FF4757', fontFamily: 'Orbitron', fontSize: '0.85rem', letterSpacing: '2px' }}>⚡ TIMER QUIZ</span>
            <span style={{ color: '#7f7fa3', fontSize: '0.8rem' }}>— Beat the clock on advanced problems (30s per question)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {modules.filter(m => m.category === 'advanced').map(mod => (
              <ModuleCard key={mod.id} mod={mod} onClick={() => handleModuleClick(mod)}
                gradient={categoryColors.advanced} difficultyColors={difficultyColors} />
            ))}
          </div>
        </div>

        {/* ── ARROW + UNLOCK CONDITION ── */}
        <div style={styles.progressArrow}>
          <div style={styles.arrowLine} />
          <div style={styles.unlockCondition}>
            <span style={{ color: '#43D9AD', fontWeight: 700 }}>Score 65%+</span>
            <span style={{ color: '#7f7fa3' }}> in Timer Quiz to unlock ↓</span>
          </div>
          <div style={styles.arrowLine} />
        </div>

        {/* ── STAGE 3: CODING ── */}
        <div style={styles.stageBlock}>
          <div style={styles.stageLabel}>
            <div style={{ ...styles.stageBadge, background: 'rgba(33,150,243,0.15)', border: '1px solid #2196F3', color: '#2196F3' }}>
              STAGE 3
            </div>
            <span style={{ color: '#2196F3', fontFamily: 'Orbitron', fontSize: '0.85rem', letterSpacing: '2px' }}>💻 CODING ARENA</span>
            <span style={{ color: '#7f7fa3', fontSize: '0.8rem' }}>— Programming concepts to advanced algorithms</span>
          </div>
          <div className="grid-auto">
            {modules.filter(m => m.category === 'coding').map(mod => (
              <ModuleCard key={mod.id} mod={mod} onClick={() => handleModuleClick(mod)}
                gradient={categoryColors.coding} difficultyColors={difficultyColors} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ mod, onClick, gradient, difficultyColors }) {
  const isLocked = !mod.unlocked;
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.moduleCard,
        background: isLocked ? 'rgba(255,255,255,0.02)' : gradient,
        opacity: isLocked ? 0.6 : 1,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        borderColor: isLocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={styles.moduleIcon}>{isLocked ? '🔒' : mod.icon}</div>
        {!isLocked && (
          <span style={{
            fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700,
            background: `${difficultyColors[mod.adaptiveDifficulty]}22`,
            color: difficultyColors[mod.adaptiveDifficulty],
            border: `1px solid ${difficultyColors[mod.adaptiveDifficulty]}44`,
          }}>
            {mod.adaptiveDifficulty?.toUpperCase()}
          </span>
        )}
      </div>

      <h3 style={styles.moduleName}>{mod.name}</h3>
      <p style={styles.moduleDesc}>{mod.description}</p>

      <div style={styles.moduleFooter}>
        <span style={{ fontSize: '0.8rem', color: '#7f7fa3' }}>📚 {mod.totalQuestions} questions</span>
        {mod.bestScore > 0 && (
          <span style={{ fontSize: '0.8rem', color: '#43D9AD' }}>Best: {mod.bestScore}%</span>
        )}
      </div>

      {mod.bestScore > 0 && (
        <div className="progress-bar" style={{ marginTop: '12px' }}>
          <div className="progress-fill" style={{ width: `${mod.bestScore}%` }} />
        </div>
      )}

      {isLocked && mod.prerequisite && (
        <div style={styles.lockMsg}>
          Complete {mod.prerequisite?.replace(/_/g, ' ')} with 70%+ to unlock
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', position: 'relative' },
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 32px', borderBottom: '1px solid rgba(108,99,255,0.2)',
    background: 'rgba(13,13,26,0.8)', backdropFilter: 'blur(10px)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '10px' },
  navTitle: { fontFamily: 'Orbitron', fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '3px' },
  navRight: { display: 'flex', gap: '12px', alignItems: 'center' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 },
  hero: {
    display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap',
    background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(67,217,173,0.05))',
    border: '1px solid rgba(108,99,255,0.2)', borderRadius: '20px', padding: '28px',
  },
  heroLeft: { flex: 1, minWidth: '280px' },
  avatarBlock: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  avatar: {
    width: '70px', height: '70px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6C63FF, #43D9AD)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
    flexShrink: 0,
  },
  heroName: { fontFamily: 'Orbitron', fontSize: '1.3rem', color: '#fff' },
  xpBar: { marginTop: '12px', width: '100%', maxWidth: '300px' },
  badgesSection: { flex: 1, minWidth: '200px' },
  sectionTitle: { fontFamily: 'Orbitron', fontSize: '0.8rem', letterSpacing: '2px', color: '#7f7fa3', marginBottom: '12px' },
  badgeIcon: {
    width: '48px', height: '48px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
    cursor: 'help',
  },
  stageBlock: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px', padding: '24px', marginBottom: '8px',
  },
  stageLabel: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  stageBadge: {
    fontFamily: 'Orbitron', fontSize: '0.65rem', letterSpacing: '1.5px',
    padding: '4px 10px', borderRadius: '20px', fontWeight: 700,
  },
  progressArrow: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '16px 40px', margin: '0 0 8px 0',
  },
  arrowLine: { flex: 1, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(67,217,173,0.4), transparent)' },
  unlockCondition: {
    textAlign: 'center', fontSize: '0.85rem', whiteSpace: 'nowrap',
    padding: '8px 20px', borderRadius: '20px',
    background: 'rgba(67,217,173,0.08)', border: '1px solid rgba(67,217,173,0.25)',
  },
  categoryHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' },
  categoryLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' },
  moduleCard: {
    borderRadius: '16px', padding: '22px', border: '1px solid',
    transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
  },
  moduleIcon: { fontSize: '2rem', marginBottom: '12px', display: 'block' },
  moduleName: { fontFamily: 'Orbitron', fontSize: '0.9rem', marginBottom: '8px', color: '#fff' },
  moduleDesc: { fontSize: '0.85rem', color: '#7f7fa3', marginBottom: '16px', lineHeight: '1.5' },
  moduleFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  lockMsg: { marginTop: '12px', fontSize: '0.75rem', color: '#7f7fa3', fontStyle: 'italic' },
};
