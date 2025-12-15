# Vadae Setup Guide

## 🚀 Quick Start

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name:** Vadae
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users

### Step 2: Run Database Migration
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/20250101000000_initial_schema.sql`
4. Paste into the editor
5. Click **"Run"** (bottom right)
6. Wait for "Success" message (should take ~5-10 seconds)

### Step 3: Get Your Credentials
1. In Supabase Dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 4: Configure Environment Variables
1. Create a file named `.env.local` in your project root
2. Add your credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_actual_key_here
```

### Step 5: Set Up Storage Buckets
1. In Supabase Dashboard, go to **Storage**
2. Create these buckets:

#### Bucket 1: avatars
- **Name:** `avatars`
- **Public:** ✅ Yes
- **File size limit:** 2MB
- **Allowed MIME types:** `image/*`

#### Bucket 2: resources
- **Name:** `resources`
- **Public:** ❌ No (we'll use RLS)
- **File size limit:** 50MB
- **Allowed MIME types:** `*/*`

#### Bucket 3: community-assets
- **Name:** `community-assets`
- **Public:** ✅ Yes
- **File size limit:** 5MB
- **Allowed MIME types:** `image/*`

### Step 6: Configure Storage RLS Policies

#### For `resources` bucket (private files):
Go to **Storage** > **Policies** > **resources** > **New Policy**

**Policy 1: Users can upload own files**
```sql
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: Users can view own files**
```sql
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: Users can delete own files**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 7: Enable Authentication Providers

1. Go to **Authentication** > **Providers**
2. Enable the providers you want:

#### Email (Recommended)
- ✅ Enable Email provider
- ✅ Confirm email: **Required** (or Optional for development)

#### Google OAuth (Optional)
- ✅ Enable Google provider
- Add your OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)

#### GitHub OAuth (Optional)
- ✅ Enable GitHub provider
- Add your OAuth credentials from [GitHub Settings](https://github.com/settings/developers)

### Step 8: Test Your Connection

Create a simple test file: `test-supabase.ts`
```typescript
import { supabase } from '@/lib/supabase'

async function testConnection() {
  const { data, error } = await supabase
    .from('profiles')
    .select('count')
  
  if (error) {
    console.error('❌ Connection failed:', error)
  } else {
    console.log('✅ Connected successfully!')
  }
}

testConnection()
```

### Step 9: Run the Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` and start building! 🎉

---

## 🔧 Optional: Supabase CLI Setup

For a better development experience, install the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Generate TypeScript types automatically
supabase gen types typescript --linked > src/types/database.types.ts
```

---

## 📚 Next Steps

1. ✅ Database schema is ready
2. 🔨 Build authentication flows (`/login`, `/signup`)
3. 🔨 Create dashboard layout
4. 🔨 Implement timetable view
5. 🔨 Build resource vault
6. 🔨 Add community features
7. 🔨 Integrate AI features (OpenAI)
8. 🔨 Add Stripe for pro membership

---

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists in project root
- Verify the variable names match exactly (with `NEXT_PUBLIC_` prefix)
- Restart your dev server after adding env vars

### "relation does not exist"
- The migration didn't run successfully
- Re-run the SQL migration in Supabase SQL Editor
- Check for any error messages in the SQL output

### "Row Level Security policy violation"
- Make sure you're authenticated
- Check the RLS policies match the schema
- Verify `auth.uid()` is returning the correct user ID

### Storage upload fails
- Check bucket exists and is properly configured
- Verify RLS policies for storage are set up
- Ensure file size is within limits

---

**Need help?** Check the full documentation in `DATABASE.md`
