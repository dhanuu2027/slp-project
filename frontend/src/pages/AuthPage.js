import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back, warrior! ⚔️');
      } else {
        await register(form.username, form.email, form.password);
        toast.success('Account created! Your journey begins! 🚀');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div className="stars" />

      {/* Animated background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⚡</div>
          <h1 style={styles.logoText}>SMART<span style={{ color: '#43D9AD' }}>LEARN</span></h1>
          <p style={styles.tagline}>Level up your intellect</p>
        </div>

        {/* Auth Card */}
        <div className="card" style={styles.card}>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
              onClick={() => setMode('login')}
            >LOGIN</button>
            <button
              style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}
              onClick={() => setMode('register')}
            >SIGN UP</button>
          </div>

          <form onSubmit={handle} style={styles.form}>
            {mode === 'register' && (
              <div style={styles.field}>
                <label style={styles.label}>USERNAME</label>
                <input
                  className="input"
                  placeholder="Choose your warrior name"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>EMAIL</label>
              <input
                className="input"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>PASSWORD</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'LOADING...' : mode === 'login' ? '⚡ ENTER THE ARENA' : '🚀 BEGIN JOURNEY'}
            </button>
          </form>

          {/* Features */}
          <div style={styles.features}>
            {['🧠 Adaptive AI Quiz', '⚡ Speed Challenges', '💻 Coding Battles', '🏆 Leaderboard'].map(f => (
              <span key={f} style={styles.feature}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
    top: '-100px', left: '-100px', animation: 'pulse 4s ease-in-out infinite',
  },
  orb2: {
    position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(67,217,173,0.12) 0%, transparent 70%)',
    bottom: '-50px', right: '-50px', animation: 'pulse 5s ease-in-out infinite',
  },
  container: { width: '100%', maxWidth: '420px', zIndex: 1 },
  logo: { textAlign: 'center', marginBottom: '32px' },
  logoIcon: { fontSize: '3rem', marginBottom: '8px' },
  logoText: {
    fontFamily: 'Orbitron, monospace', fontSize: '2rem', fontWeight: 900,
    color: '#fff', letterSpacing: '4px',
  },
  tagline: { color: '#7f7fa3', fontSize: '0.9rem', marginTop: '4px', letterSpacing: '2px' },
  card: { padding: '32px' },
  tabs: { display: 'flex', gap: '0', marginBottom: '28px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' },
  tab: {
    flex: 1, padding: '10px', background: 'transparent', border: 'none',
    color: '#7f7fa3', fontFamily: 'Orbitron', fontSize: '0.75rem',
    fontWeight: 700, cursor: 'pointer', borderRadius: '7px', transition: 'all 0.2s',
  },
  tabActive: { background: 'linear-gradient(135deg, #6C63FF, #8B80FF)', color: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.75rem', fontWeight: 700, color: '#7f7fa3', letterSpacing: '1.5px' },
  submitBtn: { marginTop: '8px', padding: '16px', fontSize: '0.9rem', letterSpacing: '1px', width: '100%' },
  features: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px', justifyContent: 'center' },
  feature: { fontSize: '0.75rem', color: '#7f7fa3', padding: '4px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px' },
};
