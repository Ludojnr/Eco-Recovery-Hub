# Eco-Recovery Hub — Backend Server

Express.js + MongoDB REST API for the Eco-Recovery Hub platform.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Zod
- **Language**: TypeScript (tsx for dev, tsc for prod)

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Then fill in your MONGO_URI and JWT_SECRET
```

### 3. Run the dev server
```bash
npm run dev
# Server starts on http://localhost:5000
```

Or run both frontend + backend from the **root** project folder:
```bash
cd ..
npm run dev
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Health check |
| POST | `/api/auth/signup` | None | Register |
| POST | `/api/auth/login` | None | Login |
| GET | `/api/auth/me` | User | Get own profile |
| PATCH | `/api/auth/me` | User | Update profile |
| POST | `/api/auth/kyc` | User | Submit KYC |
| PATCH | `/api/auth/password` | User | Change password |
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/leaderboard` | User | Points leaderboard |
| POST | `/api/users/:id/approve-kyc` | Admin | Approve KYC |
| POST | `/api/users/:id/reject-kyc` | Admin | Reject KYC |
| POST | `/api/users/:id/suspend` | Admin | Suspend account |
| POST | `/api/users/:id/reactivate` | Admin | Reactivate account |
| POST | `/api/users/:id/adjust-points` | Admin | Adjust points |
| DELETE | `/api/users/:id` | Admin | Delete user |
| POST | `/api/users/broadcast` | Admin | Send announcement |
| GET | `/api/scans` | User/Admin | List scans |
| POST | `/api/scans` | User | Submit scan |
| POST | `/api/scans/:id/approve` | Admin | Approve scan |
| POST | `/api/scans/:id/reject` | Admin | Reject scan |
| DELETE | `/api/scans/:id` | Admin | Delete scan |
| GET | `/api/pickups` | User/Admin | List pickups |
| POST | `/api/pickups` | User | Request pickup |
| PATCH | `/api/pickups/:id/status` | Admin | Update status |
| POST | `/api/pickups/:id/assign-driver` | Admin | Assign driver |
| GET | `/api/chats` | User/Admin | Get conversations |
| POST | `/api/chats/:userId/messages` | User/Admin | Send message |
| PATCH | `/api/chats/:userId/resolve` | Admin | Mark resolved |
| GET | `/api/notifications` | User | Get notifications |
| PATCH | `/api/notifications/clear` | User | Mark all read |
| GET | `/api/audit-logs` | Admin | Audit log list |
| GET | `/api/community/posts` | User | List posts |
| POST | `/api/community/posts` | User | Create post |
| POST | `/api/community/posts/:id/like` | User | Like post |
| POST | `/api/community/posts/:id/react` | User | React to post |
| POST | `/api/community/posts/:id/comment` | User | Add comment |
| POST | `/api/community/posts/:id/report` | User | Report post |
| GET | `/api/community/events` | User | List events |
| POST | `/api/community/events` | Admin | Create event |
| POST | `/api/community/events/:id/join` | User | Join event |
| POST | `/api/community/events/:id/leave` | User | Leave event |
| GET | `/api/community/challenges` | User | List challenges |
| POST | `/api/community/challenges` | Admin | Create challenge |
| GET | `/api/marketplace` | User | List listings |
| POST | `/api/marketplace` | User | Create listing |
| POST | `/api/marketplace/:id/buy` | User | Buy item |
| DELETE | `/api/marketplace/:id` | User/Admin | Delete listing |

---

## Deploying to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Set the following:
   - **Root Directory**: `Server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random secret string
   - `FRONTEND_URL` — your Vercel deployment URL (e.g., `https://eco-recovery-hub.vercel.app`)
   - `NODE_ENV` — `production`

   Note: Do not set `PORT` on Render; Render provides the correct port automatically.

6. After deploy, copy the Render URL and set it as `VITE_API_URL` in your Vercel project settings.
