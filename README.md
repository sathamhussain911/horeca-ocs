# FFC HORECA Operations Center

Production-grade React + Supabase app for HORECA department — productivity tracking, team order assignment, break management, and real-time reporting.

## Quick Start

```bash
npm install
cp .env.example .env.local   # add your Supabase credentials
npm run dev
```

## Full Deployment Guide

See **[DEPLOY.md](./DEPLOY.md)** for complete step-by-step instructions:
- Supabase database setup
- GitHub repository
- Cloudflare Pages deployment (auto-deploy on push)
- Custom domain setup

## Modules

| Module | Desktop | Mobile |
|--------|---------|--------|
| Productivity | ✅ Order queue, team assignment, progress tracking | ✅ Touch-optimized orders + qty stepper |
| Break Tracker | ✅ Check-out/in, live timers, reason log | ✅ Big tap targets, reason icon grid |
| Reports | ✅ Daily summary, team stats, break analysis | ✅ Simplified mobile view |
| Staff | ✅ Roster, teams, shifts | — |

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime (WebSockets)
- **Hosting**: Cloudflare Pages
- **Mobile**: Auto-detected, separate responsive UI for < 768px
