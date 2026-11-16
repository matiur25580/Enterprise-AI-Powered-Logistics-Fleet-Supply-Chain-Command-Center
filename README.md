![CI](https://github.[STRIPPED 102 bytes].yml/badge.svg)

# FleetCommand — Enterprise AI-Powered Logistics Fleet Supply Chain Command Center

A full-stack enterprise logistics platform connecting clients, fleet managers, warehouse managers, accountants and drivers in real time — with AI demand forecasting, audit trails and finance tooling.

**Live:** [Frontend (Vercel)](https://enterprise-ai-powered-logistics-fle-lac.vercel.app/) · [Backend (Render)](https://enterprise-ai-powered-logistics-fleet.onrender.com) · MongoDB Atlas

---

## ✨ Features

### 🔮 AI Demand Forecast
- 7-day booking demand prediction using **exponential smoothing + linear trend**
- `GET /api/forecast/demand` — past daily counts + next 7-day forecast as JSON
- Forecast core is a pure function (`server/utils/forecast.js`) covered by Jest unit tests
- Admin Reports tab shows a violet **"NEXT 7 DAYS"** chart with trend indicator (rising / falling / stable)

### 🏠 Landing Page
- Hero with live platform stats, feature grid, role showcase, how-it-works
- Dark / light theme toggle, live date-time header (DD.MM.YYYY · HH.MM.SS AM/PM)

### 🛡️ Admin — Command Center
- Stats + AI Insights (fleet utilization, idle vehicles, full warehouses, pending bookings)
- Vehicles: add, assign driver, status, delete, search
- Trips: create (from booking or manual), assign driver, status, delete, search
- Warehouses: add, capacity utilization bars, search
- Bookings: view, status management, one-click booking → trip conversion, search
- Reports: 14-day booking trend chart, **AI demand forecast**, trip/vehicle distributions, CSV export
- Live fleet tracking (WebSocket)
- User directory across all 6 roles

### 🚚 Fleet Manager
- Vehicle & trip management, driver assignment
- Bookings tab with one-click booking → trip conversion (auto-confirms booking)
- Drivers roster

### 🏭 Warehouse Manager
- Warehouse network with capacity utilization bars
- Stock in/out management with validation
- 90%+ capacity alerts

### 🧑‍✈️ Driver
- Assigned trips, one-tap status updates
- Live GPS location sharing to command center
- Delivery confirmation auto-updates booking → emails the client

### 🧑‍💼 Client
- Shipment booking form with email notifications
- Live status badges, invoice search, PDF invoice download

### 📊 Accountant — Finance Dashboard
- Revenue stats, invoice billing (Paid / Unpaid / Partial)
- Filters by status and date

### 🏢 System Center (Enterprise Module)
- **Audit log** — every create/update/delete auto-logged (who, what, when) + PDF export
- **Notification center** — in-app bell with 30-second refresh
- **Document expiry alerts** — insurance / fitness / permit / pollution
- **Fuel log** per vehicle
- **Maintenance scheduling**

### 🔐 Auth & Security
- Real email OTP (6-box UI) via Mailjet — **no hardcoded demo logins**, only registered emails can sign in
- Role-scoped accounts: same email can exist under multiple roles (compound `{email, role}` unique index)
- Password policy enforced + unit-tested: 8+ chars with UPPER, lower and number
- Rate limiting on auth routes, Helmet security headers
- JWT sessions, role-based protected routes

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, react-router-dom, axios, socket.io-client, jsPDF |
| Backend | Node.js, Express, Mongoose, socket.io, Helmet, express-rate-limit |
| Database | MongoDB Atlas |
| Email | Mailjet (booking + delivery notifications) |
| Testing | Jest (11 unit tests) |
| CI/CD | GitHub Actions (backend tests + frontend build on every push) |
| Hosting | Vercel (frontend) · Render (backend) |

---

## 📁 Project Structure

    client/                      # React + Vite frontend
      src/
        components/              # NotifBell, ForecastChart, Skeleton, EmptyState...
        context/                 # AuthContext, ThemeContext
        pages/
          dashboards/            # Admin, FleetManager, WarehouseManager,
                                 # Driver, Client, Accountant
          SystemCenter.jsx        # Audit log, notifications, documents, fuel, maintenance
        utils/                   # api (axios), pdf export
    server/
      models/                    # User, Vehicle, Trip, Warehouse, Booking,
                                 # AuditLog, FuelLog, Notification...
      routes/                    # auth, fleet, warehouse, booking, trip,
                                 # forecast, audit, notification, maintenance, documents
      utils/                     # auditNotify, forecast, passwordPolicy, sendEmail
      tests/                     # Jest unit tests (forecast, passwordPolicy)

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/forecast/demand?days=14` | Past daily bookings + 7-day AI forecast |
| POST | `/api/auth/register` | Register (role-scoped, OTP verified) |
| POST | `/api/auth/login` | Login (rate-limited, strong-password checked) |
| POST | `/api/auth/send-otp` · `/api/auth/verify-otp` | Email OTP flow |
| GET/POST/PUT/DELETE | `/api/fleet` | Vehicles CRUD |
| GET/POST/PUT/DELETE | `/api/booking` | Bookings CRUD + status updates |
| GET/POST/PUT/DELETE | `/api/trip` | Trips CRUD |
| GET/POST/PUT | `/api/warehouse` | Warehouses + stock in/out |
| GET | `/api/audit` | Audit log (Admin) |
| GET/POST | `/api/notifications` | In-app notifications |
| GET/POST/PUT/DELETE | `/api/maintenance` | Maintenance schedules |
| GET | `/api/documents/expiring` | Document expiry alerts |

---

## 🧪 Testing

    cd server
    npm test        # 11 Jest tests — forecast math + password policy

Every push also runs the full CI pipeline (.github/workflows/ci.yml): backend Jest suite + frontend production build.

## 🚀 Run Locally

### Backend

    cd server
    npm install
    cp .env.example .env   # fill MONGO_URI, JWT_SECRET, Mailjet keys, CLIENT_URL
    npm start              # or: node server.js

### Frontend

    cd client
    npm install
    # set VITE_API_URL in .env (defaults to http://localhost:5000/api)
    npm run dev

**Environment variables (backend):** MONGO_URI, JWT_SECRET, PORT, CLIENT_URL, Mailjet API keys, sender email — see .env.example. Never commit real secrets.

## 🌐 Deployment
- **Frontend → Vercel:** auto-deploys on push to main (`npm run build`)
- **Backend → Render:** auto-deploys on push to main (`node server.js`)
- Set VITE_API_URL (frontend) to the Render backend URL, and CLIENT_URL (backend) to the Vercel URL.

## 👤 Author

**Matiur Rahaman** — Full-Stack Developer
GitHub: [@matiur25580](https://github.com/matiur25580)
