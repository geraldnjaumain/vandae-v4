# Known Issues

Last Updated: December 15, 2025

## Non-Critical Issues

### Build Warnings
- ⚠️ **Sentry deprecation warnings** (non-blocking)
  - `automaticVercelMonitors` → Will use webpack config in future
  - `reactComponentAnnotation` → Will use webpack config in future
  - **Impact:** None - functionality works perfectly
  - **Fix:** Awaiting Sentry package update

- ⚠️ **Middleware deprecation warning** (Next.js)
  - Middleware file convention deprecated
  - **Impact:** None - works in production
  - **Fix:** Will update convention in future Next.js version

### Browser Compatibility
- 🟢 **Chrome 90+** - Fully tested
- 🟢 **Firefox 88+** - Fully tested
- 🟢 **Safari 14+** - Tested, minor CSS differences
- 🟢 **Edge 90+** - Chromium-based, works like Chrome
- 🟡 **Mobile Safari** - Works, some animations may differ
- 🟡 **Android Chrome** - Works, test on actual devices

### Missing Features (Planned Post-Launch)

#### Email Notifications
- **Status:** Not implemented
- **Workaround:** In-app notifications work
- **Timeline:** Week 2 post-launch
- **Provider:** Will use Resend or SendGrid

#### Advanced Search
- **Status:** Basic search only
- **Missing:** Filters, sorting, advanced queries
- **Timeline:** Month 2

#### Video Calls in DMs
- **Status:** Not implemented
- **Planned:** Jitsi Meet integration
- **Timeline:** Month 3

#### Mobile Push Notifications
- **Status:** Not implemented
- **Requires:** PWA setup
- **Timeline:** Quarter 2

#### Resource Vault File Preview
- **Status:** Download only
- **Missing:** In-browser PDF/doc preview
- **Timeline:** Month 2

---

## Resolved Issues

### Fixed in This Session
- ✅ **150+ TypeScript errors** - All form type safety issues resolved
- ✅ **PDF parse import** - Dynamic import workaround in place
- ✅ **Type casting in inbox** - Proper type inference implemented

---

## Performance Considerations

### Expected Behavior (Not Bugs)

#### First Load
- **Time:** 2-3 seconds on fast connection
- **Reason:** Next.js bundle + initial data fetch
- **Acceptable:** Yes for production

#### Syllabus AI Parsing
- **Time:** 5-15 seconds depending on PDF size
- **Reason:** AI processing (OpenAI/Gemini)
- **Acceptable:** Yes - shows loading state

#### Image Uploads
- **Time:** 1-3 seconds
- **Reason:** Supabase Storage upload + processing
- **Acceptable:** Yes

---

## Supabase Limits (Free Tier)

### Database
- 500 MB storage
- 2 GB bandwidth/month
- Paused after 7 days inactivity

### Storage
- 1 GB file storage
- 2 GB bandwidth/month

### Auth
- 50,000 monthly active users (MAU)
- Unlimited auth attempts

**Note:** More than enough for initial launch. Upgrade to Pro ($25/mo) when needed.

---

## Sentry Limits (Free Tier)

### Errors
- 5,000 errors/month
- Unlimited team members

### Performance
- 10,000 performance events/month

### Session Replay
- 50 replays/month

**Note:** Sufficient for beta and early production. Upgrade when scaling.

---

## User-Reported Issues

*This section will be updated as beta testers report bugs*

### Format:
```
Issue #X: Description
- Reported by: Name
- Date: MM/DD/YYYY
- Status: Investigating / Fixed / Known limitation
- Priority: Critical / High / Medium / Low
```

---

## How to Report New Issues

1. Check this document first - it might be known!
2. For bugs: Email [support email] or create GitHub issue
3. For questions: Check documentation first
4. For features: Use feedback form

---

## Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Mobile |
|---------|--------|---------|--------|--------|
| Auth | ✅ | ✅ | ✅ | ✅ |
| Syllabus Upload | ✅ | ✅ | ✅ | ✅ |
| Tasks | ✅ | ✅ | ✅ | ✅ |
| Communities | ✅ | ✅ | ✅ | ✅ |
| Messaging | ✅ | ✅ | ✅ | ✅ |
| Dark Mode | ✅ | ✅ | ✅ | ✅ |
| File Upload | ✅ | ✅ | ✅ | ✅ |
| Real-time | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ⚡* | ⚡* |

*⚡ = Works with limitations (e.g., no system notifications on mobile without PWA)

---

## Accessibility Status

- ✅ Keyboard navigation works
- ✅ Color contrast meets WCAG AA
- ✅ Alt text on images
- 🟡 Screen reader optimization (basic support)
- ⏳ ARIA labels (partial coverage)

**Goal:** WCAG 2.1 AA compliance by Month 2

---

**For Immediate Issues:** Create a GitHub issue or contact [your email]  
**For General Feedback:** Use in-app feedback form (coming soon)
