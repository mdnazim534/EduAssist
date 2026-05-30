# EduAssist — AI-Powered Student Productivity Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)

**EduAssist** is a production-ready, full-stack AI-powered platform that helps students with study materials, document processing, and career development.

---

## 🚀 Features

✅ **AI Study Assistant** — Generate summaries, MCQs, viva questions, and key topics from documents  
✅ **PDF Toolkit** — Convert images→PDF, merge, compress, extract text  
✅ **CV Builder** — 3 templates, live preview, instant PDF export  
✅ **Cloud Storage** — Persistent file storage with quota management  
✅ **User Dashboard** — Stats, charts, recent activity, quick actions  
✅ **Dark/Light Mode** — Full theme support  
✅ **Firebase Auth** — Email, Google, GitHub sign-in  
✅ **Production-Ready** — Deployable on Vercel, Render, Google AI Studio  

---

## 📋 Project Structure

```
EduAssist/
├── package.json                    # Root monorepo config
├── README.md                        # This file
├── .gitignore                       # Global .gitignore
│
├── eduassist-backend/
│   ├── package.json                # Backend dependencies
│   ├── .env.example                # Backend env template
│   ├── render.yaml                 # Render deployment config
│   ├── src/
│   │   ├── server.js               # Entry point
│   │   ├── app.js                  # Express app
│   │   ├── config/                 # Database, Firebase, Multer
│   │   ├── routes/                 # API routes
│   │   ├── controllers/            # Request handlers
│   │   ├── middleware/             # Auth, validation, error handling
│   │   ├── models/                 # Mongoose schemas
│   │   ├── services/               # Business logic (AI, PDF, CV)
│   │   └── utils/                  # Helpers, logger, cleanup
│   └── README.md                   # Backend documentation
│
└── eduassist-frontend/
    ├── package.json                # Frontend dependencies
    ├── .env.example                # Frontend env template
    ├── vercel.json                 # Vercel deployment config
    ├── vite.config.js              # Vite configuration
    ├── index.html                  # HTML entry point
    ├── src/
    │   ├── main.jsx                # React entry
    │   ├── App.jsx                 # Routes & auth
    │   ├── api/                    # API client, Firebase init
    │   ├── context/                # Auth & Theme context
    │   ├── components/             # UI components
    │   ├── pages/                  # Page components
    │   └── index.css               # Global styles
    └── README.md                   # Frontend documentation
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: Firebase Admin SDK
- **AI**: Anthropic Claude & OpenAI GPT-4o
- **File Processing**: Multer, pdf-lib, sharp, jimp
- **Utilities**: Winston (logging), node-cron (scheduling)

### Frontend
- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3
- **Routing**: React Router v6
- **HTTP**: Axios
- **Auth**: Firebase Web SDK
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Toast**: React Hot Toast

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- **Node.js** 18+ and npm 9+
- **MongoDB Atlas** account (free tier ok)
- **Firebase** project with Auth enabled
- **Anthropic** or **OpenAI** API key

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/udoydeb/EduAssist.git
cd EduAssist

# Install root dependencies
npm install

# Install backend & frontend
npm run install:all
```

### 2️⃣ Configure Environment Variables

#### Backend (.env)
```bash
cd eduassist-backend
cp .env.example .env
```

Edit `eduassist-backend/.env` with your credentials:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/eduassist

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com

ANTHROPIC_API_KEY=sk-ant-...
AI_PROVIDER=anthropic
```

#### Frontend (.env)
```bash
cd ../eduassist-frontend
cp .env.example .env
```

Edit `eduassist-frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### 3️⃣ Start Development Servers

```bash
# From root directory (with concurrently installed)
npm run dev

# Or start separately:
# Terminal 1: Backend
cd eduassist-backend && npm run dev

# Terminal 2: Frontend
cd eduassist-frontend && npm run dev
```

### 4️⃣ Verify

- **Backend Health Check**: http://localhost:5000/health
- **Frontend**: http://localhost:3000

---

## 🔧 Available Commands

