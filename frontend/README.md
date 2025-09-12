# Smart Parking System – Frontend

Next.js frontend for the Smart Parking System. It consumes Strapi GraphQL/REST APIs for content and booking flows.

## Prerequisites
- Node.js 18–22
- npm (or pnpm/yarn)

## Setup
1) Install deps
```bash
npm install
```

2) Env vars
- Copy example and fill values:
```bash
copy .env.local.example .env.local
```
- Required keys in `.env.local`:
```ini
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_KEY=YOUR_STRAPI_API_TOKEN
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_MAPS_KEY
```

3) Run dev server
```bash
npm run dev
# http://localhost:3000
```

## Notes
- Apollo GraphQL uses the API token for CMS reads.
- Static assets live under `public/` (e.g., default avatars).
