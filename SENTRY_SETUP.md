# Sentry Setup Instructions

## ✅ Sentry is Configured!

All Sentry configuration files have been created. To activate error monitoring:

### 1. Sign Up for Sentry

Visit [sentry.io](https://sentry.io) and create a free account.

### 2. Create a Project

- Choose **Next.js** as the platform
- Name it "Vadea" or "vadea-v4"
- Note your **DSN** (Data Source Name)

### 3. Add Environment Variables

Add these to your `.env.local` file:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=vadea

# Optional: For source map uploads
SENTRY_AUTH_TOKEN=your-auth-token
```

### 4. Get Your Values

**DSN**: Found in Sentry Dashboard → Settings → Client Keys (DSN)
**Org Slug**: Your organization name (in URL)
**Project**: Your project name
**Auth Token**: Settings → Account → API → Auth Tokens → Create New Token

### 5. Test It Works

I've created a test page at `/test-error`. After adding your DSN:

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000/test-error`
3. Click "Throw Test Error"
4. Check your Sentry dashboard - error should appear!

### 6. Remove Test Page (After Testing)

Delete `src/app/test-error/page.tsx` - it's only for verification.

---

## What's Already Configured

✅ Client-side error tracking (`sentry.client.config.ts`)
✅ Server-side error tracking (`sentry.server.config.ts`)  
✅ Edge runtime tracking (`sentry.edge.config.ts`)
✅ Error boundary integration (`error.tsx`)
✅ Performance monitoring (10% in production)
✅ Session replay (10% of sessions, 100% of errors)
✅ Source map uploads
✅ React component annotations
✅ Vercel Cron monitoring

---

## Features Enabled

### Error Tracking
- Automatic exception capture
- Stack traces with source maps
- User context
- Environment tags

### Performance Monitoring
- Page load times
- API response times
- Database query performance
- Custom transactions

### Session Replay
- See what users did before errors
- Privacy-friendly (text/media masked)
- 10% sample rate
- 100% on errors

---

## Next Steps

Once environment variables are added:
1. Deploy to Vercel
2. Vercel will use the env vars automatically
3. Errors will start appearing in Sentry dashboard
4. Set up alerts in Sentry (email, Slack, etc.)

---

**Note**: Sentry is free for up to 5,000 errors/month and 10,000 performance events/month - more than enough for initial launch!
