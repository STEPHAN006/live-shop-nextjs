# LiveShop

LiveShop is a full‑stack live commerce platform where **live video** meets **e‑commerce**.

- Buyers can browse a TikTok‑style feed, watch videos, comment in real time, like content, follow vendors and purchase products.
- Vendors can manage products/videos and run live streams.

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Supabase**: Auth, Postgres, Storage (RLS)
- **Socket.io**: realtime comments + live overlays
- **WebRTC**: live stream broadcasting
- **Tailwind CSS** + **motion** + **lucide-react**

## Requirements

- Node.js 18+
- A Supabase project

## Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Notes:

- Supabase **email confirmation** is enabled: after sign up, the UI shows a “Check your email” state.

## Install

```bash
npm install
```

## Run (dev)

This project uses a custom Node server (`server.ts`) to run Next + Socket.io.

```bash
npm run dev
```

Then open:

- <http://localhost:3000>

## Build / start

```bash
npm run build
npm run start
```

## Core features

- **Buyer Feed**: “Pour toi / Suivi” tabs with vertical 9:16 cards
- **Buyer Videos catalog**: search + pagination + vertical grid
- **Video detail**:
  - realtime comments (Socket.io)
  - **persisted comments** in `video_comments`
  - like/unlike via `like_video` RPC
  - follow/unfollow vendors via `vendor_follows`
  - purchases recorded in `purchases`
- **Auth**:
  - signup confirmation UI
  - reset password flow (`/reset-password` + `/update-password`)

## Supabase tables (high level)

This app expects (at minimum) tables similar to:

- `profiles`
- `videos`
- `products`
- `video_products`
- `video_likes`
- `vendor_follows`
- `purchases`
- `video_comments`

RLS is enabled where needed (likes, follows, purchases, comments).

## Scripts

- `npm run dev`: start Next.js + Socket.io server
- `npm run build`: build Next.js
- `npm run start`: production server
- `npm run lint`: lint

## License

Internal project / demo.
