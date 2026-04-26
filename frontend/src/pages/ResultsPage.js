import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [animate, setAnimate] = useState(false);

  const { result, module, meta } = state || {};

  useEffect(() => {
    if (!result) { navigate('/dashboard'); return; }
    setTimeout(() => setAnimate(true), 100);
    if (result.score >= 70) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [result, navigate]);

  if (!result) return null;

  const { score, correct, total, xpEarned, unlockedModule, newBadges, newLevel, adaptiveDifficulty } = result;
  const grade = score >= 90 ? { label: 'S RANK', color: '#FFD700', icon: '👑' }
              : score >= 80 ? { label: 'A RANK', color: '#43D9AD', icon: '🌟' }
              : score >= 70 ? { label: 'B RANK', color: '#6C63FF', icon: '⚡' }
              : score >= 60 ? { label: 'C RANK', color: '#FFB347', icon: '🎯' }
              : { label: 'D RANK', color: '#FF4757', icon: '💪' };

  return (
    <div style={styles.page}>
      {showConfetti && <Confetti colors={['#6C63FF', '#43D9AD', '#FF6584', '#FFB347', '#fff']} numberOfPieces={200} />}
      <div className="stars" />

      <div style={styles.container}>
        {/* Grade */}
        <div style={{ ...styles.gradeCard, borderColor: `${grade.color}44`, boxShadow: `0 0 40px ${grade.color}22` }} className={animate ? 'animate-in' : ''}>
          <div style={{ fontSize: '4rem', marginBottom: '8px' }}>{grade.icon}</div>
          <div style={{ fontFamily: 'Orbitron', fontSize: '2.5rem', color: grade.color, fontWeight: 900, textShadow: `0 0 30px ${grade.color}` }}>
            {grade.label}
          </div>
          <div style={{ fontFamily: 'Orbitron', fontSize: '4rem', color: '#fff', fontWeight: 900, marginTop: '8px' }}>
            {score}<span style={{ fontSize: '1.5rem', color: '#7f7fa3' }}>%</span>
          </div>
          <p style={{ color: '#7f7fa3', marginTop: '8px' }}>{correct} / {total} correct</p>
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-xp">+{xpEarned} XP earned</span>
              <span className="badge badge-level">Now Level {newLevel}</span>
              <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', background: `${grade.color}22`, color: grade.color, border: `1px solid ${grade.color}44` }}>
                AI difficulty → {adaptiveDifficulty?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Unlocked Module */}
        {unlockedModule && (
          <div style={styles.unlockBanner}>
            🔓 NEW MODULE UNLOCKED: <strong style={{ color: '#43D9AD' }}>{unlockedModule.replace(/_/g, ' ').toUpperCase()}</strong>
          </div>
        )}

        {/* New Badges */}
        {newBadges?.length > 0 && (
          <div style={styles.newBadges}>
            {newBadges.map(b => (
              <div key={b} style={styles.badgeEarned}>
                <span style={{ fontSize: '2rem' }}>{b === 'perfect_score' ? '💯' : b === 'xp_1000' ? '⚡' : '🔥'}</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#FFB347' }}>BADGE EARNED!</span>
                <span style={{ fontSize: '0.8rem', color: '#7f7fa3' }}>{b.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Score Bar */}
        <div className="card" style={{ width: '100%', marginTop: '24px' }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: '#7f7fa3', marginBottom: '16px', letterSpacing: '2px' }}>PERFORMANCE</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: '8px', borderRadius: '4px',
                background: i < correct ? '#43D9AD' : 'rgba(255,71,87,0.5)',
                transition: `width 0.3s ${i * 0.05}s`,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
            <span style={{ color: '#43D9AD' }}>✓ {correct} Correct</span>
            <span style={{ color: '#FF4757' }}>✗ {total - correct} Wrong</span>
          </div>
        </div>

        {/* Message */}
        <div className="card" style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '1rem', color: '#e0e0ff' }}>{result.message}</p>
          {score < 70 && (
            <p style={{ fontSize: '0.85rem', color: '#7f7fa3', marginTop: '8px' }}>
              💡 The AI has adjusted your difficulty. Keep practicing!
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
          <button className="btn btn-primary" onClick={() => navigate(`/quiz/${module}`)}>
            🔄 TRY AGAIN
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            🏠 DASHBOARD
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/leaderboard')}>
            🏆 LEADERBOARD
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
  container: { maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 1 },
  gradeCard: {
    width: '100%', borderRadius: '20px', padding: '40px', textAlign: 'center',
    background: 'rgba(13,13,26,0.9)', border: '2px solid',
  },
  unlockBanner: {
    width: '100%', padding: '16px 24px', borderRadius: '12px',
    background: 'rgba(67,217,173,0.1)', border: '1px solid rgba(67,217,173,0.4)',
    color: '#e0e0ff', textAlign: 'center', fontSize: '0.95rem',
    animation: 'pulse 2s ease-in-out infinite',
  },
  newBadges: { display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' },
  badgeEarned: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    padding: '16px', borderRadius: '12px', background: 'rgba(255,179,71,0.1)',
    border: '1px solid rgba(255,179,71,0.3)', minWidth: '120px',
  },
};
