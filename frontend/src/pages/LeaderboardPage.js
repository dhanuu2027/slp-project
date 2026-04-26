import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    axios.get('/api/progress/leaderboard')
      .then(res => setLeaderboard(res.data.leaderboard))
      .finally(() => setLoading(false));
  }, []);

  const AVATARS = { dragon: '🐉', wizard: '🧙', robot: '🤖', ninja: '🥷', alien: '👾' };
  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const rankIcons = ['👑', '🥈', '🥉'];

  return (
    <div style={styles.page}>
      <div className="stars" />
      <div style={styles.container}>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>
          ← BACK
        </button>

        <h1 style={styles.title}>🏆 LEADERBOARD</h1>
        <p style={{ color: '#7f7fa3', marginBottom: '32px', textAlign: 'center' }}>Top warriors ranked by XP</p>

        {loading ? (
          <div className="loader" />
        ) : (
          <div style={styles.list}>
            {leaderboard.map((u, i) => (
              <div key={u._id} style={{
                ...styles.row,
                background: u.username === user?.username
                  ? 'rgba(108,99,255,0.15)'
                  : i < 3 ? `rgba(${i === 0 ? '255,215,0' : i === 1 ? '192,192,192' : '205,127,50'},0.06)` : 'rgba(255,255,255,0.03)',
                borderColor: u.username === user?.username ? 'rgba(108,99,255,0.5)' : i < 3 ? `${rankColors[i]}44` : 'rgba(255,255,255,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  {/* Rank */}
                  <div style={{ ...styles.rank, color: i < 3 ? rankColors[i] : '#7f7fa3' }}>
                    {i < 3 ? rankIcons[i] : `#${i + 1}`}
                  </div>

                  {/* Avatar */}
                  <div style={styles.avatar}>{AVATARS[u.avatar] || '🐉'}</div>

                  <div>
                    <div style={{ fontWeight: 600, color: '#e0e0ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {u.username}
                      {u.username === user?.username && <span style={{ fontSize: '0.7rem', color: '#6C63FF' }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#7f7fa3' }}>Level {u.level}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: '#FFB347', fontWeight: 700 }}>{u.xp}</div>
                  <div style={{ fontSize: '0.75rem', color: '#7f7fa3' }}>XP</div>
                </div>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <div style={{ textAlign: 'center', color: '#7f7fa3', padding: '40px' }}>
                No players yet. Be the first! 🚀
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', position: 'relative', padding: '40px 24px', display: 'flex', justifyContent: 'center' },
  container: { maxWidth: '600px', width: '100%', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  title: { fontFamily: 'Orbitron', fontSize: '2rem', color: '#FFB347', textShadow: '0 0 30px rgba(255,179,71,0.4)', marginBottom: '8px' },
  list: { width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' },
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderRadius: '14px', border: '1px solid',
    transition: 'all 0.2s',
  },
  rank: { fontFamily: 'Orbitron', fontSize: '1.1rem', fontWeight: 700, minWidth: '36px', textAlign: 'center' },
  avatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
  },
};
