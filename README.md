<br># 🌦️ WeatherBoard — Multi-User Weather Dashboard

A **full-stack, multi-user weather dashboard** with **AI-powered intelligence**, real-time weather tracking, and a sleek modern UI. Track weather across multiple cities, get AI-driven insights, and manage your dashboard with natural language commands.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Express](https://img.shields.io/badge/Express-4.x-000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)

---

## ✨ Features

### 🌍 Weather Tracking
- **Multi-city dashboard** — Add and track unlimited cities worldwide
- **Real-time weather data** — Temperature, humidity, wind speed, feels-like, and conditions via [Open-Meteo API](https://open-meteo.com/)
- **Smart caching** — 10-minute cache with `node-cache` to minimize API calls
- **Favorites system** — Star your most important cities for priority display
- **Auto-refresh** — Dashboard refreshes every 10 minutes automatically

### 🤖 AI Intelligence (powered by OpenAI GPT-4o-mini)
- **Conversational AI Chat** — Ask weather questions, get outfit suggestions, compare cities
- **Natural Language City Management** — Say *"Add Tokyo"* or *"Remove London"* and the AI handles it
- **Smart Insights Panel** — Auto-generated weather analysis including:
  - Best city for outdoor activities
  - Weather alerts and warnings
  - Outfit recommendations
  - Creative weather-based tips
- **Conversation history** — Chat maintains context across messages

### 🔐 Authentication & Multi-User
- **JWT-based authentication** with HTTP-only cookies (no localStorage tokens)
- **User registration & login** with bcrypt password hashing
- **Per-user dashboards** — Each user has their own independent city list
- **Persistent sessions** — 7-day token expiration

### 🎨 Modern UI/UX
- **Dark-mode glassmorphism design** with premium aesthetics
- **Smooth animations** — Slide-in, fade-up, scale transitions
- **Responsive layout** — Works on desktop, tablet, and mobile
- **Loading skeletons** — Polished loading states for every component
- **Dynamic weather icons** — Visual indicators based on weather conditions
- **Time-aware greetings** — Good morning/afternoon/evening based on local time

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Custom CSS variables |
| **State Management** | Zustand (auth), React Query (server state) |
| **Backend** | Express 4, TypeScript, Node.js |
| **Database** | MongoDB with Mongoose ODM |
| **AI/LLM** | LangChain + OpenAI GPT-4o-mini |
| **Weather API** | Open-Meteo (free, no API key needed) |
| **Auth** | JWT + bcrypt + HTTP-only cookies |
| **Caching** | node-cache (in-memory, 10min TTL) |

---

## 📁 Project Structure

```
multi-user-weather-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts      # Register, login, logout, getMe
│   │   │   ├── dashboard.controller.ts # CRUD for cities + weather fetch
│   │   │   └── ai.controller.ts        # Chat + smart insights endpoints
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts       # JWT verification middleware
│   │   ├── models/
│   │   │   ├── User.ts                 # User schema (email, passwordHash)
│   │   │   └── UserDashboard.ts        # Dashboard schema (cities array)
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   └── ai.routes.ts
│   │   ├── services/
│   │   │   ├── weather.service.ts      # Open-Meteo API + geocoding + caching
│   │   │   └── ai.service.ts           # LangChain/OpenAI integration
│   │   └── index.ts                    # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/page.tsx          # Main dashboard page
│   │   ├── login/page.tsx              # Login page
│   │   ├── register/page.tsx           # Registration page
│   │   ├── layout.tsx                  # Root layout with providers
│   │   ├── providers.tsx               # React Query + Toaster providers
│   │   ├── globals.css                 # Design system + animations
│   │   └── page.tsx                    # Landing/redirect page
│   ├── components/
│   │   ├── Navbar.tsx                  # Navigation bar with auth
│   │   ├── SearchBar.tsx               # City search with geocoding
│   │   ├── CityCard.tsx                # Weather card component
│   │   ├── CityCardSkeleton.tsx        # Loading skeleton
│   │   ├── AIChatPanel.tsx             # Floating AI chat interface
│   │   ├── SmartInsights.tsx           # AI insights panel
│   │   └── WeatherIcon.tsx             # Dynamic weather icons
│   ├── lib/
│   │   ├── api.ts                      # Axios API client
│   │   └── queryClient.ts             # React Query client config
│   ├── store/
│   │   └── authStore.ts               # Zustand auth store
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** running locally or a MongoDB Atlas connection string
- **OpenAI API Key** (for AI features — optional, app works without it)

### 1. Clone the Repository

```bash
git clone https://github.com/UtkarshNagar69/multi-user-weather-dashboard-application.git
cd multi-user-weather-dashboard-application
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/weatherdash
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Start the backend:

```bash
npm run dev
```

The API server will start at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create new account |
| `POST` | `/api/auth/login` | Login with credentials |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Get current user (protected) |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Get all cities with weather (protected) |
| `POST` | `/api/dashboard/city` | Add a city (protected) |
| `PATCH` | `/api/dashboard/city/:cityName/favorite` | Toggle favorite (protected) |
| `DELETE` | `/api/dashboard/city/:cityName` | Remove a city (protected) |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/chat` | Chat with AI assistant (protected) |
| `GET` | `/api/ai/insights` | Get smart weather insights (protected) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |

---

## 🧠 AI Features Deep Dive

### Chat Interface
The AI chatbot uses **LangChain** with **OpenAI GPT-4o-mini** and has access to all your real-time weather data. It can:
- Compare weather across your tracked cities
- Recommend activities based on conditions
- Suggest what to wear
- Alert you about extreme weather
- Add/remove cities via natural language (e.g., *"track Paris"*, *"remove Delhi"*)

### Smart Insights
Auto-generated insights panel that analyzes all your cities and provides:
- **Best city** for outdoor activities
- **Weather alerts** for extreme conditions
- **Outfit suggestions** based on aggregate weather
- **Creative tips** tailored to current patterns

---

## 🛡️ Security

- Passwords hashed with **bcrypt** (10 salt rounds)
- JWT tokens stored in **HTTP-only cookies** (not accessible via JavaScript)
- CORS restricted to frontend origin
- Environment variables for all secrets (`.env` excluded from git)

---

## 📄 License

This project is open source and available under the [ISC License](https://opensource.org/licenses/ISC).

---

## 👤 Author

**Utkarsh Nagar** — [@UtkarshNagar69](https://github.com/UtkarshNagar69)