### Root Level (Monorepo)
```bash
npm install              # Install all dependencies
npm run dev             # Start both backend & frontend
npm run dev:backend     # Start backend only
npm run dev:frontend    # Start frontend only
npm run build           # Build both for production
npm run start           # Start backend (production)
npm run test            # Run all tests
npm run lint            # Run all linters
```

### Backend Only
```bash
cd eduassist-backend
npm run dev             # Development with nodemon
npm run start           # Production start
npm run build           # Check dependencies
```

### Frontend Only
```bash
cd eduassist-frontend
npm run dev             # Vite dev server
npm run build           # Production build
npm run preview         # Preview production build
npm run lint            # ESLint check
```

---

## 📦 Environment Variables Setup

### MongoDB Atlas
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create database user with strong password
4. Add `0.0.0.0/0` to Network Access
5. Click "Connect" → "Drivers" → copy URI
6. Replace `<user>`, `<password>` in `MONGODB_URI`

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. **Backend**: Project Settings → Service Accounts → Generate key
4. **Frontend**: Project Settings → Your apps → Web → copy config
5. Authentication → Enable Email/Password, Google, GitHub

### Anthropic
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Set `ANTHROPIC_API_KEY=sk-ant-...`

### OpenAI (Optional)
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Set `OPENAI_API_KEY=sk-proj-...`

---

## 🚀 Deployment

### **Step 1: Deploy Backend to Render**

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. Go to [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repo
   - Build Command: `cd eduassist-backend && npm install`
   - Start Command: `cd eduassist-backend && npm start`
   - Root Directory: `.` (repo root)

3. Set Environment Variables in Render dashboard:
   - Copy all values from `eduassist-backend/.env.example`

4. Get your backend URL (e.g., `https://eduassist-api.onrender.com`)

### **Step 2: Deploy Frontend to Vercel**

1. Go to [vercel.com](https://vercel.com)
   - Import GitHub repo
   - Framework: Vite
   - Root Directory: `eduassist-frontend`
   - Build: `npm run build`
   - Output: `dist`

2. Set Environment Variables:
   ```
   VITE_API_URL=https://eduassist-api.onrender.com/api/v1
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   [... all other VITE_* variables]
   ```

3. Deploy ✅

---

## 🔐 Security Checklist

- ✅ **Environment Variables**: Never commit `.env` files
- ✅ **Firebase Rules**: Configure rules in Firebase Console
- ✅ **CORS**: Backend only accepts `FRONTEND_URL` origins
- ✅ **Rate Limiting**: 100 req/15min general, 20 req/15min for AI
- ✅ **File Upload**: Max 50MB, MIME type validation
- ✅ **Auth**: Firebase ID tokens required for protected endpoints
- ✅ **Helmet**: HTTP headers secured

---

## 🐛 Troubleshooting

### Backend won't start
```bash
npm run dev
# Check MONGODB_URI and Firebase credentials
# Verify .env file exists
```

### Frontend not connecting to API
```bash
# Verify VITE_API_URL in .env
# Check browser console for CORS errors
# Ensure backend FRONTEND_URL matches
```

### Firebase Auth fails
```bash
# Verify credentials are correct
# Check Authentication methods enabled
# Add domain to Authorized Domains
```

### AI API errors
```bash
# Verify API keys are valid
# Check rate limits (prod: 20 req/15min)
# Verify selected AI_PROVIDER has quota
```

---

## 📚 Documentation

- **Backend**: See `eduassist-backend/README.md`
- **Frontend**: See `eduassist-frontend/README.md`

---

## 📝 Development Guidelines

### Commit Messages
```
feat: Add new feature
fix: Fix a bug
docs: Update documentation
style: Code style changes
refactor: Refactor code
test: Add tests
chore: Maintenance
```

---

## 📄 License

MIT License — see LICENSE file for details.

---

## 🙋 Support

- 📧 Email: support@eduassist.dev
- 🐛 GitHub Issues
- 💬 GitHub Discussions

---

**Last Updated**: May 30, 2026  
**Version**: 1.0.0  
**Status**: Production-Ready ✅
