# 🍽️ RESTRO-PROJECT: Tech Stack & Structure

This project follows a modern, serverless architecture for a **Restaurant Management System**.

### 1) Frontend: HTML, CSS, JS
- **Stack**: Pure Vanilla (no frameworks).
- **Styles**: Custom design system in `frontend/css/main.css` (Dark theme + Gold accents).
- **Assets**: All static HTML files in `frontend/pages/` and `index.html`.
- **API Client**: `frontend/js/api.js` handles all backend communication.

### 2) Backend: Node.js (Express)
- **Stack**: Node.js v18+.
- **Entry Point**: `backend/server.js`.
- **Framework**: Express.js for routing and middleware.
- **Security**: JWT-based authentication for roles (Admin, Manager, Cashier, Staff).

### 3) Database: Neon (PostgreSQL)
- **Provider**: **Neon.tech** (Serverless PostgreSQL).
- **Initialization**: `backend/db/index.js` automatically creates tables and seeds default data on first run.
- **Connection**: Managed via `pg` (node-postgres) with connection pooling.

### 4) Deployment: Serverless (Vercel)
- **Host**: **Vercel**.
- **Configuration**: `vercel.json` handles the monorepo mapping:
  - `/` → maps to statically served files in `frontend/`.
  - `/api` → maps to the Express server in `backend/server.js`.
- **Statelessness**: The backend is optimized for the ephemeral nature of serverless functions.
