# 🚀 Deployment Guide — FFC HORECA Operations Center
## Stack: GitHub → Cloudflare Pages + Supabase

---

## OVERVIEW

```
Your Code (GitHub) ──► Cloudflare Pages (auto-deploys on push)
                              │
                              ▼
                        Supabase (database + realtime)
```

Every time you push to GitHub → Cloudflare automatically rebuilds and deploys. Zero manual work.

---

## STEP 1 — Set Up Supabase (5 min)

### 1.1 Create Project
1. Go to https://supabase.com → Sign up / Log in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `horeca-ocs`
   - **Database Password**: save this somewhere safe
   - **Region**: Middle East (Bahrain) — closest to Dubai
4. Click **"Create new project"** — wait ~2 minutes

### 1.2 Run the Database Schema
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase-schema.sql` from this project folder
4. Copy the **entire** contents and paste into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see: `Success. No rows returned`

### 1.3 Get Your API Keys
1. In Supabase dashboard → **Settings** (gear icon) → **API**
2. Copy these two values — you'll need them in Step 3:
   - **Project URL** → looks like: `https://abcdefghijkl.supabase.co`
   - **anon / public key** → long string starting with `eyJ...`

---

## STEP 2 — Push to GitHub (5 min)

### 2.1 Create a GitHub Repository
1. Go to https://github.com → click **"New"** (green button)
2. Fill in:
   - **Repository name**: `horeca-ocs`
   - Visibility: **Private** (recommended for internal tool)
3. Click **"Create repository"**
4. GitHub will show you a page with setup commands — keep it open

### 2.2 Push the Code
Open a terminal in the project folder and run:

```bash
# Navigate to the project folder
cd horeca-ocs

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial: FFC HORECA Operations Center"

# Connect to your GitHub repo (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/horeca-ocs.git

# Push to GitHub
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub.

---

## STEP 3 — Deploy on Cloudflare Pages (5 min)

### 3.1 Connect Cloudflare to GitHub
1. Go to https://dash.cloudflare.com
2. Sign up / Log in (free account is fine)
3. In the left sidebar → click **"Pages"**
4. Click **"Create a project"** → **"Connect to Git"**
5. Click **"Connect GitHub"** → authorize Cloudflare to access your GitHub
6. Select your `horeca-ocs` repository
7. Click **"Begin setup"**

### 3.2 Configure Build Settings
Fill in these exact values:

| Setting | Value |
|---------|-------|
| **Project name** | `horeca-ocs` |
| **Production branch** | `main` |
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

### 3.3 Add Environment Variables
Still on the same page, scroll down to **"Environment variables"** and add:

| Variable Name | Value |
|---------------|-------|
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key-here` |

> ⚠️ Replace the values with the actual ones from Supabase Step 1.3

### 3.4 Deploy
1. Click **"Save and Deploy"**
2. Cloudflare will build the project — takes about 1-2 minutes
3. When done, you'll see a green checkmark ✅
4. Your URL will be: `https://horeca-ocs.pages.dev`

---

## STEP 4 — Verify Everything Works

1. Open your Cloudflare Pages URL in a browser
2. You should see the FFC HORECA login screen
3. Open it on your phone — you should get the mobile UI automatically
4. Try uploading an order and assigning it to a team
5. Open in two browser tabs — changes should appear in real time on both

---

## STEP 5 — Custom Domain (Optional, 10 min)

If you have a domain (e.g., `horeca.ffc-dubai.com`):

1. In Cloudflare Pages → your project → **"Custom domains"**
2. Click **"Set up a custom domain"**
3. Enter your domain
4. Follow the DNS instructions (add a CNAME record)

If your domain is already on Cloudflare, it's automatic.

---

## ONGOING — How to Update the App

Every time you make code changes:

```bash
# Save your changes
git add .
git commit -m "describe what you changed"
git push
```

Cloudflare automatically detects the push and redeploys within ~2 minutes. No manual steps.

---

## TROUBLESHOOTING

### Build fails on Cloudflare
- Check the build logs in Cloudflare Pages → your project → "Deployments"
- Most common issue: environment variables not set. Double-check Step 3.3

### App loads but shows no data
- Your Supabase URL or anon key is wrong
- Go to Cloudflare Pages → Settings → Environment Variables → verify both values
- Redeploy after fixing

### Realtime not working
- Check Supabase dashboard → Realtime → make sure it's enabled for your tables
- In Supabase SQL Editor run:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  ALTER PUBLICATION supabase_realtime ADD TABLE break_logs;
  ```

### Mobile UI not showing
- The app switches to mobile when screen width < 768px
- Try opening in Chrome DevTools → mobile device simulation

---

## ARCHITECTURE SUMMARY

```
┌─────────────────────────────────────────────┐
│              Cloudflare Pages               │
│         https://horeca-ocs.pages.dev        │
│                                             │
│  React + TypeScript + Vite                  │
│  ├── Desktop: Supervisor dashboard          │
│  └── Mobile:  Floor staff UI (auto-detect)  │
└─────────────────┬───────────────────────────┘
                  │ HTTPS API calls
                  │ WebSocket (realtime)
                  ▼
┌─────────────────────────────────────────────┐
│                  Supabase                   │
│                                             │
│  PostgreSQL Database                        │
│  ├── orders          (packing orders)       │
│  ├── teams           (Team A/B/C/D)         │
│  ├── staff           (employees)            │
│  ├── break_logs      (checkout/checkin)     │
│  └── packing_assignments                   │
│                                             │
│  Realtime subscriptions (live updates)      │
│  Row Level Security (RLS enabled)           │
└─────────────────────────────────────────────┘
```

---

## COSTS

| Service | Plan | Cost |
|---------|------|------|
| Cloudflare Pages | Free | $0/month |
| Supabase | Free tier | $0/month |
| **Total** | | **$0/month** |

Free tier limits are very generous for internal tools:
- Cloudflare: Unlimited requests, 500 builds/month
- Supabase: 500MB database, 2GB bandwidth, 50k MAU

Upgrade only if you scale beyond these limits.
