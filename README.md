# PlanPoker

Real-time planning poker for agile teams. Create a session, share the link, and estimate stories together.

## Features

- **Session creation** with a unique shareable URL
- **Guest access** — participants join by entering a name, no sign-up required
- **Configurable card sets** — Fibonacci, Modified Fibonacci, T-Shirt sizes, Powers of 2, Sequential
- **Real-time voting** powered by Convex — votes update instantly across all participants
- **Reveal & reset flow** — host reveals votes, reviews results, sets a final estimate
- **Issue links** — attach a Jira/GitHub/etc. link to each story so voters can review context
- **Editable stories** — host can update story details without resetting votes
- **Live presence** — see who's online, who has voted, and the vote count

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 + Shadcn/ui
- Convex (real-time database)
- TanStack Router
- Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account

### Setup

```bash
npm install
```

Initialize and link your Convex project (interactive — will create `.env.local`):

```bash
npx convex dev
```

In a separate terminal, start the frontend:

```bash
npm run dev:frontend
```

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Sync Convex schema once, then start Vite |
| `npm run dev:convex` | Start Convex dev server (watches for schema/function changes) |
| `npm run dev:frontend` | Start Vite dev server only |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |

## Project Structure

```
├── convex/              # Backend
│   ├── schema.ts        # Database schema (sessions, stories, participants, votes)
│   ├── sessions.ts      # Session mutations & queries
│   ├── stories.ts       # Story CRUD
│   ├── participants.ts  # Join, heartbeat, leave
│   └── votes.ts         # Cast & retract votes
└── src/                 # Frontend
    ├── routes/
    │   ├── HomePage.tsx      # Create a new session
    │   ├── JoinPage.tsx      # Guest name entry
    │   └── SessionPage.tsx   # Main voting interface
    ├── components/
    │   ├── VotingCard.tsx         # Animated card button
    │   ├── ParticipantAvatar.tsx  # Participant row with vote status
    │   └── VoteResultsBar.tsx     # Results breakdown after reveal
    └── lib/
        ├── cardSets.ts    # Card set presets
        └── identity.ts    # Local identity (localStorage + nanoid)
```

## How It Works

1. **Host** creates a session, picks a card set, and optionally participates in voting.
2. **Participants** join via the invite link, entering only a name.
3. The host adds stories (with optional description and issue link) and selects one to estimate.
4. Everyone picks a card. Votes are hidden until the host clicks **Reveal**.
5. After reveal, the host sets a **final estimate** and moves to the next story.
