
# JusticeLink Platform

A full-stack web application for tracking political promises, parliamentary attendance, and news for transparency and accountability in Sri Lanka.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Folder Structure](#folder-structure)
- [Backend API](#backend-api)
- [Frontend Overview](#frontend-overview)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Overview
JusticeLink is a platform designed to:
- Track and verify political promises made by politicians.
- Monitor parliamentary attendance and session participation.
- Aggregate and display political news.
- Enable citizen feedback and evidence submission.
- Provide notifications and alerts to users.

---

## Features
- **User Authentication:** Registration, login, OTP verification, and role-based access (citizen, admin, auditor).
- **Promise Tracking:** CRUD operations for promises, status updates, evidence linking, and statistics.
- **Attendance Monitoring:** Record and compare attendance for politicians in parliamentary sessions.
- **News Aggregation:** Fetch and display political news, link news to promises.
- **Feedback System:** Citizens can submit feedback and evidence on promises, with voting and sentiment analysis.
- **Notifications:** Real-time and scheduled notifications for users, including OTP and email logs.
- **Admin Dashboard:** Manage users, politicians, sessions, and system data.

---

## Architecture
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication, RESTful API.
- **Frontend:** React (Vite), React Router, Context API for auth, Axios for API calls, Tailwind CSS for styling.

---

## Technologies Used
- **Backend:**
    - express, mongoose, dotenv, cors, bcryptjs, jsonwebtoken, nodemailer, socket.io, stripe, swagger-jsdoc, swagger-ui-express
- **Frontend:**
    - react, react-dom, react-router-dom, axios, tailwindcss, vite

---

## Folder Structure
```
Backend/
    Controller/        # API controllers (user, news, promises, etc.)
    Middleware/        # Auth and role middleware
    Model/             # Mongoose models (User, Promise, News, etc.)
    Routes/            # Express route definitions
    Utils/             # Utility functions (ID generator, email)
    Logs/              # Email and OTP logs
    index.js           # Main server entry point
    package.json       # Backend dependencies
Frontend/Frontend/
    src/
        components/      # Navbar, NotificationDropdown, etc.
        context/         # AuthContext for global state
        pages/           # Home, Dashboard, Login, Register, News, OTP, etc.
        services/        # API service (axios)
        styles/          # CSS files
    public/            # Static assets
    index.html         # Main HTML
    package.json       # Frontend dependencies
```

---

## Backend API
### User Routes
- `POST /api/users/register` — Register a new user
- `POST /api/users/login` — Login
- `POST /api/users/send-otp` — Send OTP to email
- `POST /api/users/verify-otp` — Verify OTP
- `GET /api/users/` — List users (admin)
- `PUT /api/users/:id` — Update user (admin)
- `DELETE /api/users/:id` — Delete user (admin)

### Promise Routes
- `GET /api/promises/` — List all promises
- `GET /api/promises/:id` — Get promise by ID
- `POST /api/promises/` — Create promise (admin)
- `PUT /api/promises/:id` — Update promise (admin)
- `DELETE /api/promises/:id` — Delete promise (admin)
- `PATCH /api/promises/:id/status` — Update status (admin/auditor)
- `GET /api/promises/:id/search-evidence` — Search for evidence (admin/auditor)
- `GET /api/promises/stats/:politicianId` — Stats by politician

### Attendance Routes
- `GET /api/attendance/attendance/:politicianId` — Get attendance by politician
- `POST /api/attendance/attendance/record` — Record attendance
- `GET /api/attendance/attendance/stats/compare` — Compare attendance
- `PUT /api/attendance/attendance/:recordId` — Update attendance
- `GET /api/attendance/parliament/sessions` — List sessions

### News Routes
- `GET /api/news/social/trends` — Get political trends
- `GET /api/news/archive/:id` — Get archived news (admin)
- `POST /api/news/verify/:id` — Verify news for promise (admin)
- `DELETE /api/news/link/:id` — Remove linked news (admin)
- `PUT /api/news/update/:id` — Update linked news (admin)

### Feedback Routes
- `POST /api/feedback/:promiseId` — Create feedback
- `GET /api/feedback/:promiseId` — Get feedback for promise
- `POST /api/feedback/:feedbackId/vote` — Vote on feedback
- `PATCH /api/feedback/:id` — Update feedback
- `DELETE /api/feedback/:id` — Delete feedback

### Notification Routes
- `GET /api/notifications/` — View all notifications (admin)
- `GET /api/notifications/my` — My notifications
- `GET /api/notifications/stats` — Notification stats
- `GET /api/notifications/filter` — Filter notifications
- `GET /api/notifications/type/:type` — By type
- `PATCH /api/notifications/read/:notificationId` — Mark as read
- `POST /api/notifications/` — Create notification (admin)
- `POST /api/notifications/send` — Send notification (admin)
- `POST /api/notifications/promotional` — Promotional notification (admin)

### Session Routes
- `POST /api/sessions/` — Create session
- `GET /api/sessions/` — List sessions
- `GET /api/sessions/:id` — Get session by ID
- `PUT /api/sessions/:id` — Update session
- `DELETE /api/sessions/:id` — Delete session

---

## Frontend Overview
- **Authentication:** Registration, login, OTP request/verify, context-based auth state.
- **Dashboard:** User/admin dashboard with protected routes.
- **News Page:** Fetches and displays political news.
- **Promise & Feedback:** View promises, submit feedback, vote, and see sentiment.
- **Notifications:** Dropdown for user notifications.
- **Responsive UI:** Built with Tailwind CSS and React components.

---

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or cloud)

### Backend
1. `cd Backend`
2. `npm install`
3. Create a `.env` file with:
     - `PORT=5000`
     - `MONGO_URI=your_mongodb_uri`
     - `JWT_SECRET=your_jwt_secret`
     - `SMTP_USER=your_email`
     - `SMTP_PASSWORD=your_email_password`
     - `NEWS_API_KEY=your_gnews_api_key`
4. `npm run dev` (or `npm start`)

### Frontend
1. `cd Frontend/Frontend`
2. `npm install`
3. `npm run dev`

---

## Usage
- Visit `http://localhost:5173` for the frontend.
- Backend runs on `http://localhost:5000`.
- Register as a user, login, and explore features.
- Admin users can manage data and view dashboards.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE)

