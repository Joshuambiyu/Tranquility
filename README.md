# TranquilityHub

TranquilityHub is a Next.js app with Google authentication, a contact flow with DB persistence and optional email notifications, and a protected admin view for contact submissions.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and configure values:

```bash
cp .env.example .env
```

3. Run Prisma migrations:

```bash
npm run prisma:migrate
```

4. Start development server:

```bash
npm run dev
```

## Required environment variables

Authentication and DB:
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- NEXT_PUBLIC_GOOGLE_CLIENT_ID

For production with this domain:
- NEXTAUTH_URL=https://www.tranquilityhub.co.ke

Contact and email:
- RESEND_API_KEY
- RESEND_FROM_EMAIL
- CONTACT_NOTIFY_TO

Admin role management:
- Admin access is role-based using User.role (admin/user).
- Additional admins can be added or removed from /admin via the Admin Access section.
- A user must sign in at least once before their role can be changed.

Anti-spam tuning:
- CONTACT_RATE_LIMIT_WINDOW_MS (default 60000)
- CONTACT_RATE_LIMIT_MAX (default 5)

## Contact flow behavior

1. Contact submissions are always written to DB first.
2. Email notification runs after DB save and is non-blocking.
3. If email fails, user still gets success and you can review entries at the admin page.
4. Anti-spam protections include a honeypot field and per-IP rate limiting.

## Admin submissions view

Route:
- /admin/contact-submissions

Access policy:
- User must be signed in.
- User role must be admin.

## Google OAuth Console setup

In Google Cloud Console (APIs & Services > Credentials > OAuth 2.0 Client), add:

Authorized JavaScript origins:
- http://localhost:3000
- https://www.tranquilityhub.co.ke

Authorized redirect URIs:
- http://localhost:3000/api/auth/callback/google
- https://www.tranquilityhub.co.ke/api/auth/callback/google

## Production safety checks

Run preflight env checks before deploying:

```bash
npm run check:prod-env
```

This checks required env vars and warns about common production issues.

## Smoke test

Run contact API smoke test against local or deployed URL:

```bash
SMOKE_BASE_URL=http://localhost:3000 npm run smoke:contact
```

On PowerShell:

```powershell
$env:SMOKE_BASE_URL="http://localhost:3000"; npm run smoke:contact
```

## Useful scripts

- npm run dev
- npm run build
- npm run start
- npm run lint
- npm run test:integration
- npm run check:prod-env
- npm run smoke:contact
- npm run prisma:migrate
- npm run prisma:studio
