# EduAssist Frontend

Production-ready React + Vite + Tailwind CSS frontend for the EduAssist AI productivity platform.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (dark/light mode) |
| Routing | React Router DOM v6 |
| HTTP | Axios (with Firebase token interceptor) |
| Auth | Firebase Authentication |
| Charts | Recharts |
| Animations | Framer Motion |
| File Drop | react-dropzone |
| Toasts | react-hot-toast |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1

VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Get Firebase credentials
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create / open your project
3. Go to **Project Settings** → **General** → **Your apps** → **Web**
4. Add a web app and copy the config values into `.env`
5. Enable **Authentication** → Sign-in methods → Email/Password + Google + GitHub

### 4. Start dev server
```bash
npm run dev
# Opens at http://localhost:3000
```

### 5. Build for production
```bash
npm run build
```

---

## Project Structure

```
src/
├── api/
│   ├── client.js         # Axios instance + all API functions
│   └── firebase.js       # Firebase app init
│
├── context/
│   ├── AuthContext.jsx   # Firebase auth state + MongoDB sync
│   └── ThemeContext.jsx  # Dark/light mode
│
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx  # Main layout wrapper (sidebar + topbar)
│   │   ├── Sidebar.jsx   # Navigation sidebar
│   │   └── TopBar.jsx    # Header with search + theme toggle
│   └── ui/
│       ├── index.jsx     # Spinner, StatCard, ProgressBar, EmptyState, Tabs, CopyButton, Skeleton
│       └── FileUpload.jsx # Drag-and-drop file upload zone
│
├── pages/
│   ├── HomePage.jsx      # Public landing page
│   ├── LoginPage.jsx     # Email + Google + GitHub login
│   ├── RegisterPage.jsx  # Registration with perks panel
│   ├── DashboardPage.jsx # Stats, charts, recent activity
│   ├── AIChatPage.jsx    # AI study assistant (ChatGPT-style)
│   ├── PDFToolsPage.jsx  # All 4 PDF tools with drag-and-drop
│   ├── CVBuilderPage.jsx # Full CV editor with live preview
│   ├── ProfilePage.jsx   # Account, preferences, storage, history
│   └── NotFoundPage.jsx  # 404
│
├── App.jsx               # Routes + protected route guards
├── main.jsx              # Entry point
└── index.css             # Global styles + design system
```

---

## Pages Overview

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Landing page with hero, features, CTA |
| `/login` | Guest only | Email, Google, GitHub sign in |
| `/register` | Guest only | Account creation |
| `/dashboard` | Protected | Stats, charts, recent activity, quick actions |
| `/ai` | Protected | AI Study Assistant — paste text or upload PDF/image, generate summaries, MCQs, viva questions, key topics, simple explanations |
| `/pdf` | Protected | PDF Tools — Image→PDF, Merge, Compress, PDF→Text |
| `/cv` | Protected | CV Builder — 3 templates, live preview, PDF export |
| `/profile` | Protected | Account settings, preferences, storage, AI history |

---

## API Integration

All API calls in `src/api/client.js`:

```js
import { aiAPI, pdfAPI, cvAPI, filesAPI, dashboardAPI, authAPI } from './api/client';

// Generate AI study content
const result = await aiAPI.generate({
  inputText: 'your notes here...',
  requestedTypes: ['summary', 'mcq', 'topics'],
});

// Upload images → PDF
const result = await pdfAPI.imageToPdf(fileArray, { pageSize: 'A4' });

// Create / save CV
const cv = await cvAPI.create(cvData);
await cvAPI.exportPdf(cv._id);
```

---

## Authentication Flow

1. User signs in via Firebase (email/Google/GitHub)
2. Firebase returns an ID token
3. Every Axios request attaches `Authorization: Bearer <token>`
4. Backend verifies the token with Firebase Admin SDK
5. User profile is auto-created / synced in MongoDB on first login

---

## Dark / Light Mode

Toggle with the sun/moon button in the TopBar or Profile page.
- Persisted to `localStorage`
- Applied via `class="dark"` or `class="light"` on `<html>`
- All components support both modes

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard (same as `.env`)
4. Deploy — `vercel.json` handles SPA routing

```bash
# Or deploy via CLI
npx vercel --prod
```

Set `VITE_API_URL` to your production backend URL:
```
VITE_API_URL=https://eduassist-api.onrender.com/api/v1
```
