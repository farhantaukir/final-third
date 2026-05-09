# Final Third
### *In the Final Third, every move matters.*

Final Third is a Football Club Management and Tracking System built with the MERN stack following strict MVC architecture. It enables structured communication and management between admins, coaches and players which covers club and roster management, match planning, performance tracking, and coach–player communication.

---

## Tech Stack

**Frontend**
- React 19, Vite 8, Tailwind CSS 4
- React Router DOM 7, Axios 1, Recharts 3
- React Hot Toast, React Icons

**Backend**
- Node.js, Express 5
- MongoDB, Mongoose 9, MongoDB Atlas
- JWT (jsonwebtoken), bcryptjs
- Multer, Cloudinary, Streamifier
- cookie-parser, cors, express-validator, dotenv

---

## Features

### Authentication & User Management
- Role-based registration and login for Coach and Player
- Separate Admin login at a protected route
- JWT issued on login, stored as a Bearer token per session
- Multi-session support; each browser tab holds its own independent session
- View and edit own profile with Cloudinary image upload

### Club & Roster Management
- Admin creates and manages leagues
- Admin creates clubs and assigns them to leagues
- Admin assigns coaches to clubs with automatic reassignment handling
- Admin adds and removes players from club rosters
- Admin assigns and updates player positions within the roster
- Admin views and deletes all coaches and players in the system with cascade cleanup

### Match Management
- Admin schedules matches between two clubs in the system
- Coach sets starting lineup (max 11) and substitutes per match
- Admin records final match result
- Coach and Player view upcoming matches with lineups from their club's perspective
- Coach and Player view paginated match history with results

### Performance & Statistics
- Admin logs per-match player stats (goals, assists, yellow cards, red cards) locked once submitted
- Player views personal career stats dashboard with recharts bar chart and per-match breakdown
- Coach views squad performance summary: W/D/L record, league position, and squad leaderboard with recharts chart
- Admin views system-wide top scorers and top assist providers leaderboard
- Admin views club standings table with full W/D/L and goal records, filterable by league

### Coach–Player Communication
- Coach posts squad-wide announcements
- Player views announcements feed ordered by most recent
- Coach sends private feedback to individual players
- Player views personal feedback feed
- Coach views full player profile, stats summary, match participation history, and feedback history with option to send feedback directly from the page

---

## Getting Started

### Prerequisites
- Node.js LTS — [nodejs.org](https://nodejs.org)
- MongoDB Atlas account — [mongodb.com/atlas](https://mongodb.com/atlas)
- Cloudinary account — [cloudinary.com](https://cloudinary.com)

### Installation

**1. Extract the project and navigate to the root**
```bash
cd final-third
```

**2. Set up the server**
```bash
cd server
npm install
```

Create a `.env` file inside `/server`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_string
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**3. Set up the client**
```bash
cd ../client
npm install
```

Create a `.env` file inside `/client`:
```env
VITE_API_URL=http://localhost:5000/api
```

**4. Seed the database**

Seed the Admin account (required before first use):
```bash
cd ../server
npm run seed:admin
```

Optionally seed sample clubs, matches, and stats for demonstration:
```bash
npm run seed:sample
```

To wipe all seeded data:
```bash
npm run seed:clean
```

**5. Run the application**

In `/server`:
```bash
npm run dev
```

In `/client`:
```bash
npm run dev
```

The app runs at `http://localhost:5173` and the server at `http://localhost:5000`.

---

## User Roles

| Role | Access |
|---|---|
| **Admin** | Full system control; leagues, clubs, rosters, matches, stats, user management |
| **Coach** | Match lineup planning, squad communication, player profile viewing |
| **Player** | Personal stats, match schedules and lineups, announcements, personal feedback |

> The Admin account is not available on the public registration page. It is created exclusively via `npm run seed:admin`.

---

## Project Structure

```
final-third/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AppShell.component.jsx
│   │   │   ├── FeedbackModal.component.jsx
│   │   │   ├── Sidebar.component.jsx
│   │   │   └── StatCard.component.jsx
│   │   ├── context/
│   │   │   └── auth.context.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.hook.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminClubDetail.page.jsx
│   │   │   │   ├── AdminClubs.page.jsx
│   │   │   │   ├── AdminDashboard.page.jsx
│   │   │   │   ├── AdminLeaderboards.page.jsx
│   │   │   │   ├── AdminLogin.page.jsx
│   │   │   │   ├── AdminMatches.page.jsx
│   │   │   │   ├── AdminStandings.page.jsx
│   │   │   │   └── AdminUsers.page.jsx
│   │   │   ├── coach/
│   │   │   │   ├── CoachAnalytics.page.jsx
│   │   │   │   ├── CoachCommunication.page.jsx
│   │   │   │   ├── CoachDashboard.page.jsx
│   │   │   │   ├── CoachMatchLineup.page.jsx
│   │   │   │   ├── CoachMatchesHistory.page.jsx
│   │   │   │   ├── CoachMatchesUpcoming.page.jsx
│   │   │   │   ├── CoachPlayerProfile.page.jsx
│   │   │   │   └── CoachSquad.page.jsx
│   │   │   ├── player/
│   │   │   │   ├── PlayerAnnouncements.page.jsx
│   │   │   │   ├── PlayerDashboard.page.jsx
│   │   │   │   ├── PlayerFeedback.page.jsx
│   │   │   │   ├── PlayerMatchesHistory.page.jsx
│   │   │   │   ├── PlayerMatchesUpcoming.page.jsx
│   │   │   │   └── PlayerStats.page.jsx
│   │   │   └── public/
│   │   │       ├── Login.page.jsx
│   │   │       └── Register.page.jsx
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── PublicOnlyRoute.jsx
│   │   │   └── RoleRoute.jsx
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── axios.instance.js
│   │   │   ├── club.service.js
│   │   │   ├── communication.service.js
│   │   │   ├── match.service.js
│   │   │   └── stats.service.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── routing.paths.js
│   ├── .env
│   ├── .gitignore
│   ├── index.html
│   └── vite.config.js
│
└── server/
    ├── config/
    │   ├── cloudinary.config.js
    │   └── db.config.js
    ├── controllers/
    │   ├── club.controller.js
    │   ├── communication.controller.js
    │   ├── match.controller.js
    │   ├── stats.controller.js
    │   └── user.controller.js
    ├── middleware/
    │   └── auth.middleware.js
    ├── models/
    │   ├── announcement.model.js
    │   ├── club.model.js
    │   ├── feedback.model.js
    │   ├── league.model.js
    │   ├── match.model.js
    │   ├── playerStat.model.js
    │   └── user.model.js
    ├── routes/
    │   ├── club.routes.js
    │   ├── communication.routes.js
    │   ├── match.routes.js
    │   ├── stats.routes.js
    │   └── user.routes.js
    ├── seed/
    │   ├── admin.seed.js
    │   ├── clean.seed.js
    │   └── sample.seed.js
    ├── utilities/
    │   └── upload.utility.js
    ├── .env
    ├── .gitignore
    ├── env.bootstrap.js
    └── server.js
```

---

## API Overview

| Domain | Base Route |
|---|---|
| Auth & Users | `/api/users` |
| Clubs & Leagues | `/api/clubs` |
| Matches | `/api/matches` |
| Statistics | `/api/stats` |
| Communication | `/api/announcements`, `/api/feedback`, `/api/coach` |

All responses follow a consistent shape:
```json
{ "success": true, "data": {} }
{ "success": false, "message": "Error description" }
```

---
