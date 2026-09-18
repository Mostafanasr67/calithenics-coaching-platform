# Calisthenics Coaching Platform - Project Documentation

## 1. Project Overview

This repository is a calisthenics coaching platform with a React + Tailwind frontend and a Node.js + Express + MongoDB backend.

Current state:
- Frontend pages exist for authentication, coach dashboard, client dashboard, client details, plan details, and creating a new client.
- Backend is partially built with `app.js`, Express routes, a MongoDB connection, and a `User` model.
- Authentication is only partially supported: the frontend has a signup form and the backend has `/auth/signup`, but login logic and persistent auth are missing.
- Many frontend pages still rely on hardcoded or outdated mock data and endpoint URLs.

Goal:
- Rebuild the backend in a stable way.
- Connect the frontend to a real API.
- Keep the architecture simple and practical while supporting coaches, clients, and a future admin role.

## 2. Current Frontend Architecture

### Folder structure

`Front End/src/`
- `pages/` - full page views: `login.js`, `coachDashboard.js`, `clientDashboard.js`, `clientDetails.js`, `planDetails.js`, `newClientForm.js`, `coachAbout.js`
- `components/` - reusable UI pieces: `AuthForm.js`, `LoginAside.js`, `LoginFormText.js`, `LoginNavBar.js`, `CoachNavBar.js`, `ClientNavBar.js`, `ClientCard.js`, `StatsCard.js`
- `context/` - contains `AuthContext.js`, currently a stub with no real behavior.
- `App.js` - application router configuration.

### Pages

- `login.js` - authentication page using a signup form and a visual hero panel.
- `coachDashboard.js` - coach roster page with a client list, stats, and navigation.
- `clientDashboard.js` - static client view with training block and plan cards.
- `clientDetails.js` - client detail page that attempts to fetch `/api/clients/:id`.
- `planDetails.js` - likely a plan summary page, currently mostly UI.
- `newClientForm.js` - form for adding a new client with file upload support.
- `coachAbout.js` - informational page for coach profile or about content.

### Components

- `AuthForm.js` - reusable form UI for login/signup.
- `LoginAside.js` - hero image panel used on the login page.
- `LoginFormText.js` - text block for login/signup page.
- `LoginNavBar.js` - top navbar for login/signup.
- `CoachNavBar.js` - coach navigation header.
- `ClientNavBar.js` - client navigation header.
- `ClientCard.js` - coach dashboard client card.
- `StatsCard.js` - summary stat component for dashboard.

### Routes

- `App.js` configures routes with React Router:
  - `/` → `Login`
  - `/coachDashboard` → `CoachDashboard`
  - `/clientDashboard` → `ClientDashboard`
  - `/clientDetails/:id` → `ClientDetails`
  - `/planDetails/:id` → `PlanDetails`
  - `/about` → `CoachAbout`
  - `/newClient` → `NewClientForm`

### Context/state management

- Local component state is used per page with `useState` and `useEffect`.
- `AuthContext.js` exists but only exports a stubbed `createContext` and does not manage auth state.
- No global auth provider is wired into the app.

### Reusable components

- `AuthForm` is the main reusable form UI for auth.
- Navbar components are reusable but not unified.
- `ClientCard` and `StatsCard` are reusable UI blocks for the coach dashboard.

### Forms

- `login.js` handles signup by posting data to `http://localhost:8080/auth/signup`.
- `newClientForm.js` handles client creation with a multipart `FormData` POST to `http://localhost:5000/api/clients`.
- `clientDetails.js` and `coachDashboard.js` fetch data from `http://localhost:5000/api/...`, but this backend does not exist in this repo.

### Existing data flow

- `login.js` actually sends signup requests to the backend.
- `coachDashboard.js` fetches clients from `localhost:5000/api/clients-data` and displays them.
- `clientDetails.js` fetches a client by ID from `localhost:5000/api/clients/:id`.
- `newClientForm.js` submits a new client to `localhost:5000/api/clients`.
- `clientDashboard.js` is mostly static with hardcoded plan cards and progress values.

