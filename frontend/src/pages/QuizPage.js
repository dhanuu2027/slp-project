import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const MODULE_META = {
  logical_basic:     { name: 'Logical Thinking', icon: '🧠', color: '#6C63FF', timePerQ: 60, totalQ: 10 },
  logical_patterns:  { name: 'Pattern Recognition', icon: '🔷', color: '#FF6584', timePerQ: 60, totalQ: 10 },
  logical_sequences: { name: 'Sequences & Series', icon: '🔢', color: '#43D9AD', timePerQ: 60, totalQ: 10 },
  logical_spatial:   { name: 'Spatial Reasoning', icon: '🎲', color: '#FFB347', timePerQ: 60, totalQ: 10 },
  timer_quiz:        { name: 'Speed Challenge', icon: '⚡', color: '#FF4757', timePerQ: 30, totalQ: 10 },
  coding_basic:      { name: 'Coding Fundamentals', icon: '💻', color: '#2196F3', timePerQ: 45, totalQ: 10 },
  coding_advanced:   { name: 'Advanced Coding', icon: '🚀', color: '#9C27B0', timePerQ: 45, totalQ: 10 },
};

export default function QuizPage() {
  const { module } = useParams();
  const navigate = useNavigate();
  const meta = MODULE_META[module] || { name: module, icon: '❓', color: '#6C63FF', timePerQ: 60, totalQ: 10 };

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(meta.timePerQ);
  const [totalTime, setTotalTime] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading | playing | reviewing | submitting
  const [difficulty, setDifficulty] = useState('easy');
  const [showExplanation, setShowExplanation] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Load questions
  useEffect(() => {
    axios.get(`/api/quiz/questions/${module}?count=10`)
      .then(res => {
        setQuestions(res.data.questions);
        setDifficulty(res.data.adaptedDifficulty);
        setPhase('playing');
      })
      .catch(() => { toast.error('Failed to load questions'); navigate('/dashboard'); });
  }, [module, navigate]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const t = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      setTotalTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(t);
  });

  const handleTimeout = useCallback(() => {
    if (submitted) return;
    // Auto-submit with no answer
    const q = questions[current];
    setAnswers(prev => [...prev, { id: q.id, selected: null }]);
    setStreak(0);
    advanceQuestion();
  }, [current, questions, submitted]);

  const handleSelect = (opt) => {
    if (selected !== null || phase !== 'playing') return;
    setSelected(opt);
    setShowExplanation(true);
    const q = questions[current];
    const correct = q.answer === opt; // Note: we don't have answer in safe questions, check on submit
    setAnswers(prev => [...prev, { id: q.id, selected: opt }]);
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
    }
    // Auto-advance after 1.5s
    setTimeout(() => { setShowExplanation(false); advanceQuestion(); }, 1500);
  };

  const advanceQuestion = () => {
    setSelected(null);
    setShowExplanation(false);
    if (current + 1 >= questions.length) {
      submitQuiz();
    } else {
      setCurrent(prev => prev + 1);
      setTimeLeft(meta.timePerQ);
    }
  };

  const submitQuiz = async () => {
    if (submitted) return;
    setSubmitted(true);
    setPhase('submitting');
    try {
      const finalAnswers = answers.slice(0, questions.length);
      // Pad if missing
      while (finalAnswers.length < questions.length) {
        finalAnswers.push({ id: questions[finalAnswers.length].id, selected: null });
      }
      const res = await axios.post('/api/quiz/submit', {
        module,
        answers: finalAnswers,
        timeTaken: totalTime,
      });
      navigate('/results', { state: { result: res.data, module, meta } });
    } catch (err) {
      toast.error('Failed to submit quiz');
      navigate('/dashboard');
    }
  };

  if (phase === 'loading' || phase === 'submitting') {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: 'center' }}>
          <div className="loader" style={{ margin: '0 auto 20px' }} />
          <p style={{ fontFamily: 'Orbitron', color: '#6C63FF' }}>
            {phase === 'submitting' ? 'CALCULATING SCORE...' : 'LOADING MISSION...'}
          </p>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;
  const timerPct = (timeLeft / meta.timePerQ) * 100;
  const timerColor = timeLeft <= 10 ? '#FF4757' : timeLeft <= 20 ? '#FFB347' : '#43D9AD';
  const difficultyColors = { easy: '#43D9AD', medium: '#FFB347', hard: '#FF4757' };

  return (
    <div style={styles.page}>
      <div className="stars" />

      {/* HEADER */}
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← EXIT</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', color: meta.color }}>{meta.icon} {meta.name}</div>
          <div style={{ fontSize: '0.8rem', color: '#7f7fa3' }}>
            Q {current + 1} of {questions.length} &nbsp;|&nbsp;
            <span style={{ color: difficultyColors[difficulty] }}>{difficulty.toUpperCase()}</span>
          </div>
        </div>
        <div style={styles.streakBadge}>
          🔥 {streak} streak
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{ padding: '0 24px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="progress-bar" style={{ height: '4px', marginBottom: '20px' }}>
          <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${meta.color}, #43D9AD)` }} />
        </div>
      </div>

      {/* QUIZ CARD */}
      <div style={styles.container}>
        {/* Timer Circle */}
        <div style={styles.timerSection}>
          <div style={{ ...styles.timerCircle, borderColor: timerColor, boxShadow: `0 0 20px ${timerColor}44` }}>
            <span style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', color: timerColor, fontWeight: 900 }}>{timeLeft}</span>
            <span style={{ fontSize: '0.7rem', color: '#7f7fa3' }}>SEC</span>
          </div>
          <div className="progress-bar" style={{ width: '80px', marginTop: '8px' }}>
            <div style={{ height: '4px', width: `${timerPct}%`, background: timerColor, borderRadius: '2px', transition: 'width 1s linear, background 0.3s' }} />
          </div>
        </div>

        {/* Question */}
        <div className="card" style={styles.questionCard}>
          <div style={styles.qNumber}>QUESTION {current + 1}</div>
          <p style={styles.qText}>{q?.question}</p>

          {/* Options */}
          <div style={styles.options}>
            {q?.options?.map((opt, i) => {
              let optStyle = styles.option;
              if (selected === opt) {
                optStyle = { ...styles.option, ...styles.optionSelected };
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  disabled={selected !== null}
                  style={optStyle}
                >
                  <span style={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Explanation hint */}
          {showExplanation && q?.explanation && (
            <div style={styles.explanation}>
              💡 {q.explanation}
            </div>
          )}
        </div>

        {/* Skip Button */}
        <button
          className="btn btn-secondary"
          onClick={advanceQuestion}
          style={{ marginTop: '16px', fontSize: '0.85rem' }}
          disabled={selected !== null}
        >
          SKIP →
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', position: 'relative', paddingBottom: '40px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 24px', borderBottom: '1px solid rgba(108,99,255,0.2)',
    background: 'rgba(13,13,26,0.9)', backdropFilter: 'blur(10px)',
    position: 'sticky', top: 0, zIndex: 100, marginBottom: '24px',
  },
  backBtn: {
    background: 'transparent', border: '1px solid rgba(255,71,87,0.4)',
    color: '#FF4757', padding: '8px 16px', borderRadius: '8px',
    cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.85rem',
  },
  streakBadge: {
    fontFamily: 'Orbitron', fontSize: '0.8rem', color: '#FF6584',
    background: 'rgba(255,101,132,0.1)', padding: '8px 14px', borderRadius: '20px',
    border: '1px solid rgba(255,101,132,0.3)',
  },
  container: { maxWidth: '700px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  timerSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' },
  timerCircle: {
    width: '90px', height: '90px', borderRadius: '50%',
    border: '3px solid', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.3s, box-shadow 0.3s',
    background: 'rgba(0,0,0,0.3)',
  },
  questionCard: { width: '100%', padding: '32px' },
  qNumber: { fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#7f7fa3', letterSpacing: '2px', marginBottom: '12px' },
  qText: { fontSize: '1.1rem', lineHeight: '1.7', color: '#e0e0ff', marginBottom: '28px', fontWeight: 500 },
  options: { display: 'flex', flexDirection: 'column', gap: '12px' },
  option: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '16px 20px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#e0e0ff', cursor: 'pointer', textAlign: 'left', fontFamily: 'Rajdhani',
    fontSize: '0.95rem', fontWeight: 500, transition: 'all 0.15s',
    width: '100%',
  },
  optionSelected: {
    background: 'rgba(108,99,255,0.2)', borderColor: '#6C63FF',
    boxShadow: '0 0 15px rgba(108,99,255,0.3)',
  },
  optionLetter: {
    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
    background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#6C63FF',
  },
  explanation: {
    marginTop: '20px', padding: '14px 18px', borderRadius: '10px',
    background: 'rgba(67,217,173,0.1)', border: '1px solid rgba(67,217,173,0.3)',
    color: '#43D9AD', fontSize: '0.9rem', lineHeight: '1.5',
  },
};
