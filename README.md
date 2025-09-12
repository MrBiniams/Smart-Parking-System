### Smart Parking System

Full-stack parking platform using Strapi (backend) and Next.js (frontend). Features locations/slots, bookings, payments (TeleBirr), real-time updates, and CMS content (hero, blogs, testimonials, footer, about).

### Features
- Locations and parking slots
- Booking creation, extension, attendant workflow
- Payments (TeleBirr; simulator in dev)
- Real-time Socket.io updates
- CMS via Strapi GraphQL
- Auth: OTP simulation, login/register, verify token

### Tech Stack
- Backend: Strapi v5 (TypeScript), SQLite (dev), GraphQL + REST
- Frontend: Next.js (App Router), Apollo, Axios, Zustand, Tailwind
- Realtime: Socket.io

### Prerequisites
- Node.js 18–22, npm

### Quick Start
1) Clone
```bash
git clone https://github.com/MrBiniams/Smart-Parking-System.git
cd Smart-Parking-System
```

2) Windows only (first time)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3) Install dependencies
```powershell
cd backend && npm install
cd ../frontend && npm install
cd ..
```

4) Environment variables
- Frontend: copy example and fill real values
```powershell
copy frontend/.env.local.example frontend/.env.local
```
- Required keys (in frontend/.env.local):
```ini
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_KEY=YOUR_STRAPI_API_TOKEN
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_MAPS_KEY
```
- Backend (optional .env if needed):
```ini
HOST=0.0.0.0
PORT=1337
APP_KEYS=REPLACE_ME_1,REPLACE_ME_2
ADMIN_JWT_SECRET=REPLACE_ME
API_TOKEN_SALT=REPLACE_ME
TRANSFER_TOKEN_SALT=REPLACE_ME
FRONTEND_URL=http://localhost:3000
TELEBIRR_API_KEY=REPLACE_ME
TELEBIRR_MERCHANT_ID=REPLACE_ME
TELEBIRR_API_URL=https://api.telebirr.com/api/v1
```

5) Start backend (Strapi)
```powershell
cd backend
npm run develop
# Admin: http://localhost:1337/admin
```
- First run: create admin user
- Generate API Token (Settings → API Tokens). Use Read‑only or Full access in dev.
- Ensure GraphQL read permission if using Read‑only.

6) Start frontend (Next.js)
```powershell
cd ../frontend
npm run dev
# App: http://localhost:3000
```

### Common Issues
- 401 on /graphql: missing/invalid NEXT_PUBLIC_STRAPI_API_KEY or GraphQL permissions.
- Missing images: upload via Strapi Content Manager; for testimonials you can make avatar optional or rely on frontend default (public/avatar-default.jpg).
- Google Maps errors: set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.

### Data & Media
- Frontend static assets: commit under frontend/public/.
- Strapi uploads: backend/public/uploads/ is typically ignored; prefer seeding or manual upload in dev.

### Scripts
- Backend: npm run develop, npm run build, npm start
- Frontend: npm run dev, npm run build, npm start

### Security
- Do NOT commit real .env files. Share .env.local.example and fill locally.
- Prefer read‑only API tokens for frontend GraphQL.

### Contributing
- Use feature branches and PRs. Ensure both apps run locally before submitting.