### Mock data and temporary frontend-only logic

Missing or temporary logic includes:
- Hardcoded training progress and plan cards in `clientDashboard.js`.
- Static onboarding text in `LoginFormText.js`.
- Fake API fetch URLs on port `5000` that are not implemented in this backend.
- `AuthContext` is a stub and does not provide real authentication.

## 3. User Roles and Permissions

### Current roles

- `Coach` - implied by the existence of coach dashboard and client roster.
- `Client` - implied by the client dashboard and client details pages.

### Future roles

- `Admin` - not implemented but should be supported later.
- `Coach` - should manage clients, programs, and plans.
- `Client` - should view their own dashboard and progress.

### Role responsibilities

- `Admin` can manage coaches, clients, settings, and payments.
- `Coach` can manage clients, create programs, and assign workouts.
- `Client` can view plans, training progress, and personal details.

## 4. Complete Feature Inventory

| Feature | Current Status | Frontend Files | Required Backend Data | API Needed | Priority |
|---|---|---|---|---|---|
| Signup | Partially implemented | `login.js`, `AuthForm.js`, `routes/auth.js` | User creation in MongoDB | `PUT /auth/signup` | High |
| Login | Missing | `login.js`, `AuthForm.js`, `AuthContext.js` | Auth token/session | `POST /auth/login` | High |
| Coach roster | Partially implemented | `coachDashboard.js`, `ClientCard.js`, `StatsCard.js`, `CoachNavBar.js` | Client list | `GET /clients` | High |
| Client detail | Partially implemented | `clientDetails.js`, `CoachNavBar.js` | Client profile | `GET /clients/:id` | High |
| New client form | Partially implemented | `newClientForm.js` | Client creation | `POST /clients` | High |
| Client dashboard | UI only currently | `clientDashboard.js`, `ClientNavBar.js` | Client plan progress | `GET /client/me` | Medium |
| Plan details | UI only | `planDetails.js` | Plan/workout details | `GET /plans/:id` | Medium |
| Static coach about | UI only | `coachAbout.js` | None | None | Low |
| Feed API | Demo only | `Back End/routes/feed.js`, `controllers/feed.js` | None | `GET /feed`, `POST /feed` | Low |

## 5. Page-by-Page Analysis

### `login.js`
- Purpose: auth landing page.
- Current behavior: uses `AuthForm` to send signup request to backend.
- Current data source: local state and backend `/auth/signup`.
- Should eventually come from backend: auth signup, login, token handling, and form validation.
- Required models: `User`.
- Required API endpoints:
  - `PUT /auth/signup`
  - `POST /auth/login`
- Authentication: should eventually be unauthenticated for signup/login pages.

### `coachDashboard.js`
- Purpose: coach client roster and stats.
- Current behavior: fetches client objects from a hypothetical API and renders them.
- Current data source: `http://localhost:5000/api/clients-data`.
- Should eventually come from backend: client list, stat counts, and roles.
- Required models: `Client` or `User` with role `client`.
- Required API endpoints:
  - `GET /clients` or `GET /users?role=client`
- Authentication: should require coach or admin auth.

### `clientDashboard.js`
- Purpose: client-facing training overview.
- Current behavior: static data and hardcoded UI.
- Current data source: none.
- Should eventually come from backend: active training block, current plan, progress, sessions.
- Required models: `ClientProfile`, `Plan`, `Workout`, `Progress`.
- Required API endpoints:
  - `GET /client/me`
  - `GET /plans/:id`
- Authentication: should require authenticated client.

### `clientDetails.js`
- Purpose: view details for a specific client.
- Current behavior: attempts to fetch from `http://localhost:5000/api/clients/:id`.
- Current data source: not implemented on backend.
- Should eventually come from backend: client profile and training history.
- Required models: `ClientProfile`, possibly `Program` or `History`.
- Required API endpoints:
  - `GET /clients/:id`
