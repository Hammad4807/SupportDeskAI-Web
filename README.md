# SupportDesk AI – Web

A Jira-style React frontend for the **SupportDesk AI** API (separate repository: **SupportDeskAI**).
Built with **React 19 + TypeScript + Vite**.

## Features

| Page | What you can do | API |
|---|---|---|
| **Dashboard** (`/dashboard`) | Ticket counts (total, open, in progress, resolved, closed, high priority, not analyzed); cards link to the filtered list | `GET /api/dashboard/summary` |
| **Tickets** (`/tickets`) | List with Status / Priority / Category filters (kept in the URL), create a ticket | `GET /api/tickets`, `POST /api/tickets` |
| **Ticket detail** (`/tickets/:id`) | Edit title and description, change status and priority | `GET`, `PUT /api/tickets/{id}`, `PATCH /api/tickets/{id}/status` |
| **AI insights** (on the detail page) | Analyze with AI (category, sentiment, summary, suggested action), draft a reply in an editable box with Copy to clipboard | `POST /api/tickets/{id}/analyze`, `POST /api/tickets/{id}/draft-reply` |

AI drafts are **never sent**: there is no Send button. The agent reviews, edits and copies the text.
When the API uses the mock AI provider, results are marked with a "Mock AI" badge.

Errors from the API (400, 404, 502, 503, 504, 500) are shown in the page with their message and **Error ID**
(the API `traceId`, which matches the server log). Unexpected rendering errors are caught by an error boundary.

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

Open **http://localhost:5173**. The API must be running, and its CORS setting must allow `http://localhost:5173`
(the default in the API's `appsettings.json`).

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
  api/          client.ts (fetch wrapper, ProblemDetails -> ApiError), tickets.ts, dashboard.ts
  types/        TypeScript shapes of the API DTOs
  pages/        DashboardPage, TicketsPage, TicketDetailPage, NotFoundPage
  components/   layout (TopNav, Sidebar, AppLayout), CreateTicketModal, EditTicketForm, StatusSelect,
                AiInsightsPanel, DraftReplyBox, StatusLozenge, PriorityIcon, ProviderBadge, Flag,
                StateMessage, ErrorBoundary
  hooks/        useAsync (load data with loading/error state and cancellation), useLayout
  utils/        ticketMeta (status/priority names, allowed categories), ticketValidation, format
```

Status and priority are sent by the API as numbers (0..3); `src/utils/ticketMeta.ts` maps them to names and colours.

## Known limitations

- No login: anyone who can open the app can use every feature (authentication is out of scope).
- The ticket does not store which AI provider produced a saved analysis; a saved mock analysis is recognised by its `[MOCK]` prefix.
- Desktop-first layout; the sidebar is hidden on narrow screens.
