# Activity Feed — Frontend

React + Vite SPA for the activity feed UI.

## Stack

- React 19 + Vite
- React Router v7
- Redux Toolkit
- Axios

## Pages

| Route | Description |
|-------|-------------|
| / | Live activity feed with infinite scroll |
| /post | Post a new activity |
| /answers | Assignment answers |

## Features

- Cursor-based infinite scroll via IntersectionObserver
- Real-time polling every 15s — prepends new items without resetting the feed
- Filter by activity type
- Fully responsive

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

## Environment Variables

```
VITE_API_URL=http://localhost:4000/api/v1
```

For production, set `VITE_API_URL` to your deployed backend URL in Render's environment variables.

## Build

```bash
npm run build   # outputs to dist/
```