- Authentication: coach/admin only.

### `newClientForm.js`
- Purpose: create a new client profile from coach UI.
- Current behavior: submits a `FormData` POST to `http://localhost:5000/api/clients`.
- Current data source: local state.
- Should eventually come from backend: client creation and file upload.
- Required models: `ClientProfile` or `User` with role `client`.
- Required API endpoints:
  - `POST /clients`
- Authentication: coach/admin only.

### `planDetails.js`
- Purpose: detail view for a plan or workout program.
- Current behavior: UI-only and likely static.
- Current data source: none.
- Should eventually come from backend: plan details, workouts, and progress metrics.
- Required models: `Plan`, `Workout`, `Session`.
- Required API endpoints:
  - `GET /plans/:id`
- Authentication: client/coach.

### `coachAbout.js`
- Purpose: informational page.
- Current behavior: static UI.
- Current data source: none.
- Should remain frontend content unless content is fetched.

## 6. Database Architecture

### Needed models

#### `User`
- Purpose: store all auth users, including coaches, admins, and clients.
- Important fields:
  - `email` (String, required, unique)
  - `password` (String, hashed)
  - `name` (String)
  - `role` (String, enum: [`client`, `coach`, `admin`], default `client`)
  - `status` (String, e.g. `Active`)
  - `age`, `weight`, `height`, `previousInjuries`, `primaryGoal`, `secondaryGoal`, `workoutFrequency`, `workoutLength`
  - `photo` or `avatar` (optional)
  - `test` (ObjectId ref `Test`)
- Relationships: clients can reference a `coachId` later or a `test` document.
- Why needed: currently used by backend auth and should be the single source for users.

#### `Test`
- Purpose: store client performance test results.
- Important fields: muscle ups, dips, pull ups, push ups, one-rep max fields.
- Relationship: referenced by `User.test`.
- Status: exists in repo.

#### Recommended future models

- `ClientProfile` or extend `User` for client-specific fields.
- `Plan` - training program details, weeks, focus, sessions.
- `Workout` - workout session structure, exercises, sets, reps.
- `Progress` - tracking progress metrics, completion, notes.
- `Payment` - subscription or invoice tracking.

### Comments on model design

Right now, `User` is the only real model required. Since the frontend already treats clients as list items and uses client-specific fields, you can either:
- keep `User` as the single model and store client fields inside it when `role: client`, or
- create a separate `ClientProfile` model linked to `User`.

For now, keep it simple: use `User` with `role` and client-specific fields.

## 7. API Architecture

### Existing backend routes

- `POST /feed` and `GET /feed` in `Back End/routes/feed.js` - demo endpoints only.
- `PUT /auth/signup` in `Back End/routes/auth.js` - user signup.

### Missing backend routes that are needed

- `POST /auth/login` (done)
- `GET /auth/me` or `GET /users/me`
- `GET /clients` - list of clients for coach. (done)
- `GET /clients/:id` - specific client profile. (done)
- `POST /clients` - create new client.
- `GET /plans/:id` - plan details.
- `GET /users?role=client` or `GET /clients-data` (frontend currently expects this).

### Recommended API grouping

#### Auth
- `PUT /auth/signup` - register coach/client/admin.
- `POST /auth/login` - login and return token.
- `GET /auth/me` - return authenticated user.

#### Clients
- `GET /clients` - coach sees clients.
- `GET /clients/:id` - get client detail.
- `POST /clients` - create a new client.
- `PATCH /clients/:id` - update client.

#### Plans / Programs
- `GET /plans` - list plans.
- `GET /plans/:id` - plan details.
- `POST /plans` - create plan.
- `PATCH /plans/:id` - update plan.

#### Feed / Demo
- `GET /feed`
- `POST /feed`

### Endpoint definitions

#### `PUT /auth/signup`
- Purpose: create a new user.
- Auth: public.
- Allowed roles: creates based on request body or default `client`.
- Body: `{ email, password, name, role? }`
- Response: `{ message, userId }`

