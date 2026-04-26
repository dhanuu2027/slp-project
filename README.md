# ⚡ Smart Learning Platform

A gamified, AI-adaptive learning platform with Logical Thinking, Speed Challenges, and Coding modules.

---

## 🗂️ Project Structure

```
smart-learning-platform/
├── backend/               ← Node.js + Express + MongoDB
│   ├── server.js
│   ├── .env
│   ├── models/User.js
│   ├── middleware/auth.js
│   ├── routes/auth.js
│   ├── routes/quiz.js
│   ├── routes/progress.js
│   └── data/questions.js  ← 100+ questions
│
└── frontend/              ← React app
    ├── public/index.html
    └── src/
        ├── App.js
        ├── App.css
        ├── index.js
        ├── context/AuthContext.js
        └── pages/
            ├── AuthPage.js
            ├── Dashboard.js
            ├── QuizPage.js
            ├── ResultsPage.js
            └── LeaderboardPage.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+ (https://nodejs.org)
- MongoDB Community (https://www.mongodb.com/try/download/community)
- VS Code

---

### Step 1 — Start MongoDB

**Windows:**
```bash
# If installed as a service, it auto-starts. Or run:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

---

### Step 2 — Setup Backend

```bash
cd smart-learning-platform/backend
npm install
```

Edit `.env` if needed (default works for local MongoDB):
```
MONGO_URI=mongodb://localhost:27017/smart_learning
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
```

Start the backend:
```bash
npm run dev
```
✅ You should see: `MongoDB Connected` and `Server running on port 5000`

---

### Step 3 — Setup Frontend

Open a **new terminal**:
```bash
cd smart-learning-platform/frontend
npm install
npm start
```
✅ Opens at: http://localhost:3000

---

## 🎮 How It Works

### Module Progression (Unlock System)
```
🧠 Logical Thinking (4 topics) — Unlocked by default
        ↓ Score 70%+ in any logical module
⚡ Speed Challenge (Timer Quiz) — Unlocks
        ↓ Score 65%+
💻 Coding Fundamentals — Unlocks
        ↓ Score 70%+
🚀 Advanced Coding — Unlocks
```

### 🤖 ML Adaptive Difficulty
The platform uses a **weighted moving average** algorithm inspired by Item Response Theory:
- Tracks your average score and number of attempts per module
- After each quiz: adjusts question difficulty (Easy / Medium / Hard)
- Shows only 10 questions per session, picked from a pool of 15+ per module (100+ total)
- Gets harder as you improve, easier if you struggle

### 🏆 Gamification
- **XP System**: Earn 10 XP per correct answer + 50 XP bonus for 80%+
- **Levels**: Every 500 XP = Level up
- **Badges**: Perfect Score 💯, XP Milestones ⚡, Streaks 🔥
- **Daily Streak**: Login consecutive days to build streak
- **Leaderboard**: Compete with other users
- **Grade Ranks**: S / A / B / C / D based on score
- **Timer**: Per-question countdown (30s for Speed, 60s for Logic, 45s for Coding)

---

## 🔧 Customization

### Add More Questions
Edit `backend/data/questions.js` — add to any module array following the format:
```js
{ 
  id: 'lb016',              // unique ID
  question: 'Your question?',
  options: ['A', 'B', 'C', 'D'],
  answer: 'A',              // must match one of options exactly
  difficulty: 'medium',     // easy | medium | hard
  explanation: 'Why A is correct'
}
```

### Add New Modules
1. Add question array in `data/questions.js`
2. Add module entry in `routes/quiz.js` → `GET /api/quiz/modules`
3. Add module meta in `frontend/src/pages/QuizPage.js` → `MODULE_META`
4. Add to User model schema in `models/User.js`

### Change Questions Per Session
In `routes/quiz.js`, the default count is 10. Users can request different counts via `?count=20`.

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/quiz/modules | Get all modules + status |
| GET | /api/quiz/questions/:module | Get adaptive questions |
| POST | /api/quiz/submit | Submit answers, get score |
| GET | /api/progress/stats | Get user stats |
| GET | /api/progress/leaderboard | Top 10 users |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Custom CSS (Orbitron + Rajdhani fonts) |
| Animations | CSS animations + react-confetti |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| ML | Adaptive difficulty (IRT-inspired weighted avg) |

---

## 🐛 Troubleshooting

**MongoDB connection error:**
- Make sure MongoDB is running (see Step 1)
- Check your MONGO_URI in `.env`

**Port already in use:**
- Backend: Change PORT in `.env`
- Frontend: React will auto-suggest another port

**npm install errors:**
- Try `npm install --legacy-peer-deps`
- Make sure Node.js v18+ is installed

**CORS errors:**
- Make sure backend is running on port 5000
- Check the proxy in `frontend/package.json` is `"http://localhost:5000"`
