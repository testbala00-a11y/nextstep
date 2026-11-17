# NextStep — independent GitHub + Supabase deployment

NextStep is a React/TypeScript TanStack Start application for students to discover colleges and courses, and for verified administrators to manage institutions, accreditation details, Top 10 selections, PIN codes, course offerings, and fees. **No Lovable account or runtime is required.**

## Quick start in GitHub Codespaces

1. Upload the **contents** of this folder into a **new GitHub repository** (the ZIP is not a deployable asset by itself). Start Codespaces on `main`.
2. Create a new Supabase project. In **Project Settings → API**, copy the Project URL and publishable key (or legacy anon key).
3. In Codespaces terminal: `cp .env.example .env` and edit `.env` with your two real public values; set BOTH `VITE_` and server variants. **Do not commit `.env`.**
4. From Supabase **SQL Editor**, run `supabase/SETUP_NEW_PROJECT.sql` on the fresh database exactly once. If you run it again, check for non-idempotent migrations first.
5. In Supabase **Authentication → Providers → Email**, enable email/password. Set the Site URL to your deployed domain and add your local development callback URL if necessary.
6. Run `npm install`, `npm run build`, `npm test` and `npm run dev`. Forward the Codespaces port.
7. Create your first administrator account **testbala00@gmail.com** through Supabase **Authentication → Users → Add user**, setting a strong unique password, or through normal signup, then verify/confirm the email. Do not add passwords to GitHub.
8. In the Supabase SQL Editor run **in this order**:

```sql
SELECT private.provision_nextstep_first_admin('testbala00@gmail.com');
INSERT INTO public.admin_members (user_id, access_level)
SELECT id, 'super_admin' FROM auth.users
WHERE lower(email) = 'testbala00@gmail.com' AND email_confirmed_at IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET access_level = 'super_admin';
```

9. Visit `/admin/login` and sign in with the verified super admin's password. Staff administrators can be granted through `/admin/staff` once their own accounts are verified.

## Pages

- `/` welcome page
- `/student/login` signup/login; `/student/dashboard` student area
- `/colleges` college explorer with city/state, stream, and 10 km PIN-code search; `/courses` courses
- `/admin/login` secure admin sign-in; `/admin` admin overview
- `/admin/colleges` college editor, accreditation details, PIN codes, and up to 10 Top 10 selections
- `/admin/courses` course editor; `/admin/offerings` college/course fees
- `/admin/staff` staff management (super admin only)

## Deployment

This is a **TanStack Start server-rendered app**, not a static-only React build. Use a hosting platform that supports its generated server output (for example, a suitable Node deployment). Configure the same public/server Supabase environment values on the host. A basic GitHub Pages site will **not** serve it correctly. A build in Codespaces verifies bundling, not external deployment, database permissions, email delivery or live login.

For an existing database, apply `drizzle/migrations/0007_college_accreditation_top10_pincodes.sql` in the Supabase SQL Editor. It adds college accreditation and PIN fields, migrates PIN codes embedded at the end of city names, and enforces the ten-college Top 10 limit. PIN-code proximity search uses postal-code coordinates from Zippopotam.us. Never expose `SUPABASE_SERVICE_ROLE_KEY` in a browser or commit it to GitHub.

## Production checklist

- Confirm actual Supabase policies using authenticated student and staff accounts.
- Check the new site's Auth redirect URLs and email templates.
- Add genuine, verified college and tuition records through the admin pages.
- Deploy the SSR application to a server-capable host and check `/admin/login`, `/colleges`, and image uploads there.
- Remember this release does not contain a hosted AI career chatbot.