#### `POST /auth/login`
- Purpose: authenticate and return token.
- Auth: public.
- Body: `{ email, password }`
- Response: `{ token, userId, role }`

#### `GET /clients`
- Purpose: list clients for coach.
- Auth: coach/admin.
- Response: `[{ id, fullName, state, programFocus, startDate, duration, photo, ... }]`

#### `GET /clients/:id`
- Purpose: get one client.
- Auth: coach/admin.

#### `POST /clients`
- Purpose: create a client profile.
- Auth: coach/admin.
- Body: form data for client profile.

## 8. FRONTEND ↔ BACKEND INTEGRATION

### Where to place API client logic

Create a `services/` or `api/` folder in `Front End/src/`.
Prefer:
- `services/api.js` for a generic fetch wrapper
- `services/auth.js` for auth endpoints
- `services/clients.js` for client-related endpoints

### Where API request functions should live

- `services/auth.js` → `signup`, `login`, `fetchCurrentUser`
- `services/clients.js` → `getClients`, `getClientById`, `createClient`
- `services/plans.js` → `getPlanById`, etc.

### Where authentication logic should live

- `context/AuthContext.js` should manage auth state, token storage, and login/logout.
- Wrap the app with `AuthProvider` in `Front End/src/index.js`.
- Keep auth state global since many pages will depend on it.

### Where global state should be stored

- Authentication and current user = `context/AuthContext`.
- UI theme or app-wide notifications can go in context if needed.

### Where page-specific state should be stored

- `pages/*.js` should keep local state for UI and form values.
- Example: `coachDashboard` local `clients`, `loading`, `filterType`.

### How loading states should work

- Use `useState` for `loading` and `error` on each page.
- Show `Loading...` or skeleton UI while waiting for data.

### How errors should work

- Use local state for page-level errors.
- Use a centralized error component later if desired.
- Display backend validation or fetch errors to the user.

### How auth tokens should be handled

- After login, save a JWT in `localStorage`.
- Use `AuthContext` to store the user and token.
- Send `Authorization: Bearer <token>` on protected API calls.

### How protected routes should work

- Use React Router with private route wrapper or conditional render.
- Example: if user is not logged in, redirect from `/coachDashboard` to `/`.
- Only protect pages after auth is stable.

### Folder meaning

- `components/` - shared UI pieces used across pages.
- `pages/` - route-level screens.
- `services/` or `api/` - API request functions and HTTP wrappers.
- `hooks/` - reusable React hooks like `useAuth` or `useFetch`.
- `context/` - global app state such as auth.
- `utils/` - shared utility functions and helpers.

## 9. LOGIC PLACEMENT GUIDE

### Feature: Create Workout Program

Frontend:
- Page/component: `pages/planDetails.js` or a new `pages/createPlan.js`
- API request: `services/plans.js` with `createPlan(data)`
- State: local page state for form fields + submission status
- Reusable hook if needed: `useForm` or `useApi` later
- Validation: simple UI validation in component before submit

Backend:
- Route: `routes/plans.js`
- Controller: `controllers/plans.js`
- Model: `models/plan.js`
- Middleware: `middleware/isAuth.js`, `middleware/isCoach.js`
- Validation: `express-validator` field validation in route

Why:
- React UI belongs in `pages/` because it is the route view.
- API service belongs in `services/` so pages stay small.
- Express route belongs in `routes/` as the URL mapping layer.
- Middleware belongs before controller to enforce auth.
- Controller contains app logic, model talks to MongoDB.

## 10. WHAT SHOULD I DO NEXT?

### NEXT STEP 1: Fix backend entry points and start a real server.

Files to create/modify:
- `Back End/app.js` - already exists, but confirm router and error middleware.
- `Back End/routes/auth.js` - currently exists; keep signup and add login.
- `Back End/routes/clients.js` - create this route file.
- `Back End/controllers/clients.js` - create controller functions.
- `Back End/models/user.js` - already exists; extend fields if needed.
- `Back End/middleware/isAuth.js` - create auth middleware later.

