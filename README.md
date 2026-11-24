<div align="center">

# FleetCommand
### Enterprise Logistics, Fleet & Supply Chain Command Center

**A role-based logistics operations platform for shipment bookings, fleet execution, warehouse capacity, finance, and live vehicle visibility.**

![CI](https://github.com/matiur25580/Enterprise-AI-Powered-Logistics-Fleet-Supply-Chain-Command-Center/actions/workflows/ci.yml/badge.svg)
![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-555?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?logo=socketdotio&logoColor=white)

[**Open FleetCommand**](https://enterprise-ai-powered-logistics-fle-lac.vercel.app/) · [**Backend health**](https://enterprise-ai-powered-logistics-fleet.onrender.com/api/health) · [**CI workflow**](.github/workflows/ci.yml)

</div>

---

## Product overview

FleetCommand brings the main operational roles of a logistics business into one web application. Clients can submit shipment bookings and follow status; fleet teams coordinate vehicles, drivers, and trips; warehouse managers maintain capacity and stock; drivers update trip progress and share vehicle coordinates; and accountants manage invoice payment status.

The application has six role-based workspaces:

- **Admin** — operational overview, user directory, fleet, trips, bookings, warehouses, reports, and System Center.
- **Fleet Manager** — vehicle and trip coordination, driver assignment, and booking-to-trip workflow.
- **Warehouse Manager** — assigned warehouse records and capacity/stock updates.
- **Driver** — assigned trips, trip status changes, and live location updates.
- **Client** — shipment booking, booking status, and invoice access.
- **Accountant** — booking and billing views, plus demand forecast reporting.

**Live deployments**
- Frontend: [Vercel](https://enterprise-ai-powered-logistics-fle-lac.vercel.app/)
- Backend API: [Render](https://enterprise-ai-powered-logistics-fleet.onrender.com)
- Health endpoint: [GET /api/health](https://enterprise-ai-powered-logistics-fleet.onrender.com/api/health)

The repository contains a working application and CI checks. External email delivery and live location updates depend on correctly configured Mailjet and authenticated Socket.IO sessions. The demand forecast is a lightweight statistical projection, not a trained machine-learning model. No payment gateway, carrier integration, route-optimization engine, or automated warehouse hardware integration is documented as implemented.

## Core workflows and features

### Shipment booking and customer communication
- Clients submit shipment details including origin, destination, goods, and weight.
- Booking records carry a status, invoice number, amount, and payment status.
- Authorized operations roles can review and update bookings.
- Booking receipt, approval, rejection, and delivery notifications are sent by email when Mailjet is configured.
- Clients can download a PDF invoice and view their own bookings.

### Fleet and trip operations
- Create and manage vehicles, vehicle status, and driver assignments.
- Create trips manually or from a booking.
- Assign a vehicle and driver to a trip.
- Drivers see their assigned trips and can update trip status.
- Trip status transitions are validated by server-side policy.
- Driver location updates are sent over Socket.IO; Admin and Fleet Manager sessions receive the fleet-location stream.

### Warehouse operations
- Create warehouse records and assign a warehouse manager.
- Track total and used capacity.
- Update stock usage with validation that prevents negative stock or capacity overrun.
- Warehouse managers are scoped to their assigned warehouse records.

### Finance and reporting
- Maintain invoice amounts and payment states (Paid, Unpaid, Partial).
- View revenue and booking-related operational statistics in the dashboards.
- Export report data to CSV from the Admin Reports view.
- Generate a seven-day booking-demand projection from recent daily booking counts.

### System Center
- Record successful mutating API requests in an audit log and review recent entries.
- View in-app notifications.
- Track vehicle document expiry dates for insurance, fitness, permit, and pollution records.
- Record fuel usage and odometer values.
- Maintain next-service due dates and review vehicles with upcoming or missing service dates.

### Authentication and access
- Register Client accounts using email OTP verification.
- Staff roles are not self-registered through the public registration flow; staff access must be provisioned administratively.
- Accounts are role-scoped: the same email can be associated with different roles.
- Passwords are hashed with bcrypt; password policy requires at least eight characters with uppercase, lowercase, and numeric characters.
- API routes enforce bearer-token authentication and role authorization.
- Auth endpoints have an Express rate limiter.

## Demand forecast: what “AI” means here

The demand endpoint aggregates historical booking counts by day and applies **exponential smoothing plus a linear trend** to produce the next seven daily estimates. The forecast utility is a pure JavaScript function with unit tests.

- Endpoint: `GET /api/forecast/demand?days=14`
- `days` controls the lookback window and is bounded by the API between 1 and 90 days (defaults to 14).
- Access is limited to Admin, Fleet Manager, and Accountant roles.
- The response contains historical labels/counts, future date labels, and seven forecast values.

This is a transparent statistical baseline over booking volume; it does not use an external AI model, train on shipment attributes, or perform route or capacity optimization.

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Axios |
| UI / exports | Lucide React, jsPDF, jsPDF AutoTable |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose 9 |
| Authentication | JSON Web Tokens, bcryptjs, role-based middleware |
| Realtime | Socket.IO server and client |
| Email | Mailjet API via HTTPS |
| PDF | PDFKit (server invoices), jsPDF (client exports) |
| Tests | Jest |
| CI | GitHub Actions |
| Hosting | Vercel frontend, Render backend |

## Architecture

```text
Browser
  |
  +-- React + Vite client (Vercel)
  |     +-- Role-specific dashboards
  |     +-- Axios API requests with Bearer token
  |     +-- Socket.IO driver location updates
  |
  +-- HTTPS / JSON API
        |
        v
      Express server (Render)
        +-- Authentication and role authorization
        +-- Booking, fleet, trip, and warehouse routes
        +-- Forecast, audit, notifications, maintenance, documents
        +-- Mailjet API (OTP and booking/delivery email)
        +-- Socket.IO live location channel
        |
        v
      MongoDB Atlas
        +-- Users and role-scoped accounts
        +-- Vehicles, trips, warehouses, bookings
        +-- Audit logs, notifications, fuel logs, OTP records
```

The HTTP API and Socket.IO share one Node HTTP server. MongoDB is used for persistent application records. The client stores the signed-in user/session object in browser local storage; protect shared or public devices by signing out after use.

## Repository structure

```text
.
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   └── dashboards/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── utils/
│   ├── .env.example
│   └── package.json
└── .github/
    └── workflows/
        └── ci.yml
```

## Run locally

### Prerequisites

- Node.js 20 or later (CI currently uses Node.js 20).
- npm.
- A MongoDB database/connection string.
- Mailjet API credentials and a verified sender address for OTP and transactional email.

### 1. Clone the repository

```bash
git clone https://github.com/matiur25580/Enterprise-AI-Powered-Logistics-Fleet-Supply-Chain-Command-Center.git
cd Enterprise-AI-Powered-Logistics-Fleet-Supply-Chain-Command-Center
```

### 2. Install dependencies

```bash
cd server
npm ci

cd ../client
npm ci
```

### 3. Configure environment variables

Create local environment files from the examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Set `server/.env`:

```dotenv
MONGO_URI=mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET=your_mailjet_secret
EMAIL_USER=your_verified_sender_email
PORT=5000
```

Set `client/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

The backend's email utilities read `MAILJET_API_KEY`, `MAILJET_SECRET`, and `EMAIL_USER`. The checked-in server environment example has been aligned to these names. Keep real credentials in local environment files or your hosting provider's secret configuration; never commit them.

### 4. Start the backend

```bash
cd server
npm start
```

The API listens on port `5000` by default. The health route is [http://localhost:5000/api/health](http://localhost:5000/api/health).

### 5. Start the frontend

In a second terminal:

```bash
cd client
npm run dev
```

Vite prints the local development URL in the terminal (typically `http://localhost:5173`). Ensure `VITE_API_URL` points to the backend API origin with the `/api` suffix.

## Environment reference

| Variable | Service | Purpose |
|---|---|---|
| `MONGO_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Secret used to sign and verify JWTs; use a long, unique random value |
| `MAILJET_API_KEY` | Backend | Mailjet API key for outbound email |
| `MAILJET_SECRET` | Backend | Mailjet API secret |
| `EMAIL_USER` | Backend | Verified sender email address used in Mailjet messages |
| `PORT` | Backend | HTTP port; defaults to 5000 |
| `VITE_API_URL` | Frontend | API base URL, including `/api` |

Mailjet is used by both the OTP sender and booking notification mailer. If the Mailjet credentials or sender are missing, OTP delivery fails and the booking mailer skips sending. The app's non-email workflows can still be explored where the relevant routes and database are available.

## API overview

All routes below are mounted under `/api` and require a valid bearer token unless otherwise noted. Role checks are enforced by route middleware.

| Area | Methods and paths | Access / purpose |
|---|---|---|
| Health | `GET /health` | API process status |
| Auth | `POST /auth/send-otp`, `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password` | Client registration, login, OTP, and password recovery |
| Users | `GET /auth/by-role/:role` | Admin and Fleet Manager user lookup |
| Fleet | `POST /fleet/add`, `GET /fleet/all`, `PUT /fleet/status/:id`, `DELETE /fleet/:id` | Vehicle operations |
| Trips | `POST /trip/create`, `GET /trip/all`, `PUT /trip/status/:id`, `DELETE /trip/:id` | Trip planning and status |
| Bookings | `POST /booking/create`, `GET /booking/all`, `GET /booking/invoice/:id`, `PUT /booking/status/:id`, `PUT /booking/billing/:id` | Shipment and invoice workflows |
| Warehouses | `POST /warehouse/add`, `GET /warehouse/all`, `PUT /warehouse/stock/:id` | Warehouse capacity and stock |
| Forecast | `GET /forecast/demand?days=14` | Seven-day booking demand forecast |
| Audit | `GET /audit/`, `DELETE /audit/clear` | Admin audit log |
| Notifications | `GET /notifications/my`, `PUT /notifications/read-all`, `PUT /notifications/:id/read`, `POST /notifications/` | In-app notifications |
| Maintenance | `POST /maintenance/fuel`, `GET /maintenance/fuel/:vehicleId`, `PUT /maintenance/service/:vehicleId`, `GET /maintenance/due` | Fuel and service records |
| Documents | `GET /documents/expiring/list?days=30`, `PUT /documents/:id` | Vehicle document expiry records |

The Socket.IO server shares the backend origin. Drivers authenticate with a JWT in the socket handshake and can publish validated latitude/longitude updates for their assigned vehicle. Admin and Fleet Manager roles join the fleet-operations room to receive location events.

## Tests and continuous integration

Run backend tests:

```bash
cd server
npm test
```

The current Jest suite contains 11 unit tests:
- Five tests for forecast output length, empty input, rising trend, non-negative predictions, and custom forecast horizon.
- Six tests for the password policy, including valid input, length, uppercase, lowercase, numeric, and non-string cases.

The GitHub Actions workflow runs on pushes and pull requests targeting `main`. It installs dependencies and runs the backend Jest suite, then installs frontend dependencies and runs the Vite production build. The workflow does not deploy the application or run database-backed integration tests.

Build the frontend locally:

```bash
cd client
npm run build
```

The frontend also defines `npm run lint` using oxlint; the current CI workflow does not invoke that script.

## Deployment

The repository documents separate frontend and backend deployments:

- **Frontend:** Vercel — [deployed application](https://enterprise-ai-powered-logistics-fle-lac.vercel.app/)
- **Backend:** Render — [API service](https://enterprise-ai-powered-logistics-fleet.onrender.com)

For a deployment:
1. Configure the backend environment variables listed above in Render.
2. Set `PORT` according to the hosting platform.
3. Set `MONGO_URI` to the intended MongoDB database and `JWT_SECRET` to a strong unique secret.
4. Configure Mailjet API credentials and a verified sender for OTP and booking email.
5. Set the frontend `VITE_API_URL` to the deployed backend URL followed by `/api`.
6. Build the frontend with `npm run build` and deploy the client directory using the Vercel project configuration.

The live URLs are included as project links, but CI only verifies tests and a frontend build; it does not assert production integration health beyond the manually accessible health endpoint.

## Security and operational considerations

- Backend APIs use JWT bearer authentication and role-based authorization.
- Passwords are hashed with bcrypt; the shared password policy checks for length, uppercase, lowercase, and numeric characters.
- Auth endpoints use a rate limiter (60 requests per 15-minute window).
- Helmet security headers are enabled. Review the current CORS configuration before exposing the API to untrusted browser origins; the server currently enables broad CORS rather than an explicit origin allowlist.
- Socket.IO validates the JWT handshake and restricts the fleet-location subscriber room to Admin and Fleet Manager roles.
- Driver coordinates are range-checked and associated with the vehicle assigned to that driver.
- Do not use real customer, driver, or shipment data in public screenshots or demonstrations.
- Store JWT and Mailjet secrets only in environment configuration; rotate any credential that has ever been committed or exposed.

This is a portfolio project, not a certified logistics, accounting, or fleet-safety system. Validate authorization boundaries, operational processes, data retention, and deployment configuration before using it with real business data.

## Screenshots and product walkthrough

The repository currently describes its dashboards and workflows in code and documentation, but this README does not embed unverified screenshots. Add captures only from the running application using synthetic accounts and data, and remove all personal details, tokens, OTPs, and secrets before committing them.

## Author

**Matiur Rahaman** · Full-Stack Developer

- GitHub: [@matiur25580](https://github.com/matiur25580)
- Portfolio: [developer-portfolio-client.vercel.app](https://developer-portfolio-client.vercel.app)

