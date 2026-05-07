<br># 🌦️ WeatherBoard — Multi-User Weather Dashboard

A **full-stack, multi-user weather dashboard** with **AI-powered intelligence**, real-time weather tracking, and a premium glassmorphic UI. Each user gets their own personalized dashboard to track weather across multiple cities, receive AI-driven insights, and manage cities through natural language commands.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Express](https://img.shields.io/badge/Express-4.x-000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack & Justification](#-tech-stack--justification)
- [High-Level Architecture](#-high-level-architecture)
- [Authentication & Authorization](#-authentication--authorization)
- [AI Agent Design & Purpose](#-ai-agent-design--purpose)
- [Creative Feature — Natural Language City Management](#-creative-feature--natural-language-city-management)
- [Setup Instructions](#-setup-instructions)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Key Design Decisions & Trade-offs](#-key-design-decisions--trade-offs)
- [Known Limitations](#-known-limitations)
- [License](#-license)
- [Author](#-author)

---

## 🌍 Project Overview

**WeatherBoard** is a multi-user weather dashboard that goes beyond simple weather lookups. It combines real-time weather data, per-user persistence, and an AI assistant into a cohesive product.

### Core Capabilities

| Capability | Description |
|-----------|-------------|
| **Multi-city tracking** | Add unlimited cities; each stored with geocoded coordinates |
| **Real-time weather** | Temperature, humidity, feels-like, wind speed, and conditions via Open-Meteo |
| **Per-user dashboards** | Every registered user has an independent, persistent city list |
| **Favorites** | Star cities to pin them to the top of your dashboard |
| **AI chat assistant** | Ask weather questions, compare cities, get outfit suggestions |
| **Natural language commands** | Say *"Add Tokyo"* or *"Remove London"* to manage cities via chat |
| **Smart insights** | Auto-generated analysis: best outdoor city, alerts, outfit tips, creative suggestions |
| **Premium UI** | Dark glassmorphism design with smooth animations and responsive layout |

---

## 🛠️ Tech Stack & Justification

| Layer | Technology | Why This Choice |
|-------|-----------|-----------------|
| **Frontend Framework** | Next.js 16 (App Router), React 19 | Server-side rendering for SEO and fast initial loads; App Router for modern file-based routing and layouts |
| **Styling** | Tailwind CSS 4 + custom CSS variables | Utility-first styling for rapid prototyping; CSS variables enable the glassmorphism design system and theme consistency |
| **Client State** | Zustand | Minimal boilerplate for auth state; no context-provider nesting overhead compared to Redux or React Context |
| **Server State** | TanStack React Query v5 | Automatic caching, background refetching, and stale-while-revalidate for weather data — eliminates manual fetch logic |
| **Backend** | Express 4, TypeScript, Node.js | Lightweight and flexible; TypeScript adds compile-time safety across shared interfaces |
| **Database** | MongoDB + Mongoose ODM | Schema-flexible document model fits the per-user city array pattern naturally; Mongoose provides validation and type-safe schemas |
| **AI / LLM** | LangChain + OpenAI GPT-4o-mini | LangChain provides a structured message chain (System → History → User); GPT-4o-mini balances cost and quality for conversational weather assistance |
| **Weather API** | Open-Meteo | **Free, no API key required**, accurate WMO-coded data with geocoding — removes a friction point for local setup |
| **Auth** | JWT + bcrypt + HTTP-only cookies | Stateless auth with secure cookie transport (no localStorage exposure) |
| **Caching** | node-cache (in-memory, 10min TTL) | Avoids hitting the Open-Meteo API on every dashboard load; 10-minute TTL keeps data reasonably fresh |
| **Notifications** | react-hot-toast | Lightweight, customizable toast notifications with no heavy UI library dependency |

---

## 🏗️ High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                   │
│  Next.js 16 App Router ──── React 19 ──── Tailwind CSS 4│
│                                                          │
│  ┌────────────┐  ┌─────────────┐  ┌───────────────────┐ │
│  │ Auth Pages │  │  Dashboard  │  │   AI Chat Panel   │ │
│  │  (Zustand) │  │(React Query)│  │ (Conversation UI) │ │
│  └─────┬──────┘  └──────┬──────┘  └────────┬──────────┘ │
│        │                │                   │            │
│        └────────────────┴───────────────────┘            │
│                         │ Axios (credentials: true)      │
└─────────────────────────┼────────────────────────────────┘
                          │ HTTP-only Cookie (JWT)
                          ▼
┌──────────────────────────────────────────────────────────┐
│                     API SERVER (Express)                  │
│                                                          │
│  ┌──────────┐  ┌───────────────┐  ┌───────────────────┐ │
│  │ Auth API │  │ Dashboard API │  │     AI API        │ │
│  │ register │  │ getCities     │  │ chat (LangChain)  │ │
│  │ login    │  │ addCity       │  │ insights (GPT)    │ │
│  │ logout   │  │ toggleFav     │  │ cityAction (NLP)  │ │
│  │ getMe    │  │ removeCity    │  │                   │ │
│  └────┬─────┘  └──────┬────────┘  └────────┬──────────┘ │
│       │               │                     │            │
│  ┌────▼───────────────▼─────────────────────▼──────────┐ │
│  │           Auth Middleware (JWT verify)               │ │
│  └─────────────────────────────────────────────────────┘ │
│       │               │                     │            │
│       ▼               ▼                     ▼            │
│  ┌─────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ MongoDB │  │ Open-Meteo   │  │ OpenAI GPT-4o-mini │  │
│  │(Mongoose)│ │ + node-cache │  │  (via LangChain)   │  │
│  └─────────┘  └──────────────┘  └────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Client** sends requests via Axios with `withCredentials: true` (cookies auto-attached).
2. **Express middleware** verifies the JWT from the HTTP-only cookie on protected routes.
3. **Controllers** handle business logic — geocoding cities, fetching weather, invoking LangChain.
4. **Weather service** checks the in-memory cache (10min TTL) before calling Open-Meteo.
5. **AI service** builds a LangChain message chain with the user's live weather context and conversation history, then invokes GPT-4o-mini.
6. **MongoDB** persists user accounts and per-user dashboard data (city arrays with coordinates).

---

## 🔐 Authentication & Authorization

### Approach

The app uses a **stateless JWT-based authentication** system with cookies as the transport layer.

### How It Works

| Step | Detail |
|------|--------|
| **Registration** | User submits email + password → password is hashed with **bcrypt** (10 salt rounds) → stored in MongoDB → JWT signed and set as HTTP-only cookie |
| **Login** | Email + password verified against bcrypt hash → JWT issued into cookie |
| **Session Persistence** | JWT has a **7-day expiration**; cookie `maxAge` matches → user stays logged in across browser sessions |
| **Protected Routes** | `authMiddleware` extracts the JWT from `req.cookies.token`, verifies it with `jsonwebtoken`, and injects `req.userId` for downstream controllers |
| **Logout** | Server clears the `token` cookie |

### Security Measures

- **HTTP-only cookies** — Token is not accessible via JavaScript (`document.cookie`), mitigating XSS token theft
- **`sameSite: strict`** — Prevents CSRF by not sending cookies on cross-origin requests
- **`secure: true` in production** — Cookie only sent over HTTPS
- **CORS restricted** — Backend only accepts requests from the configured `FRONTEND_URL`
- **No password stored in plaintext** — Only bcrypt hashes persisted
- **Environment-based secrets** — `JWT_SECRET`, `OPENAI_API_KEY`, and `MONGO_URI` kept in `.env` (git-ignored)

### Authorization Model

Authorization is **user-scoped**: every dashboard operation (add/remove city, toggle favorite, fetch weather, AI chat) is tied to the authenticated `userId`. Users cannot access or modify another user's dashboard.

---

## 🤖 AI Agent Design & Purpose

### Overview

WeatherBoard includes an AI weather assistant powered by **LangChain** and **OpenAI GPT-4o-mini**. The agent is not a generic chatbot — it has live access to the user's actual dashboard weather data and can perform actions on their behalf.

### Architecture

```
User Message
    │
    ▼
┌──────────────────────────────┐
│  handleCityAction()          │ ◄── Regex-based intent detection
│  (add/remove city via NLP)   │     (no LLM call needed)
└──────────┬───────────────────┘
           │ action = 'none'?
           ▼
┌──────────────────────────────┐
│  gatherUserWeatherContext()  │ ◄── Fetches live weather for all
│  (real-time data injection)  │     user's tracked cities
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  LangChain Message Chain     │
│  ┌────────────────────────┐  │
│  │ SystemMessage           │  │ ◄── Persona + rules + live weather data
│  │ ...History (last 8)     │  │ ◄── Conversation context window
│  │ HumanMessage            │  │ ◄── Current user input
│  └────────────────────────┘  │
│         │                    │
│         ▼                    │
│  ChatOpenAI (GPT-4o-mini)   │
│  temperature: 0.7            │
│  maxTokens: 500              │
└──────────────────────────────┘
           │
           ▼
      AI Response
```

### Two AI Subsystems

#### 1. Conversational Chat (`POST /api/ai/chat`)

- **Purpose**: Answer weather questions, compare cities, recommend outfits/activities, alert about extreme conditions
- **Context injection**: The system prompt includes a formatted dump of all the user's current weather data — the LLM always has up-to-date numbers
- **Conversation memory**: The last 8 messages of history are passed in each request (client-managed, sliding window)
- **City management**: Before invoking the LLM, a regex-based intent detector checks if the user wants to add/remove a city — if so, the action is performed directly without an LLM call (faster, cheaper, more reliable)

#### 2. Smart Insights (`GET /api/ai/insights`)

- **Purpose**: Auto-generate a structured insights panel from the user's weather data
- **Output format**: Returns structured JSON with four fields: `bestCity`, `alerts[]`, `outfit`, and `tip`
- **Design**: Uses a lower temperature (0.6) for more consistent, factual outputs
- **Graceful degradation**: Returns `null` if no API key is configured or if the user has no cities — the frontend hides the panel entirely

### Why GPT-4o-mini?

- **Cost-effective** for conversational weather queries (no need for GPT-4-level reasoning)
- **Fast response times** (~1-2 seconds) for a smooth chat experience
- **Sufficient quality** for weather analysis, outfit recommendations, and structured JSON generation

---

## ✨ Creative Feature — Natural Language City Management

### What It Is

Users can **add and remove cities from their dashboard by typing natural language commands in the AI chat**, instead of using the search bar. For example:

> *"Add Tokyo to my dashboard"*
> *"Track Paris"*
> *"Remove London please"*
> *"Drop Delhi"*

The AI confirms the action and the dashboard updates in real-time.

### How It Works

1. **Every chat message** is first passed through `handleCityAction()` — a lightweight regex-based intent detector
2. If an **add** intent is detected (keywords: `add`, `track`, `include`, `monitor`), the city name is extracted and geocoded via Open-Meteo
3. If a **remove** intent is detected (keywords: `remove`, `delete`, `drop`, `untrack`), the city is removed from MongoDB
4. The action is performed **directly** (no LLM call), and the AI responds with a confirmation message
5. The response includes an `action` field (`city_added` / `city_removed`) so the frontend can trigger a dashboard refresh

### Why This Design

- **No LLM cost** for city management — regex handles the common patterns reliably
- **Instant response** — no waiting for GPT to process a simple CRUD operation
- **Seamless UX** — users can manage their dashboard entirely through conversation
- **Fallback to AI** — if no city action is detected, the message flows to the full LangChain pipeline for a conversational response

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- **OpenAI API Key** *(optional — AI features are disabled gracefully without it)*

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/UtkarshNagar69/multi-user-weather-dashboard-application.git
cd multi-user-weather-dashboard-application
```

#### 2. Backend Setup

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
OPENAI_API_KEY=sk-your-openai-api-key-here   # optional
```

Start the backend:

```bash
npm run dev
```

The API server starts at `http://localhost:5000`.

#### 3. Frontend Setup

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

### Deployed / Production Setup

#### Backend

```bash
cd backend
npm run build          # Compiles TypeScript to dist/
npm start              # Runs dist/index.js
```

Set `NODE_ENV=production` in your environment to enable:
- Secure (HTTPS-only) cookies
- Production CORS origin

#### Frontend

```bash
cd frontend
npm run build          # Creates optimized production bundle
npm start              # Starts Next.js production server
```

Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Create new account | ✗ |
| `POST` | `/api/auth/login` | Login (returns cookie) | ✗ |
| `POST` | `/api/auth/logout` | Clear auth cookie | ✗ |
| `GET`  | `/api/auth/me` | Get current user | ✓ |

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET`    | `/api/dashboard` | Get all cities with weather | ✓ |
| `POST`   | `/api/dashboard/city` | Add a city (geocoded) | ✓ |
| `PATCH`  | `/api/dashboard/city/:cityName/favorite` | Toggle favorite | ✓ |
| `DELETE` | `/api/dashboard/city/:cityName` | Remove a city | ✓ |

### AI

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/ai/chat` | Chat with AI assistant | ✓ |
| `GET`  | `/api/ai/insights` | Get smart weather insights | ✓ |

### Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Health check | ✗ |

---

## 📁 Project Structure

```
multi-user-weather-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                 # MongoDB connection (cached)
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts    # Register, login, logout, getMe
│   │   │   ├── dashboard.controller.ts # CRUD cities + weather fetch
│   │   │   └── ai.controller.ts      # Chat + smart insights + city actions
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts     # JWT verification from cookies
│   │   ├── models/
│   │   │   ├── User.ts               # User schema (email, passwordHash)
│   │   │   └── UserDashboard.ts      # Dashboard (cities array with coords)
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   └── ai.routes.ts
│   │   ├── services/
│   │   │   ├── weather.service.ts    # Open-Meteo + geocoding + caching
│   │   │   └── ai.service.ts         # LangChain + OpenAI integration
│   │   └── index.ts                  # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/page.tsx        # Main dashboard page
│   │   ├── login/page.tsx            # Login page
│   │   ├── register/page.tsx         # Registration page
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── providers.tsx             # React Query + Toaster providers
│   │   ├── globals.css               # Design system + animations
│   │   └── page.tsx                  # Landing / redirect page
│   ├── components/
│   │   ├── Navbar.tsx                # Navigation bar with auth
│   │   ├── SearchBar.tsx             # City search with geocoding
│   │   ├── CityCard.tsx              # Weather card component
│   │   ├── CityCardSkeleton.tsx      # Loading skeleton
│   │   ├── AIChatPanel.tsx           # Floating AI chat interface
│   │   ├── SmartInsights.tsx         # AI insights panel
│   │   └── WeatherIcon.tsx           # Dynamic weather icons
│   ├── lib/
│   │   ├── api.ts                    # Axios client (withCredentials)
│   │   └── queryClient.ts           # React Query config
│   ├── store/
│   │   └── authStore.ts             # Zustand auth state
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## ⚖️ Key Design Decisions & Trade-offs

### 1. HTTP-only Cookies vs. localStorage for JWT

| | HTTP-only Cookie | localStorage |
|-|-----------------|--------------|
| **XSS protection** | ✅ Not accessible via JS | ❌ Readable by any script |
| **CSRF risk** | ⚠️ Mitigated with `sameSite: strict` | ✅ Not auto-sent |
| **Cross-domain** | ❌ Requires same-site or proper CORS | ✅ Works anywhere |

**Decision**: Chose cookies because XSS is a more common attack vector for web apps than CSRF, and `sameSite: strict` adequately mitigates CSRF.

### 2. In-Memory Cache vs. Redis

**Decision**: Used `node-cache` (in-memory) instead of Redis for weather data caching.

- **Pro**: Zero infrastructure overhead — no Redis server needed for local development
- **Pro**: Sufficient for a single-instance deployment
- **Trade-off**: Cache is lost on server restart and not shared across instances (no horizontal scaling)

### 3. Client-Managed Conversation History vs. Server-Persisted

**Decision**: Chat history is maintained on the client and sent with each request (last 8 messages).

- **Pro**: No additional database schema or storage costs
- **Pro**: History automatically clears on page refresh (privacy-friendly)
- **Trade-off**: Conversation is lost if the user refreshes the page

### 4. Regex-Based Intent Detection vs. LLM Classification

**Decision**: City add/remove commands are handled by regex pattern matching, not by the LLM.

- **Pro**: Instant response, zero API cost, deterministic behavior
- **Pro**: More reliable for CRUD operations (LLMs can hallucinate or misformat)
- **Trade-off**: Only handles explicit phrasing (e.g., *"add Tokyo"*) — more ambiguous requests fall through to the LLM chat

### 5. Open-Meteo vs. OpenWeatherMap

**Decision**: Chose Open-Meteo as the weather data provider.

- **Pro**: Completely free with no API key required — removes a setup friction point
- **Pro**: Provides WMO-coded conditions, geocoding, humidity, and feels-like temperature
- **Trade-off**: Fewer advanced features (no air quality, UV index, or 16-day forecasts compared to paid alternatives)

### 6. Zustand + React Query vs. Redux Toolkit

**Decision**: Split state management between Zustand (auth) and React Query (server data).

- **Pro**: Each tool excels at its job — Zustand for simple synchronous state, React Query for async server state with caching
- **Pro**: Dramatically less boilerplate than Redux + RTK Query
- **Trade-off**: Two state libraries to learn instead of one unified solution

---

## ⚠️ Known Limitations

| Limitation | Detail |
|-----------|--------|
| **No password reset** | Users cannot recover accounts if they forget their password (no email verification or reset flow) |
| **No rate limiting** | API endpoints are unprotected against brute-force or abuse; production deployments should add `express-rate-limit` |
| **Single-instance caching** | `node-cache` doesn't share state across multiple server instances; horizontal scaling would require Redis |
| **No weather forecasts** | Only current weather is displayed — no hourly/daily forecast data |
| **Chat history is ephemeral** | Conversation resets on page refresh since history is client-side only |
| **AI requires OpenAI key** | Smart insights and chat features require a valid `OPENAI_API_KEY`; the app works without it but AI panels are hidden |
| **No input sanitization library** | User inputs are validated manually; production should use a validation library like `zod` or `joi` |
| **No unit/integration tests** | The codebase currently has no automated test suite |

---

## 📄 License

This project is open source and available under the [ISC License](https://opensource.org/licenses/ISC).

---

## 👤 Author

**Utkarsh Nagar** — [@UtkarshNagar69](https://github.com/UtkarshNagar69)