Why:
- You need a working backend before frontend pages can talk to it.
- The current frontend and backend are not aligned on URL/port and data shape.

### NEXT STEP 2: Create the `User` model and `auth` flow.

Explain:
- `models/user.js` belongs in backend models.
- It stores email, password, role, name, and client fields.
- Auth routes belong in `routes/auth.js`.
- Auth controllers belong in `controllers/auth.js`.
- Frontend should use `services/auth.js` to call login/signup.

### NEXT STEP 3: Connect the coach dashboard data flow.

Explain:
- `coachDashboard.js` belongs in frontend pages.
- It should call backend `GET /clients`.
- Backend should return client records from MongoDB.
- This is the first real page-to-backend integration after auth.

## 11. CURRENT MISSING OR BROKEN LOGIC

### Missing logic
- Login endpoint and flow.
- Protected route handling.
- Real backend client data endpoints.
- Client creation endpoint on current backend.
- Consistent API base URL and port.

### Deleted or incomplete logic
- `AuthContext` has no implementation.
- `clientDashboard` is static/hardcoded and not connected to backend.
- `clientDetails` fetches from a backend route that does not exist in this repo.
- `newClientForm` posts to `localhost:5000`, but backend listens on `8080`.

### Temporary/mock data
- static progress and plans in `clientDashboard.js`
- sample client cards in `coachDashboard.js` that rely on a fake API
- hardcoded UI text in login and client components

### Features needing backend integration now
- Signup and login
- Coach client list
- Client detail fetch
- New client creation
- Auth token management

## 12. DEVELOPMENT ROADMAP

### Phase 1: Project architecture
- Finalize backend folder structure.
- Align frontend routes with actual backend endpoint names.
- Create service layer in frontend.

### Phase 2: Backend setup
- Build `User` model.
- Implement auth routes: signup, login.
- Add MongoDB connection and error handling.
- Add auth middleware stub.

### Phase 3: Authentication
- Build frontend auth service.
- Implement `AuthContext` and `AuthProvider`.
- Add login page and protected route logic.

### Phase 4: Client management
- Add `/clients` endpoints.
- Connect coach dashboard to backend.
- Implement client creation from `newClientForm`.

### Phase 5: Exercise library
- Plan this after clients and auth are stable.
- Add models for `Plan` and `Workout`.

### Phase 6: Workout programs
- Connect `planDetails` to backend data.
- Add program assignment logic.

### Phase 7: Progress tracking
- Track session completion and metrics.
- Add `Progress` or `Performance` model.

### Phase 8: Payments
- Plan it later once core platform exists.

### Phase 9: Testing
- Add API tests and frontend smoke tests.

### Phase 10: Deployment
- Deploy backend and frontend separately.
- Use environment variables for API URLs.

## Summary

This repo is currently at an early integration stage. The frontend is mostly built UI with partial API calls, while the backend only provides signup and a demo feed. The first practical work is to stabilize auth and client APIs, then wire the frontend pages to the real backend.

---

### What I just built
Created `PROJECT_DOCUMENTATION.md` with a full analysis of the current codebase, architecture, missing logic, and next steps.

### Where the logic belongs
- Backend logic belongs in `Back End/routes/`, `Back End/controllers/`, `Back End/models/`, and `Back End/middleware/`.
- Frontend page logic belongs in `Front End/src/pages/`.
- Shared UI belongs in `Front End/src/components/`.
- API requests belong in a new `Front End/src/services/` folder.

### What you should do next
1. Fix backend structure and router alignment.
2. Create `User` auth flow with `signup` and `login`.
3. Connect `coachDashboard.js` to a real `/clients` API.

### Files to create or modify
- `Back End/routes/clients.js`
- `Back End/controllers/clients.js`
- `Back End/middleware/isAuth.js`
- `Front End/src/services/auth.js`
- `Front End/src/services/clients.js`
- `Front End/src/context/AuthContext.js`
