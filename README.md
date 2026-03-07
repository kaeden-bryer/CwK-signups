# 🎹Caring with Keys — Volunteer Signups

> Because herding volunteer musicians shouldn't be harder than playing Rachmaninoff.

**CwK Signups** is a lightweight volunteer coordination app built for [Caring with Keys](https://caringwithkeys.org). Volunteers browse upcoming performance events, claim a spot in seconds, and get email confirmations + day-of SMS reminders so nobody accidentally sleeps through their shift.

## ⚙️How It Works

1. **Browse** — The public events page lists every upcoming performance with the facility, date, time, and remaining spots.
2. **Sign Up** — Tap an event, fill in your name / email / phone, done. No account required (but you *can* create one for extra perks).
3. **Get Reminded** — On the morning of the event a Twilio text nudges you awake and out the door.
4. **Cancel Gracefully** — Plans change. Every confirmation email includes a magic cancellation link — no login needed.

Logged-in volunteers also get a **My Signups** dashboard to keep track of everything in one place.

## 💫For Admins

Admins (invited via email allowlist) get a dashboard to:

- Create, edit, and delete events
- View all volunteer signups at a glance
- Invite new admins

## 🥞Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Auth & DB | Supabase (with Row-Level Security) |
| Email | Loops (transactional templates) |
| SMS | Twilio |
| File Storage | Vercel Blob |
| UI | shadcn/ui + Tailwind CSS v4 |
| Validation | Zod |

## 🛫Getting Started

```bash
pnpm install
pnpm dev        # start the dev server at localhost:3000
```

You'll need a `.env.local` with the keys listed in `CLAUDE.md` (Supabase, Loops, Twilio, etc.).

## 📜Scripts

```bash
pnpm dev        # development server
pnpm build      # production build
pnpm lint       # ESLint
pnpm test:db    # Supabase database tests
```

## License

Private — built with care for CwK volunteers everywhere.
