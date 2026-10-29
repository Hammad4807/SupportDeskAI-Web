# SupportDesk AI – Web

A Jira-style React frontend for the **SupportDesk AI** API (separate repository: **SupportDeskAI**).
Built with **React 19 + TypeScript + Vite**.

This app is optional (Swagger is enough for the API). The database setup, endpoint examples and the MCP server are
documented in the API repository's README.

## Features

| Page | What you can do | Who | API |
|---|---|---|---|
| **Login / Sign up** (`/login`, `/register`) | Email + password, or **Continue with Google**. New accounts are Customers | everyone | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/external-login` |
| **Dashboard** (`/dashboard`) | Ticket counts (total, open, in progress, resolved, closed, high priority, not analyzed); cards link to the filtered list | Staff, Admin | `GET /api/dashboard/summary` |
| **Tickets** (`/tickets`) | List with Status / Priority / Category filters (kept in the URL), create a ticket. Staff also see the **Reporter** | all (Customer: "My tickets") | `GET /api/tickets`, `POST /api/tickets` |
| **Ticket detail** (`/tickets/:id`) | Edit title and description, change status and priority | Staff, Admin; Customer: edit own while Open, only close | `GET`, `PUT /api/tickets/{id}`, `PATCH /api/tickets/{id}/status` |
| **AI insights** (on the detail page) | Analyze with AI (category, priority, sentiment, summary, suggested action; saved on the ticket), draft a reply in an editable box with Copy to clipboard | Staff, Admin | `POST /api/tickets/{id}/analyze`, `POST /api/tickets/{id}/draft-reply` |
| **Users** (`/users`) | List users and change their role (Customer / Staff / Admin) | Admin | `GET /api/users`, `PUT /api/users/{id}/role` |
| **Your account** (`/account`, from the avatar menu) | Profile and role; a Google-only account can add a password | everyone | `GET /api/auth/me`, `POST /api/auth/set-password` |

AI drafts are **never sent**: there is no Send button. The agent reviews, edits and copies the text.
When the API uses the mock AI provider, results are marked with a "Mock AI" badge.

Errors from the API (400, 404, 502, 503, 504, 500) are shown in the page with their message and **Error ID**
(the API `traceId`, which matches the server log). Unexpected rendering errors are caught by an error boundary.

## Login and roles

- After login the API's JWT is kept in `localStorage` (`src/auth/tokenStorage.ts`), so a page refresh keeps you
  logged in. `src/api/client.ts` sends it with every request as `Authorization: Bearer <token>`.
- On start, `AuthProvider` asks `GET /api/auth/me` who the saved token belongs to. Roles shown in the UI always come
  from the API, never from decoding the token in the browser.
- Not logged in -> `/login` (and back to the page you asked for after login). A page your role may not use shows
  "You don't have access". A **401** on a request (token expired) logs you out with "Your session has expired".
- Google: the button is a plain link to the API. After Google the API redirects to `/auth/callback#token=...`,
  where the token is saved and removed from the URL.
- All role rules are in **one file**, `src/auth/permissions.ts` (the frontend copy of the API's `Policies.cs` and
  ticket rules). Hiding a button only keeps the UI clean: the API checks the role and ownership on every request.
- Log out deletes the token in the browser. A role changed by an Admin applies the next time that user logs in.

For the Admin account, the JWT key and Google setup, see "Authentication and roles" in the API README.

## Prerequisites

- **Node.js 20.19+** (developed with Node 24 LTS; with nvm-windows: `nvm install lts` then `nvm use <version>`)
- The **SupportDesk AI API** running on `http://localhost:5249` (see its README)

## Setup and run

```powershell
git clone <this-repository-url>
cd SupportDeskAI-Web
npm install
npm run dev
```

Open **http://localhost:5173** (it redirects to `/login`; after login Staff and Admin start on `/dashboard`,
Customers on `/tickets`). The API must be running, and its CORS setting must
allow `http://localhost:5173` (the default in the API's `appsettings.json`). The port is fixed (`strictPort` in
`vite.config.ts`): if 5173 is already in use, `npm run dev` stops with an error instead of picking another port.

## Configuration

`.env.development` (committed, no secrets):

```
VITE_API_BASE_URL=http://localhost:5249
```

To use another API address, create `.env.development.local` (git-ignored) with your own `VITE_API_BASE_URL`.
Never put secrets in `VITE_` variables: they are visible in the browser.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 5173 |
| `npm run build` | Type-check (TypeScript) and build for production into `dist/` |
| `npm run lint` | Lint with oxlint |
| `npm run preview` | Serve the production build locally |

## Project structure

```
src/
  api/          client.ts (fetch wrapper, Bearer token, ProblemDetails -> ApiError), tickets.ts, dashboard.ts,
                auth.ts, users.ts
  auth/         AuthProvider + authContext (who is logged in), tokenStorage, permissions (role rules in one place)
  types/        TypeScript shapes of the API DTOs (ticket.ts, auth.ts)
  pages/        LoginPage, RegisterPage, AuthCallbackPage, DashboardPage, TicketsPage, TicketDetailPage,
                UsersPage, AccountPage, NotFoundPage
  components/   layout (TopNav, UserMenu, Sidebar, AppLayout), RequireAuth (route guard), GoogleButton,
                CreateTicketModal, EditTicketForm, StatusSelect, AiInsightsPanel, DraftReplyBox, StatusLozenge,
                PriorityIcon, ProviderBadge, Flag, StateMessage, ErrorBoundary
  hooks/        useAsync (load data with loading/error state and cancellation), useLayout, useAuth
  utils/        ticketMeta (status/priority/category names, sentiments, length limits), ticketValidation,
                authValidation (password rules), format
```

Status and priority (0..3) and category (0..6) are sent by the API as numbers, the same as the backend enums;
`src/utils/ticketMeta.ts` maps them to names and colours. The list filters use the same numbers in the URL,
e.g. `/tickets?status=0&priority=2&category=1`.

## Known limitations

- The token is stored in `localStorage`, which a script injected through an XSS bug could read (an HttpOnly cookie
  would be safer). There are no refresh tokens: after the token expires (60 minutes by default) you log in again.
- The ticket does not store which AI provider produced a saved analysis; a saved mock analysis is recognised by its `[MOCK]` prefix.
- Desktop-first layout; the sidebar is hidden on narrow screens.
