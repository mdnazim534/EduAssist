# EduAssist Backend API

Production-ready Node.js + Express backend for the EduAssist AI student productivity platform.

## Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: Firebase Admin SDK
- **AI**: Anthropic Claude / OpenAI GPT-4o (configurable)
- **File Processing**: Multer, pdf-lib, pdf-parse, sharp
- **Security**: Helmet, express-rate-limit, CORS
- **Logging**: Winston + Morgan

---

## Project Structure

```
src/
├── server.js           # Entry point
├── app.js              # Express app + middleware
├── config/
│   ├── database.js     # MongoDB connection
│   ├── firebase.js     # Firebase Admin init
│   └── multer.js       # File upload config
├── models/
│   ├── user.model.js
│   ├── file.model.js
│   ├── aiHistory.model.js
│   └── cv.model.js
├── controllers/
│   ├── auth.controller.js
│   ├── ai.controller.js
│   ├── pdf.controller.js
│   ├── cv.controller.js
│   ├── file.controller.js
│   └── dashboard.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── ai.routes.js
│   ├── pdf.routes.js
│   ├── cv.routes.js
│   ├── file.routes.js
│   ├── user.routes.js
│   └── dashboard.routes.js
├── middleware/
│   ├── auth.middleware.js
│   ├── rateLimiter.js
│   ├── errorHandler.js
│   └── validators.js
├── services/
│   ├── ai.service.js     # Anthropic + OpenAI integration
│   ├── pdf.service.js    # pdf-lib, pdf-parse, sharp
│   └── cv.service.js     # CV PDF generation
└── utils/
    ├── logger.js
    ├── cleanup.js        # Cron-based temp file cleanup
    └── response.js       # Standardized API responses

frontend-api/
├── client.js            # Axios API client (copy to frontend/src/api/)
└── hooks.js             # React hooks (copy to frontend/src/hooks/)
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Required credentials
| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers |
| `FIREBASE_*` | Firebase Console → Project Settings → Service Accounts → Generate key |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) (optional) |

### 4. Start development server
```bash
npm run dev
```

### 5. Verify
```
GET http://localhost:5000/health
```

---

## API Reference

### Base URL
- Development: `http://localhost:5000/api/v1`
- Production: `https://eduassist-api.onrender.com/api/v1`

### Authentication
All protected endpoints require a Firebase ID token:
```
Authorization: Bearer <firebase-id-token>
```

---

### Auth Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ✅ | Create/sync user after Firebase signup |
| POST | `/auth/login` | ✅ | Sync user on login |
| GET | `/auth/me` | ✅ | Get current user |
| POST | `/auth/logout` | ✅ | Revoke Firebase tokens |
| PATCH | `/auth/profile` | ✅ | Update name/preferences |
| DELETE | `/auth/account` | ✅ | Delete account |

### AI Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/ai/generate` | ✅ | Generate study content (multipart) |
| GET | `/ai/history` | ✅ | List sessions (paginated) |
| GET | `/ai/history/:id` | ✅ | Get full session |
| PATCH | `/ai/history/:id` | ✅ | Save/rename session |
| DELETE | `/ai/history/:id` | ✅ | Delete session |

**POST /ai/generate** accepts `multipart/form-data`:
```
requestedTypes: JSON string array e.g. '["summary","mcq","topics"]'
inputText:      (optional) text to analyze
file:           (optional) PDF or image file
provider:       "anthropic" | "openai"
title:          session title
```

**requestedTypes values**: `summary` `mcq` `shortq` `broadq` `viva` `topics` `explain`

### PDF Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/pdf/image-to-pdf` | Optional | Convert images → PDF |
| POST | `/pdf/merge` | Optional | Merge PDFs |
| POST | `/pdf/compress` | Optional | Compress PDF |
| POST | `/pdf/to-word` | Optional | Extract PDF text |
| GET | `/pdf/download/:filename` | — | Download processed file |

### CV Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/cv` | ✅ | Create CV |
| GET | `/cv` | ✅ | List user's CVs |
| GET | `/cv/:id` | ✅ | Get CV |
| GET | `/cv/public/:slug` | — | Public CV view |
| PUT | `/cv/:id` | ✅ | Update CV |
| PATCH | `/cv/:id/publish` | ✅ | Toggle public sharing |
| DELETE | `/cv/:id` | ✅ | Delete CV |
| POST | `/cv/:id/export` | ✅ | Download as PDF |

### Files Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/files` | ✅ | List files (paginated) |
| GET | `/files/storage` | ✅ | Storage quota info |
| PATCH | `/files/:id/save` | ✅ | Toggle permanent save |
| DELETE | `/files/:id` | ✅ | Delete file |
| DELETE | `/files/clear-temp` | ✅ | Clear unsaved files |

### Dashboard Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/overview` | ✅ | Stats + recent activity |
| GET | `/dashboard/search?q=` | ✅ | Search across all content |

---

## AI Response Format

```json
{
  "success": true,
  "sessionId": "...",
  "results": {
    "summary": "Markdown string...",
    "mcq": [
      {
        "question": "What is backpropagation?",
        "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
        "correctIndex": 1,
        "explanation": "..."
      }
    ],
    "shortq": [{ "question": "...", "answer": "..." }],
    "broadq": ["Essay question 1...", "Essay question 2..."],
    "viva": [{ "question": "...", "hint": "..." }],
    "topics": ["Neural Networks", "Backpropagation"],
    "explain": "Simple markdown explanation..."
  },
  "meta": {
    "provider": "anthropic",
    "model": "claude-opus-4-5",
    "tokensUsed": 2840,
    "processingTimeMs": 4521
  }
}
```

---

## Deployment

### Render (Backend)
1. Push to GitHub
2. New Web Service → connect repo
3. Build: `npm install` | Start: `npm start`
4. Set all env vars from `.env.example`
5. Or use `render.yaml` for infrastructure-as-code

### MongoDB Atlas
1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add IP `0.0.0.0/0` to network access
3. Create database user
4. Copy connection string → `MONGODB_URI`

### Vercel (Frontend)
1. `VITE_API_URL=https://your-api.onrender.com/api/v1`
2. Deploy frontend to Vercel

---

## Security Features
- Firebase ID token verification on all protected routes
- Rate limiting: 100 req/15min general, 20 req/15min for AI
- File type validation (MIME type + extension)
- 50MB max file size
- Automatic temp file deletion (24h TTL + hourly cron)
- Helmet HTTP headers
- CORS whitelist
- Path traversal prevention on downloads
- MongoDB injection protection via Mongoose

## License
MIT
