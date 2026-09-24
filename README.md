# Realtime Chat App

A full-stack real-time chat application built with React, Express, Socket.IO and PostgreSQL.

> **Status: Phase 3 — authentication complete.** Users can register, sign in/out, stay signed in across reloads and reset their password.
> Chat features are **not implemented yet**. See the [roadmap](#roadmap) for progress.

## Planned features

- Email/password authentication with JWT access + refresh tokens
- Password reset via email
- User profiles with avatars
- One-to-one and group conversations
- Real-time messaging with Socket.IO
- Online presence and typing indicators
- Delivery and read receipts
- Message replies, editing, deletion and emoji reactions
- Image and file attachments (Cloudinary)
- In-app notifications
- User and message search
- Light/dark theme, responsive layout

## Tech stack

| Layer    | Technologies |
| -------- | ------------ |
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui, React Router, Zustand, Axios, Socket.IO Client, React Hook Form, Zod, Lucide React, Framer Motion, date-fns |
| Backend  | Node.js, Express 5, Socket.IO, JWT, bcrypt, Multer, Nodemailer, Helmet, CORS, express-rate-limit |
| Database | PostgreSQL, Prisma ORM 7 (with `@prisma/adapter-pg`) |
| Storage  | Cloudinary |

## Folder structure

```
realtime-chat-app/
├── client/                     # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components (added via CLI)
│   │   │   ├── chat/           # Chat layout, sidebar, message list, input…
│   │   │   ├── message/        # Message actions, reactions, replies, attachments
│   │   │   ├── profile/        # Profile card and dialog
│   │   │   └── layout/         # Navbar, protected layout, auth layout
│   │   ├── pages/              # Route-level pages
│   │   ├── hooks/              # useSocket, useTheme…
│   │   ├── stores/             # Zustand stores (auth, chat, socket, user, notification, ui)
│   │   ├── services/           # Axios instance, API services, Socket.IO client
│   │   ├── utils/              # Formatting helpers
│   │   ├── lib/                # cn(), env config, socket event names
│   │   ├── routes/             # Router definition and route guards
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           # Tailwind + shadcn/ui theme tokens
│   ├── components.json         # shadcn/ui config
│   ├── .env.example
│   └── vite.config.js
│
├── server/                     # Express + Socket.IO backend
│   ├── prisma/
│   │   └── schema.prisma       # Database models
│   ├── prisma.config.js        # Prisma 7 config (DB URL, migrations path)
│   ├── src/
│   │   ├── config/             # env, Prisma client, Cloudinary, CORS
│   │   ├── controllers/
│   │   ├── routes/             # auth, user, conversation, message, upload, notification
│   │   ├── services/
│   │   ├── middleware/         # error handling, rate limiting
│   │   ├── socket/             # Socket.IO setup and event names
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── generated/          # Prisma client output (git-ignored)
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # HTTP + Socket.IO server entry point
│   ├── uploads/                # Temporary local uploads (git-ignored)
│   ├── nodemon.json
│   └── .env.example
│
└── README.md
```

## Prerequisites

- Node.js **22.18+** (the server imports the Prisma-generated TypeScript client directly, which relies on Node's built-in type stripping)
- npm
- PostgreSQL 14+ (local install, Docker, or a hosted provider such as Neon or Supabase)
- A Cloudinary account (needed from Phase 11)
- SMTP credentials for production email (optional in development, see below)

## Setup

```bash
# 1. Install dependencies
cd client && npm install
cd ../server && npm install

# 2. Create environment files
cp client/.env.example client/.env
cp server/.env.example server/.env
# then fill in the values (see below)

# 3. Generate the Prisma client (also runs automatically after `npm install` in server/)
cd server
npm run prisma:generate
```

On Windows PowerShell use `Copy-Item` instead of `cp`.

## Environment variables

### `server/.env`

| Variable | Description |
| -------- | ----------- |
| `NODE_ENV` | `development` or `production` |
| `PORT` | API port (default `5000`) |
| `SERVER_URL` | Public URL of the API |
| `CLIENT_URL` | Frontend origin(s) allowed by CORS and Socket.IO, comma-separated |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Access-token secret and lifetime |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN` | Refresh-token secret and lifetime |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | Outgoing email. Optional in development: when empty, emails go to a free [Ethereal](https://ethereal.email) test inbox and the server prints a preview link (plus the reset link itself). Required in production. |

`CLIENT_URL`, `DATABASE_URL`, `JWT_SECRET` and `JWT_REFRESH_SECRET` are required in production. In development the server starts without them and prints a warning.

### `client/.env`

| Variable | Description |
| -------- | ----------- |
| `VITE_API_URL` | REST API base URL, e.g. `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.IO server URL, e.g. `http://localhost:5000` |

Never commit `.env` files. Only the `.env.example` files are tracked.

## Database setup

1. Create a PostgreSQL database (local, or hosted such as Prisma Postgres, Neon or Supabase).
2. Set `DATABASE_URL` in `server/.env`:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/realtime_chat?schema=public
   ```
3. Review `server/prisma/schema.prisma`.
4. Create and apply the first migration:
   ```bash
   cd server
   npm run prisma:migrate -- --name init
   ```
5. Optionally inspect the data with `npm run prisma:studio`.

## Authentication

- **Access token**: short-lived JWT (15 min), kept in memory on the client and sent as `Authorization: Bearer <token>`.
- **Refresh token**: long-lived JWT (7 days) in an `httpOnly` cookie scoped to `/api/auth`. It is never readable from JavaScript.
- **Sessions**: each sign-in creates a row in `sessions` storing only a SHA-256 hash of the refresh token. The token is rotated on every refresh. Replaying an old token revokes that session (theft detection), with a 30-second grace window for tabs refreshing at the same moment.
- **Passwords**: bcrypt (12 rounds). Login responds identically for unknown users and wrong passwords.
- **Password reset**: single-use token, valid for 30 minutes and stored hashed. A successful reset signs out every device. The forgot-password response never reveals whether an account exists.
- **Rate limits**: failed login/register/reset attempts are limited to 20 per 15 minutes, and forgot-password requests to 5 per 15 minutes.

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/auth/register` | — | Create an account and sign in |
| POST | `/api/auth/login` | — | Sign in with email or username |
| POST | `/api/auth/refresh` | cookie | New access token and rotated refresh cookie |
| POST | `/api/auth/logout` | cookie | Revoke this device's session |
| GET | `/api/auth/me` | Bearer | Current user |
| POST | `/api/auth/forgot-password` | — | Email a reset link |
| POST | `/api/auth/reset-password` | — | Set a new password with a reset token |

## Development commands

Run the frontend and backend in two terminals:

```bash
# Terminal 1: API + Socket.IO on http://localhost:5000
cd server
npm run dev

# Terminal 2: frontend on http://localhost:5173
cd client
npm run dev
```

| Location | Command | Description |
| -------- | ------- | ----------- |
| `client` | `npm run dev` | Vite dev server |
| `client` | `npm run build` | Production build to `dist/` |
| `client` | `npm run lint` | ESLint |
| `client` | `npx shadcn@latest add button` | Add a shadcn/ui component |
| `server` | `npm run dev` | Start with nodemon (auto-restart) |
| `server` | `npm start` | Start without nodemon |
| `server` | `npm run prisma:generate` | Regenerate the Prisma client |
| `server` | `npm run prisma:validate` | Validate the schema |
| `server` | `npm run prisma:migrate` | Create/apply a migration (development) |
| `server` | `npm run prisma:deploy` | Apply migrations (production) |
| `server` | `npm run prisma:studio` | Open Prisma Studio |

Health check: `GET http://localhost:5000/api/health` returns `200` with `"database": "up"` when PostgreSQL is reachable, or `503` with `"database": "down"` otherwise.

## Roadmap

- [x] **Phase 1**: Project setup
- [x] **Phase 2**: Database + Prisma
- [x] **Phase 3**: Authentication
- [ ] Phase 4: User profiles
- [ ] Phase 5: Conversations
- [ ] Phase 6: Messages
- [ ] Phase 7: Socket.IO real-time messaging
- [ ] Phase 8: Presence + typing indicators
- [ ] Phase 9: Read/delivery status
- [ ] Phase 10: Message editing/deletion/reactions
- [ ] Phase 11: File/image uploads
- [ ] Phase 12: Group chat
- [ ] Phase 13: Notifications
- [ ] Phase 14: Search
- [ ] Phase 15: UI polish
- [ ] Phase 16: Responsive/mobile optimization
- [ ] Phase 17: Testing
- [ ] Phase 18: Security/performance
- [ ] Phase 19: Deployment
- [ ] Phase 20: Documentation

## Future ideas

- Voice and video calls (WebRTC)
- Push notifications (Web Push)
- End-to-end encryption
- Message pinning and starred messages
- Redis adapter for horizontally scaling Socket.IO
