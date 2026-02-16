# Skill Recommendation System (MERN)

A full-stack Skill Recommendation System with a professional React dashboard and Node/Express + MongoDB backend.

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT

## Features

- Signup/Login with skills + interests
- Jobs tab:
  - Company and role filtering
  - Match percentage
  - Missing skill detection
  - Learning resource links
  - Recommendation feedback (rating)
- Skills tab:
  - Skill categories
  - Category skill details
  - Related jobs
  - Trending skills
  - Save skill to profile

## Project Structure

- `backend/` Express API + Mongo models + recommendation logic
- `frontend/` React UI dashboard

## Setup

### 1) Backend

```bash
cd backend
npm install
copy .env.example .env
```

Update `backend/.env` values if needed.

Seed sample jobs:

```bash
npm run seed
```

Start backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2) Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/recommendations/dashboard`
- `POST /api/recommendations/save-skill`
- `POST /api/recommendations/feedback`
- `GET /api/skills/categories`
- `GET /api/skills/categories/:category`

## Notes

- Trending skills service currently uses a fallback list and is structured for future external API integration.
- You can add more jobs in `backend/src/data/jobCatalog.js`.
