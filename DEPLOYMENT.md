# 🚀 Deploying RESTRO-PROJECT to Vercel

Follow these steps to deploy your **Restaurant Management System** with a **Neon DB** backend and a **Serverless** architecture.

### 1️⃣ Prepare Environment Variables
Before deploying, ensure you have your **Neon.tech** database URL. You'll need these in Step 3:
- `DATABASE_URL`: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`
- `JWT_SECRET`: A long random string (e.g., `my_secret_key_123`)
- `NODE_ENV`: `production`

---

### 2️⃣ Push to GitHub
1.  Initialize git (if not already): `git init`
2.  Commit your changes: `git add . && git commit -m "Vercel ready deployment"`
3.  Push to a new GitHub repository.

---

### 3️⃣ Setup in Vercel Dashboard
1.  Go to [Vercel](https://vercel.com) → **Add New** → **Project**.
2.  **Import** your repository.
3.  **Project Settings**:
    - **Framework Preset**: Other (Our `vercel.json` handles everything).
    - **Root Directory**: `.` (The project root).
4.  **Environment Variables**:
    - Add `DATABASE_URL`, `JWT_SECRET`, and `NODE_ENV` as defined in Step 1.
5.  Click **Deploy**!

---

### ⚠️ Important Notes
- **Database Access**: Ensure your Neon DB allows traffic from "0.0.0.0/0" (Public Access) or has Vercel's IP range allowed.
- **API Base URL**: The frontend is configured to use `/api` which points to your backend AUTOMATICALLY because of our `vercel.json` rewrites. You don't need to change any hardcoded URLs.
- **Cold Starts**: Since it's serverless, the first request after some inactivity might take 2-3 seconds as the backend "wakes up."

---

### 🛠️ Troubleshooting
- **404 on API**: Double-check `vercel.json`. It maps `/api/*` to `backend/server.js`.
- **Database Error**: Ensure the connection string includes `?sslmode=require`.
