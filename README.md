# Eco-Recovery Hub 🌿

A full-stack waste recovery platform — TanStack Start frontend on **Vercel**, Express + MongoDB backend on **Render**.

---

## 📁 Monorepo Structure

```
Eco-Recovery-Hub/
├── Client/          ← Frontend (TanStack Start + Vite)  → Deploy to Vercel
├── Server/          ← Backend  (Express + MongoDB)       → Deploy to Render
├── render.yaml      ← Render auto-deploy config
└── package.json     ← Monorepo orchestration (local dev)
```

---

## 🚀 Local Development

From the **root** folder:

```bash
npm install           # install root concurrently
cd Client && npm install   # install frontend deps
cd ../Server && npm install  # install backend deps
cd ..
npm run dev           # starts both client + server concurrently
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## ☁️ Deployment

### Vercel (Frontend — `Client/`)

1. Create a new Vercel project → **Import this Git repository**
2. Set **Root Directory** to `Client`
3. Build settings (auto-detected or set manually):
   - **Build Command**: `npm run build`
   - **Output Directory**: `.output/public`
   - **Install Command**: `npm install`
4. Add **Environment Variables** in Vercel dashboard:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://eco-recovery-hub.onrender.com` |

---

### Render (Backend — `Server/`)

The `render.yaml` in the root auto-configures your Render service.

1. Create a new Render Web Service → **Import this Git repository**
2. Render will detect `render.yaml` and configure the service automatically
3. Add **Environment Variables** in Render dashboard (marked `sync: false` in yaml):
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | `mongodb+srv://ecorecoveryhub_db_user:<password>@erh.nmvsqig.mongodb.net/eco-recovery-hub?retryWrites=true&w=majority` |
   | `JWT_SECRET` | *(generate a long random string)* |
   | `FRONTEND_URL` | `https://your-vercel-app.vercel.app` |

---

## 🔑 Environment Variables Summary

### Client (`Client/.env`)
```
VITE_API_URL=http://localhost:5000
```

### Server (`Server/.env`)
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## 👤 Default Accounts (seeded on server start)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@ecorecovery.org` | `password123` |
| Institution (KTU) | `ktu@ecorecovery.org` | `password123` |
| Institution (GreenCorp) | `greencorp@ecorecovery.org` | `password123` |

If admin login fails after a DB reset, redeploy/restart the Render service so `seedDatabase()` re-creates the admin user.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | TanStack Start, React, Vite, TailwindCSS |
| Backend | Express.js, TypeScript, MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Database | MongoDB Atlas |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
