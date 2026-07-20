# 🚀 MemeForge-AI

Willkommen zu **MemeForge-AI**! Ein moderner AI-Video Meme Generator (Desktop-App) inklusive Freemium-Lizenzierungs-Backend.

## 🌟 Features
- **Desktop App (Electron + React):** Für MacOS & Windows.
- **Freemium & Pro-Plan:** Mit Lizenzschlüssel-Verwaltung.
- **Sicheres Backend:** Node.js, Express & Prisma ORM.

## 🛠️ Tech Stack
- Frontend: Electron, React, Vite
- Backend: Node.js, Express, Prisma (SQLite/PostgreSQL)
- Deployment: Docker, Nginx

## 🚀 Lokale Entwicklung

### 1. Backend starten
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

### 2. Frontend (Desktop App) starten
```bash
cd frontend
npm install
npm run dev
```

> **Hinweis:** Dies ist Phase 1 des Projekts (Scaffolding & Grundgerüst).
