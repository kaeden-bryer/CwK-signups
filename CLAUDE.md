# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm test:db      # Run Supabase DB tests
```

## Architecture

This is a **Next.js 16 App Router** volunteer signup system for CwK, using **Supabase** for auth/database, **Loops** for transactional email, and **Twilio** for SMS reminders.

### Key Data Model (Supabase tables)
- `events` — volunteer events with `facility`, `event_date`, `start_time`, `end_time`, `capacity`, `loops_template_id`
- `signups` — volunteer signups with `status` (`confirmed`/`cancelled`), `cancel_token`, `reminder_sent`, and optional `user_id` (linked account or anonymous)
- `profiles` — user profiles with `is_admin`, `username`, `email`, `phone`, `avatar_url`, `banner_url`
- `admin_invites` — pre-approved emails for admin access (`email`, `invited_by`, `accepted`)

### Auth & Access Control
- Middleware (`middleware.ts`) protects `/admin`, `/my-signups`, and `/profile` routes — redirects unauthenticated users to `/login`
- Admin check happens in `app/admin/layout.tsx` by querying `profiles.is_admin`
- New users whose email is in `admin_invites` are auto-promoted to admin on first admin route access
- `lib/supabase/server.ts` exports two clients:
  - `createClient()` — anon key, respects RLS, for auth-gated operations
  - `createServiceClient()` — service role key, bypasses RLS, for signups and admin ops

### Route Structure
- `/events` — public event listing
- `/events/[id]` — public signup form (works for both logged-in and anonymous users)
- `/events/cancel` — token-based cancellation (no auth required)
- `/my-signups` — authenticated user's signups with cancellation
- `/signup` — account creation (requires admin invite or open registration logic)
- `/admin/events` — CRUD for events
- `/admin/volunteers` — view all signups
- `/admin/invites` — invite new admins
- `/api/cron/send-reminders` — cron endpoint (authorized via `CRON_SECRET` bearer token) that sends Twilio SMS to confirmed volunteers for same-day events

### Server Actions Pattern
All mutations use Next.js Server Actions (`"use server"` files in route directories). They validate with Zod schemas from `lib/validations.ts`, then call Supabase. Actions return `{ error: string }` or `{ success: true }` (never throw to the client).

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
LOOPS_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
CRON_SECRET
CWK_READ_WRITE_TOKEN   # Vercel Blob store token (profile avatar/banner uploads)
```

### UI
Uses **shadcn/ui** components (in `components/ui/`) with Tailwind CSS v4. New shadcn components: `pnpm dlx shadcn add <component>`.
