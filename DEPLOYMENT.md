# Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:

- [ ] Supabase account (production project)
- [ ] Vercel account (recommended host)
- [ ] Google AI API key
- [ ] Custom domain (optional but recommended)

---

## 1. Set Up Production Supabase

### Create Production Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Set project name (e.g., "vadea-production")
5. Set strong database password
6. Choose region closest to your users
7. Wait for project to initialize (~2 minutes)

### Run Database Migrations

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your production project
supabase link --project-ref YOUR_PRODUCTION_REF

# Push all migrations
supabase db push

# Verify migrations
supabase db diff
```

### Set Up Storage Bucket

1. Go to Storage in Supabase dashboard
2. Create new bucket named `resources`
3. Set to **Public**
4. Configure RLS policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');

-- Allow users to update/delete their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);
```

### Configure Authentication

1. Go to Authentication > URL Configuration
2. Set **Site URL** to your production domain (e.g., `https://vadea.app`)
3. Add **Redirect URLs**:
   - `https://vadea.app/auth/callback`
   - `https://vadea.app/` (for fallback)

4. Enable OAuth providers (if using):
   - Google: Add production OAuth credentials
   - GitHub: Add production OAuth credentials

---

## 2. Deploy to Vercel

### Option A: Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Add environment variables (see section 3)
5. Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts to set up project

# Add production domain
vercel domains add yourdomain.com

# Promote to production
vercel --prod
```

---

## 3. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required

```env
# Supabase (from production project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google AI
GEMINI_API_KEY=your-production-api-key

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Optional (Recommended)

```env
# Error Monitoring
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Analytics
PLAUSIBLE_DOMAIN=yourdomain.com
```

---

## 4. Custom Domain Setup

### Add Domain to Vercel

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `vadea.app`)
4. Follow DNS configuration instructions

### DNS Configuration

Add these records to your domain provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL Certificate

- Vercel automatically provisions SSL via Let's Encrypt
- Wait 24-48 hours for propagation
- Certificate auto-renews

---

## 5. Post-Deployment Verification

### Test All Features

- [ ] Sign up / Sign in
- [ ] User profile creation
- [ ] Dashboard loads
- [ ] File uploads work
- [ ] AI chat responds
- [ ] Course analysis works
- [ ] Research search works
- [ ] Community posts work
- [ ] Messaging works
- [ ] Dark mode works
- [ ] Mobile responsive

### Check Error Monitoring

1. Open Sentry dashboard
2. Verify events are being received
3. Set up alerts for critical errors

### Monitor Performance

1. Check Vercel Analytics
2. Review page load times
3. Check API response times
4. Monitor error rates

---

## 6. Rollback Plan

If deployment fails:

```bash
# Revert to previous deployment
vercel rollback

# Or redeploy specific version
vercel deploy --prod [deployment-url]
```

---

## 7. Ongoing Maintenance

### Regular Tasks

- **Daily**: Check error logs in Sentry
- **Weekly**: Review analytics, monitor costs
- **Monthly**: Security audit, dependency updates
- **Quarterly**: Database backups, performance review

### Database Backups

Supabase provides automatic backups:
- Free tier: 7 days retention
- Pro tier: 30 days retention
- Team tier: 90 days retention

Manual backup:
```bash
# Export database
supabase db dump > backup-$(date +%Y%m%d).sql

# Import if needed
supabase db reset
psql "postgres://..." < backup.sql
```

---

## 8. Scaling Considerations

### When to Scale

- **100-1000 users**: Current setup sufficient
- **1000-10000 users**: Consider upgrading Supabase tier
- **10000+ users**: Implement Redis for rate limiting, CDN for static assets

### Optimization

1. Enable Vercel Edge Functions for API routes
2. Add CDN (Cloudflare) for static assets
3. Implement database connection pooling
4. Use Supabase Read Replicas for heavy reads

---

## 9. Security Checklist

- [ ] All environment variables secured
- [ ] RLS policies tested and enabled
- [ ] Rate limiting active
- [ ] Security headers configured
- [ ] SSL certificate active
- [ ] OAuth properly configured
- [ ] API keys rotated from development
- [ ] Database password is strong
- [ ] File upload size limits set
- [ ] CORS properly configured

---

## 10. Monitoring & Alerts

### Set Up Alerts

**Sentry**:
- Error rate > 1% in 5 minutes
- New issue type detected
- Performance degradation

**Vercel**:
- Build failures
- Deployment errors
- High bandwidth usage

**Supabase**:
- Database CPU > 80%
- Storage > 80% capacity
- High connection count

---

## Quick Reference

### Key URLs

- **App**: https://yourdomain.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Sentry**: https://sentry.io

### Support Commands

```bash
# View deployment logs
vercel logs

# Check build status
vercel inspect [deployment-url]

# Run migrations
supabase db push

# Check database status
supabase db diff
```

---

## Estimated Costs (Monthly)

- Vercel: $0 (Hobby) or $20 (Pro)
- Supabase: $0 (Free) or $25 (Pro)
- Domain: $10-15/year
- **Total**: $0-45/month

---

## Need Help?

- Next.js Docs: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Community: Create GitHub issue
