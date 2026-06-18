# Project State

## Current Phase

Phase 0 — Project foundation.

Last updated: June 18, 2026.

## Completed Features

- Next.js 16 App Router project with strict TypeScript
- Tailwind CSS 4 theme and responsive base styles
- shadcn/ui-compatible configuration and starter UI primitives
- Supabase browser, server, and session proxy structure
- TanStack Query application provider
- Responsive application shell with sidebar, header, and mobile navigation
- Placeholder pages for authentication and core product areas
- Shared page header, statistic card, empty, loading, error, and confirmation components
- Environment variable example

## Current Database Tables

None. Database migrations begin in the authentication and authorization phase.

## Current Routes and Pages

- `/` redirects to `/dashboard`
- `/login`
- `/dashboard`
- `/medicines`
- `/sales`
- `/suppliers`
- `/purchases`
- `/reports`
- `/settings`

## Current Components

- Application sidebar, header, and mobile navigation
- Query provider
- Button, card, skeleton, and confirm dialog primitives
- Page header
- Statistic card
- Empty state
- Loading state
- Error state
- Placeholder page

## Current Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — reserved for server-only administrative operations

See `.env.example`. Never expose the service-role key in browser code.

## Current Supabase Setup State

- Client code structure is ready.
- Session refresh proxy is ready.
- No Supabase project, database schema, Auth configuration, migrations, or RLS policies have been connected yet.
- Authentication and route protection are placeholders only.

## Latest Test and Build Status

- `npm run lint` — passed on June 18, 2026
- `npm run typecheck` — passed on June 18, 2026
- `npm run build` — passed on June 18, 2026
- All current routes were generated successfully by Next.js.

## Current Known Issues

- Login form is not connected to Supabase Auth.
- Protected routes do not yet require a session.
- Navigation is not yet filtered by role.
- Dashboard values and all feature pages use placeholder data.
- `npm install` reports two moderate dependency audit findings; review without applying forced breaking upgrades.

## Important Decisions

- Keep the installed Next.js 16 version because it satisfies the Next.js 14+ requirement.
- Use Next.js `proxy.ts` for Supabase session refresh.
- Use server and browser Supabase clients in separate modules.
- Keep the initial shell simple and light with an emerald primary color.
- Do not create database tables until the authentication/schema phase.

## Next Recommended Prompt

Implement Phase 1: Supabase project schema for profiles and roles, email/password authentication, login/logout/password reset, protected routes, role-aware navigation, and initial RLS policies.
