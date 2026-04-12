
# JusticeLink Platform

JusticeLink is a full-stack civic transparency platform for tracking political promises, parliamentary activity, public feedback, and related news.

## Table of Contents
- [Overview](#overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [🚀 I. Setup Instructions](#-i-setup-instructions)
- [📡 II. API Endpoint Documentation](#-ii-api-endpoint-documentation)
- [🧪 III. Testing](#-iii-testing)
- [🌐 IV. Deployment](#-iv-deployment)
- [🛠️ V. Tech Stack](#️-v-tech-stack)
- [📁 VI. Project Structure](#-vi-project-structure)
- [✅ VII. Evaluation Checklist](#-vii-evaluation-checklist)
- [📌 VIII. Submission Notes](#-viii-submission-notes)
- [Evaluation Dates](#evaluation-dates)

## Quick Links
- [Deployment Report](Deployment-Report.md)
- [Testing Instructions Report](Testing-Instructions-Report.md)
- [Deployment Evidence Folder](docs/deployment/)
- [Testing Evidence Folder](docs/testing/)

## Overview
The platform is designed to:
- Track campaign and parliamentary promises.
- Monitor attendance and session participation.
- Collect and moderate citizen feedback.
- Publish political news and related trends.
- Deliver user notifications and alerts.

## Core Features
- User registration/login with JWT-based authentication.
- Role-based access control for citizen/admin flows.
- Promise management with status tracking.
- Attendance and session monitoring.
- Feedback and voting workflows.
- Notification management and read-status tracking.
- Admin-facing dashboards for moderation.

## Architecture
- Backend: Express.js REST API with MongoDB (Mongoose).
- Frontend: React + Vite SPA.
- Auth: JWT bearer tokens.

## 🚀 I. Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas or local MongoDB instance

### Backend Setup
1. Open terminal in `Backend`.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create `Backend/.env` with the required variables listed in [Environment Variables](#environment-variables).
4. Run backend:
    ```bash
    npm run dev
    ```
5. Backend default local URL: `http://localhost:5000`

### Frontend Setup
1. Open terminal in `frontend`.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create `frontend/.env` and set:
    ```env
    VITE_API_URL=http://localhost:5000
    ```
4. Run frontend:
    ```bash
    npm run dev
    ```
5. Frontend default local URL: `http://localhost:5173`

## 📡 II. API Endpoint Documentation

### Base URL
- Production: `https://janaya360-web-development-project.onrender.com`
- Local: `http://localhost:5000`

### Authentication
- Scheme: `Bearer <JWT_TOKEN>`
- Header:
    ```http
    Authorization: Bearer <token>
    ```

### Request/Response Format
- Request body: JSON (`Content-Type: application/json`)
- Successful responses: JSON object/array with resource data
- Error responses: JSON with error message and HTTP status code

### Endpoint Groups

#### Users
- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/send-otp`
- `POST /api/users/verify-otp`
- `GET /api/users` (auth/admin)
- `GET /api/users/me` (auth)
- `PUT /api/users/:id` (auth/admin)
- `DELETE /api/users/:id` (auth/admin)

#### Promises
- `GET /api/promises`
- `GET /api/promises/:id`
- `POST /api/promises` (auth/admin)
- `PUT /api/promises/:id` (auth/admin)
- `DELETE /api/promises/:id` (auth/admin)
- `PATCH /api/promises/:id/status` (auth/admin)
- `GET /api/promises/stats/:politicianId`

#### Politicians
- `GET /api/politicians`
- `POST /api/politicians` (auth/admin)
- `PUT /api/politicians/:id` (auth/admin)
- `DELETE /api/politicians/:id` (auth/admin)

#### Attendance and Sessions
- `GET /api/attendance/attendance/:politicianId`
- `POST /api/attendance/attendance/record`
- `GET /api/attendance/attendance/stats/compare`
- `PUT /api/attendance/attendance/:recordId`
- `GET /api/attendance/parliament/sessions`
- `POST /api/sessions`
- `GET /api/sessions`
- `GET /api/sessions/:id`
- `PUT /api/sessions/:id`
- `DELETE /api/sessions/:id`

#### News
- `GET /api/news/public`
- `GET /api/news/social/trends`
- `GET /api/news/archive/:id` (auth/admin)
- `POST /api/news/verify/:id` (auth/admin)
- `PUT /api/news/update/:id` (auth/admin)
- `DELETE /api/news/link/:id` (auth/admin)

#### Feedback
- `POST /api/feedback/:promiseId`
- `GET /api/feedback/:promiseId`
- `POST /api/feedback/:feedbackId/vote`
- `PATCH /api/feedback/:id`
- `DELETE /api/feedback/:id`

#### Notifications
- `GET /api/notifications` (auth/admin)
- `GET /api/notifications/my` (auth)
- `GET /api/notifications/stats` (auth)
- `GET /api/notifications/filter` (auth)
- `GET /api/notifications/type/:type` (auth)
- `PATCH /api/notifications/read/:notificationId` (auth)
- `POST /api/notifications` (auth/admin)
- `POST /api/notifications/send` (auth/admin)
- `POST /api/notifications/promotional` (auth/admin)

### Example Request and Response

Example: Login

```http
POST /api/users/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "your_password"
}
```

```json
{
    "success": true,
    "token": "<jwt-token>",
    "user": {
         "_id": "...",
         "name": "Sample User",
         "email": "user@example.com",
         "role": "citizen"
    }
}
```

## 🧪 III. Testing

### 1. Unit Testing
Current status:
- Backend has a Jest test command in `Backend/package.json`.
- Frontend includes one test file: `frontend/src/App.test.js`.

Run commands:
```bash
# backend
cd Backend
npm test
```

Recommended additions to satisfy grading rubric:
1. Add unit tests for controller helper logic and middleware behavior.
2. Mock database and external APIs for isolated tests.
3. Include pass/fail screenshots in [docs/testing/](docs/testing/).

### 2. Integration Testing
Scope:
- Validate interactions between routes, controllers, middleware, and MongoDB.
- Validate success and error scenarios for each major endpoint.

Setup and execution:
1. Start backend with test-safe environment variables.
2. Use Postman collection to run endpoint flows.
3. Validate status codes, response body shape, and DB side effects.

Recommended report items:
1. Tested endpoint list with expected vs actual outcomes.
2. Evidence screenshots from Postman runner.
3. Notes for unauthorized, invalid payload, and not-found scenarios.

### 3. Performance Testing
Tool suggestion: Artillery.

Setup:
```bash
npm install -g artillery
```

Example quick test command:
```bash
artillery quick --count 20 --num 10 https://janaya360-web-development-project.onrender.com/api/promises
```

Report requirements:
1. Test scenario and load profile.
2. Throughput and latency summary.
3. Error rate and bottleneck observations.

### Testing Environment Configuration Details
- Backend: Node.js + Express.js
- Database: MongoDB Atlas
- API Tooling: Postman
- Performance Tooling: Artillery
- Frontend: React + Vite

## 🌐 IV. Deployment

### Live URLs
- Deployed backend API: https://janaya360-web-development-project.onrender.com
- Deployed frontend application: https://janaya360-web-development-project.vercel.app/

### Backend Deployment Platform and Setup Steps (Render)
1. Push backend code to GitHub.
2. In Render, create a new Web Service from the repository.
3. Set root directory to `Backend`.
4. Build command:
    ```bash
    npm install
    ```
5. Start command:
    ```bash
    npm start
    ```
6. Add environment variables from [Environment Variables](#environment-variables) in Render dashboard.
7. Deploy and verify health by opening:
    - `https://janaya360-web-development-project.onrender.com`

### Frontend Deployment Platform and Setup Steps (Vercel)
1. Push frontend code to GitHub.
2. In Vercel, import the same repository.
3. Set project root directory to `frontend`.
4. Build command:
    ```bash
    npm run build
    ```
5. Output directory: `dist`
6. Add frontend environment variable:
    - `VITE_API_URL=https://janaya360-web-development-project.onrender.com`
7. Deploy and verify by opening:
    - `https://janaya360-web-development-project.vercel.app/`

### Environment Variables
Secrets are not exposed in this repository. Use secure platform dashboards (Render/Vercel) to configure them.

#### Backend (`Backend/.env`)
- `PORT` - server port (example: `5000`)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - frontend URL for CORS/email links
- `NEWS_API_KEY` - news provider API key
- `SMTP_HOST` - SMTP host
- `SMTP_PORT` - SMTP port
- `SMTP_USER` - SMTP username/email
- `SMTP_PASSWORD` - SMTP password/app password
- `EMAIL_USER` - sender email (if used by utility module)
- `EMAIL_PASS` - sender password/app password (if used by utility module)

#### Frontend (`frontend/.env`)
- `VITE_API_URL` - base URL of backend API

### Deployment Evidence (Screenshots)
Add screenshots to clearly prove successful deployment.

Minimum recommended evidence:
1. Render dashboard showing successful backend deployment status.
2. Browser tab showing live backend URL responding.
3. Vercel dashboard showing successful frontend deployment status.
4. Browser tab showing live frontend application running.

Suggested path for storing evidence:
- [docs/deployment/](docs/deployment/)

Backend evidence locations:
1. [docs/deployment/backend-render-overview.png](docs/deployment/backend-render-overview.png)
2. [docs/deployment/backend-live-url-response.png](docs/deployment/backend-live-url-response.png)

Frontend evidence locations:
1. [docs/deployment/frontend-vercel-overview.png](docs/deployment/frontend-vercel-overview.png)
2. [docs/deployment/frontend-live-url-view.png](docs/deployment/frontend-live-url-view.png)

## 🛠️ V. Tech Stack
- Backend: `express`, `mongoose`, `jsonwebtoken`, `dotenv`, `nodemailer`, `swagger-jsdoc`, `swagger-ui-express`
- Frontend: `react`, `react-router-dom`, `axios`, `vite`, `tailwindcss`

## 📁 VI. Project Structure
```text
Backend/
    Controller/
    Middleware/
    Model/
    Routes/
    Utils/
    Logs/
    index.js
    package.json

frontend/
    public/
    src/
         components/
         pages/
         App.jsx
         index.jsx
    package.json

README.md
```

## ✅ VII. Evaluation Checklist
- Correctness and overall functionality.
- Creativity and UI/UX implementation quality.
- Code readability and best practices.
- Documentation completeness.
- Git workflow quality with meaningful commit history.
- Testing depth and quality.
- Viva performance.

## 📌 VIII. Submission Notes

### Quick Document Links
- [Deployment-Report.md](Deployment-Report.md)
- [Testing-Instructions-Report.md](Testing-Instructions-Report.md)
- [docs/deployment/](docs/deployment/)
- [docs/testing/](docs/testing/)

### Third-Party API Integration
- News API integration for social/political trend data.
- SMTP/email integration for OTP and notifications.
- External integrations in chatbot/notification workflows.

### Source Code Submission
- Submit complete source via GitHub.
- Keep clean and meaningful commit history.
- Avoid late changes after the deadline window.

### Documentation Submission
Include:
1. This README with setup and API endpoint details.
2. [Deployment-Report.md](Deployment-Report.md).
3. [Testing-Instructions-Report.md](Testing-Instructions-Report.md) with:
     - How to run unit tests
     - Integration testing setup and execution
     - Performance testing setup and execution
     - Testing environment configuration

### Deployment Report Note
The deployment section above includes required platform details, setup steps, environment variable handling, live URLs, and evidence checklist.
The standalone report is available in [Deployment-Report.md](Deployment-Report.md).

## Evaluation Dates
- Evaluation 01: 27 February 2026
- Evaluation 02: 12 April 2026 (fixed deadline)

