# 🍽️ Restaurant Management System

A full-stack Restaurant Management System built with **Node.js + Express + PostgreSQL** backend and **HTML/CSS/Vanilla JS** frontend. Ready for **Vercel** deployment with **Neon.tech** or **Supabase**.

---

## 📁 Project Structure

```
restaurant-ms/
├── backend/
│   ├── db/
│   │   └── index.js          # DB connection + schema auto-init
│   ├── middleware/
│   │   └── auth.js           # JWT authentication & role authorization
│   ├── routes/
│   │   ├── auth.js           # Login, register
│   │   ├── menu.js           # Menu CRUD + categories
│   │   ├── orders.js         # Order management
│   │   ├── bills.js          # Billing & payments
│   │   ├── inventory.js      # Stock management
│   │   ├── tables.js         # Table/floor management
│   │   └── users.js          # Staff management
│   ├── server.js             # Express app entry point
│   ├── package.json
│   └── .env.example          # → copy to .env and fill values
├── frontend/
│   ├── css/
│   │   └── main.css          # Full design system
│   ├── js/
│   │   ├── api.js            # API client + Auth helpers + Toast
│   │   └── layout.js         # Shared sidebar/topbar renderer
│   ├── pages/
│   │   ├── dashboard.html    # Overview + live stats
│   │   ├── orders.html       # Order management
│   │   ├── tables.html       # Floor plan & table status
│   │   ├── menu.html         # Menu item management
│   │   ├── billing.html      # Bills, payments, revenue stats
│   │   ├── inventory.html    # Stock tracking + low-stock alerts
│   │   └── staff.html        # Staff/user management
│   └── index.html            # Login page
├── vercel.json               # Vercel deployment config
├── package.json
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Configure Database

**Option A — Neon.tech (Recommended)**
1. Go to [neon.tech](https://neon.tech) → Create free account → New Project
2. Copy the connection string (it looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
3. Paste it as `DATABASE_URL` in `backend/.env`

**Option B — Supabase**
1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to Settings → Database → Connection string (URI)
3. Paste as `DATABASE_URL` in `backend/.env`

**Option C — Local PostgreSQL**
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/restaurant_db
```

### 3. Set JWT Secret

```env
JWT_SECRET=your_random_secret_here_make_it_long
```

### 4. Run Backend

```bash
cd backend
npm run dev   # uses nodemon (auto-reload)
# or
npm start     # production
```

Backend runs on **http://localhost:5000**

The database schema is **auto-created** on first run (tables, seed data, default admin).

### 5. Run Frontend

Open `frontend/index.html` in a browser, or serve with:

```bash
npx serve frontend
# or
python3 -m http.server 3000 -d frontend
```

---

## 🌐 Deploy to Vercel

### Backend Deployment

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repo
3. Set **Root Directory** to `backend`
4. Add Environment Variables:
   - `DATABASE_URL` = your Neon/Supabase connection string
   - `JWT_SECRET` = your secret key
   - `NODE_ENV` = `production`
5. Deploy!

### Frontend Deployment

Option 1 — **Vercel Static** (separate project):
- Import the repo again, set root to `frontend`
- Update `API_BASE` in `frontend/js/api.js` to your backend Vercel URL

Option 2 — **Same Vercel project** (monorepo):
- The `vercel.json` routes `/api/*` → backend, serves frontend as static

> **Important**: After deploying the backend, update `API_BASE` in `frontend/js/api.js`:
> ```js
> const API_BASE = 'https://your-backend.vercel.app/api';
> ```

---

## 🔐 Default Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@restaurant.com | admin123 | admin |

> Change the default password immediately after first login via Staff page.

---

## 👥 Role Permissions

| Feature | Admin | Manager | Cashier | Staff |
|---------|-------|---------|---------|-------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Orders | ✅ | ✅ | ✅ | ✅ |
| Create Orders | ✅ | ✅ | ✅ | ✅ |
| Update Order Status | ✅ | ✅ | ✅ | ✅ |
| Generate Bills | ✅ | ✅ | ✅ | ✅ |
| Mark Bills Paid | ✅ | ✅ | ✅ | ✅ |
| Menu Management | ✅ | ✅ | ❌ | ❌ |
| Inventory Management | ✅ | ✅ | ❌ | ❌ |
| Revenue Stats | ✅ | ✅ | ❌ | ❌ |
| Staff Management | ✅ | ❌ | ❌ | ❌ |

---

## 📋 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register user |

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | All menu items |
| GET | `/api/menu/categories` | All categories |
| POST | `/api/menu` | Add item (manager+) |
| PUT | `/api/menu/:id` | Edit item |
| DELETE | `/api/menu/:id` | Delete item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | All orders (filter by status, date) |
| GET | `/api/orders/:id` | Single order with items |
| POST | `/api/orders` | Place new order |
| PATCH | `/api/orders/:id/status` | Update status |

### Bills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bills` | All bills |
| POST | `/api/bills/generate/:orderId` | Generate bill |
| PATCH | `/api/bills/:id/pay` | Mark as paid |
| GET | `/api/bills/stats/daily` | 30-day revenue stats |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | All items |
| GET | `/api/inventory/low-stock` | Below threshold items |
| POST | `/api/inventory` | Add item |
| PUT | `/api/inventory/:id` | Update item |
| PATCH | `/api/inventory/:id/restock` | Add stock |
| DELETE | `/api/inventory/:id` | Delete item |

### Tables
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tables` | All tables |
| POST | `/api/tables` | Add table |
| PATCH | `/api/tables/:id/status` | Update status |

---

## ✨ Features

- 🔐 JWT authentication with role-based access
- 📋 Full order lifecycle (pending → preparing → ready → served)
- 🧾 Auto bill generation with tax & discount support
- 📦 Inventory tracking with low-stock alerts
- 🪑 Visual floor plan with real-time table status
- 💰 Revenue statistics and daily reports
- 👥 Staff management with role permissions
- 🌙 Dark theme UI with elegant gold accents
- 📱 Responsive design (mobile-friendly)
- ☁️ Vercel + Neon/Supabase ready
