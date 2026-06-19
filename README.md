# ZAB — Relax. Connect. Grow. Together.

A wellness web app: AI-guided mood check-ins, meditation/sleep sessions, human wellness tutors, community clubs, and member-funded projects.

## Status

This runs fully in **demo mode** out of the box — no Firebase or Gemini keys required. Auth uses local storage, content is local sample data, and the AI companion uses canned responses. Connect real keys (below) to switch to a live backend without changing any UI code.

## Stack

- React + Vite
- Firebase Auth + Firestore (backend)
- Gemini API (AI Wellness Companion)
- Plain CSS with design tokens in `src/index.css` (no Tailwind, kept deliberately custom)

## Run it locally

```bash
npm install
npm run dev
```

## Connect Firebase

1. Create a project at console.firebase.google.com.
2. Enable Authentication → Email/Password and Google sign-in methods.
3. Create a Firestore database (start in production mode).
4. Project settings → General → Your apps → add a Web app → copy the config values.
5. Copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values.
6. Deploy the included rules: `firebase deploy --only firestore:rules` (after `firebase init` to link the project).

Once `.env` has valid Firebase keys, sign-up/login automatically switches from local demo accounts to real Firebase Auth + Firestore profiles — see `src/lib/AuthContext.jsx`.

## Connect Gemini (ZAB AI Companion)

Quick path (client-side key, fine for prototyping):
1. Get a key from Google AI Studio (aistudio.google.com/app/apikey).
2. Add it as `VITE_GEMINI_API_KEY` in `.env`.

Production path (key stays server-side):
1. `firebase init functions`
2. Copy `functions/zabAiChat.js` into your functions project as `index.js` (or import it).
3. `firebase functions:secrets:set GEMINI_API_KEY`
4. `firebase deploy --only functions`
5. Update `src/lib/gemini.js` to call the deployed `zabAiChat` callable function instead of fetching Gemini directly.

## Project structure

```
src/
  lib/
    firebase.js        Firebase init + exported SDK functions
    AuthContext.jsx     Auth state, demo-mode fallback
    gemini.js           AI companion logic, demo-mode fallback
  components/           NavBar, AuthModal, AICompanion, ZabLogo, HorizonDivider, Footer
  pages/                Home, Sessions, Clubs, Tutors, Projects, Pricing, Dashboard
  data/demoData.js       Sample moods, sessions, clubs, tutors, projects, plans
functions/
  zabAiChat.js           Cloud Function stub to proxy Gemini securely (not yet deployed)
firestore.rules          Suggested security rules for the collections this app expects
```

## Firestore data model (suggested, for when you wire up real content)

- `users/{uid}` — name, email, plan (free | sleep | pro)
- `clubs/{id}` — name, emoji, description, members count
  - `clubs/{id}/members/{uid}`
- `tutors/{id}` — name, specialty, bio, rating
- `bookings/{id}` — userId, tutorId, slot, status
- `sessions/{id}` — title, type, duration, tier
- `projects/{id}` — title, goal, raised, backers, timeline
  - `projects/{id}/contributions/{id}` — userId, amount

## Next steps

- Wire Sessions/Clubs/Tutors/Projects pages to Firestore reads instead of `src/data/demoData.js` once seeded.
- Move Gemini calls behind the Cloud Function for production (see above) — current client-side key is fine for testing only.
- Add real audio playback for sessions (currently a UI-only "Playing…" state).
- Later: Flutter app sharing the same Firebase backend, as planned.
