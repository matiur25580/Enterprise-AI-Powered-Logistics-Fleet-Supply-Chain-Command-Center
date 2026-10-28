# FleetCommand — Enterprise AI-Powered Logistics Fleet Supply Chain Command Center

A full-stack enterprise logistics platform connecting clients, fleet managers, warehouse managers and drivers in real time.

**Live:** Frontend (Vercel) · Backend (Render) · MongoDB Atlas

## Features

### Landing Page
- Hero with live platform stats, feature grid, role showcase, how-it-works
- Dark / light theme

### Admin — Command Center
- Stats, AI Insights (fleet utilization, idle vehicles, full warehouses, pending bookings)
- Vehicles: add, assign driver, status, delete, search
- Trips: create (from booking or manual), assign driver, status, delete, search
- Warehouses: add, capacity bars, search
- Bookings: view, status management, booking → trip conversion, search
- Reports: 14-day booking trend chart, trip/vehicle distributions
- Live fleet tracking (WebSocket)

### Fleet Manager
- Vehicle & trip management, driver assignment
- Bookings tab with one-click booking → trip conversion (auto-confirms booking)

### Warehouse Manager
- Warehouse network, capacity utilization bars
- Stock in/out management with validation

### Driver
- Assigned trips, one-tap status updates
- Live GPS location sharing to command center
- Delivery confirmation auto-updates booking + emails client

### Client
- Shipment booking with email notifications
- Live status badges, PDF invoice download

### Auth & Security
- Email OTP (Mailjet), role-scoped accounts (same email, multiple roles)
- Protected routes per role, unique ID per registration (e.g. `AMR29081998`)

## Tech Stack
- **Frontend:** React, React Router, axios, Socket.io-client (Vercel)
- **Backend:** Node.js, Express, Socket.io, PDFKit, Mongoose (Render)
- **Database:** MongoDB Atlas
- **Email:** Mailjet HTTPS API

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/send-otp | Send OTP (role-scoped) |
| POST | /api/auth/register | Register with unique ID |
| POST | /api/auth/login | Role-scoped login |
| POST | /api/fleet/add | Add vehicle |
| GET | /api/fleet/all | List vehicles |
| PUT | /api/fleet/status/:id | Update vehicle status |
| DELETE | /api/fleet/:id | Delete vehicle |
| POST | /api/trip/create | Create trip |
| GET | /api/trip/all | List trips |
| PUT | /api/trip/status/:id | Update trip status |
| DELETE | /api/trip/:id | Delete trip |
| POST | /api/warehouse/add | Add warehouse |
| GET | /api/warehouse/all | List warehouses |
| PUT | /api/warehouse/stock/:id | Update stock |
| POST | /api/booking/create | Create booking (+email) |
| GET | /api/booking/all | List bookings |
| PUT | /api/booking/status/:id | Update status (+delivery email) |
| GET | /api/booking/invoice/:id | PDF invoice |
| GET | /api/auth/by-role/:role | Users by role |

## Environment Variables (backend)
