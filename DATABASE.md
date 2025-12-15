# Vadae Database Schema Documentation

## Overview
This document describes the database schema for **Vadae Student OS**, a comprehensive platform for student organization, collaboration, and productivity.

## 📊 Database Tables

### 1. **profiles**
Extends Supabase authentication with student-specific data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | References `auth.users.id` |
| `full_name` | TEXT | Student's full name |
| `major` | TEXT | Field of study (e.g., "Computer Science") |
| `university` | TEXT | University name (optional) |
| `is_pro_member` | BOOLEAN | Premium subscription status |
| `interests` | TEXT[] | Array of interests (e.g., ['coding', 'art']) |
| `avatar_url` | TEXT | Profile picture URL |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- ✅ All users can view all profiles (public directory)
- ✅ Users can only update/insert their own profile

---

### 2. **timetables**
Stores student class schedules and events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `user_id` | UUID (FK) | References `profiles.id` |
| `title` | TEXT | Class/event name |
| `start_time` | TIMESTAMPTZ | Event start time |
| `end_time` | TIMESTAMPTZ | Event end time |
| `location` | TEXT | Physical or virtual location |
| `is_recurring` | BOOLEAN | Whether event repeats |
| `recurrence_pattern` | TEXT | Pattern (e.g., "weekly-monday") |
| `color` | TEXT | Hex color for UI display |
| `notes` | TEXT | Additional notes |

**RLS Policies:**
- ✅ Users can only view, create, update, and delete their own timetables

---

### 3. **resources**
File storage references for the student vault/library.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `user_id` | UUID (FK) | References `profiles.id` |
| `title` | TEXT | File/resource title |
| `file_url` | TEXT | Supabase Storage bucket URL |
| `file_type` | TEXT | Type (pdf, docx, link, image, etc.) |
| `file_size` | BIGINT | Size in bytes |
| `tags` | TEXT[] | Searchable tags |
| `description` | TEXT | Resource description |
| `is_public` | BOOLEAN | Share with community |

**RLS Policies:**
- ✅ Users can view their own resources + public resources
- ✅ Users can only create, update, and delete their own resources

---

### 4. **communities**
Social groups and study communities.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `name` | TEXT (UNIQUE) | Community name |
| `description` | TEXT | Community description |
| `topic_tag` | TEXT | Maps to profile interests |
| `creator_id` | UUID (FK) | References `profiles.id` |
| `avatar_url` | TEXT | Community avatar |
| `banner_url` | TEXT | Community banner |
| `is_private` | BOOLEAN | Private/public visibility |
| `member_count` | INTEGER | Cached member count |

**RLS Policies:**
- ✅ Users can view public communities OR communities they're members of
- ✅ Only creators can update/delete their communities

---

### 5. **community_members**
Junction table for user-community membership.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `community_id` | UUID (FK) | References `communities.id` |
| `user_id` | UUID (FK) | References `profiles.id` |
| `role` | TEXT | Role (admin, moderator, member) |
| `joined_at` | TIMESTAMPTZ | Join timestamp |

**Constraint:** `UNIQUE(community_id, user_id)` - prevents duplicate memberships

**RLS Policies:**
- ✅ Users can view members of communities they belong to
- ✅ Users can join (INSERT) and leave (DELETE) communities

---

### 6. **posts**
Social feed posts within communities.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `community_id` | UUID (FK) | References `communities.id` |
| `author_id` | UUID (FK) | References `profiles.id` |
| `content` | TEXT | Post content |
| `attachments` | TEXT[] | URLs to attached files |
| `likes_count` | INTEGER | Cached like count |
| `comments_count` | INTEGER | Cached comment count |
| `is_pinned` | BOOLEAN | Pinned status |

**RLS Policies:**
- ✅ Users can view posts in communities they belong to
- ✅ Users can only create posts in communities they're members of
- ✅ Authors can update/delete their own posts

---

### 7. **post_likes**
Track post likes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `post_id` | UUID (FK) | References `posts.id` |
| `user_id` | UUID (FK) | References `profiles.id` |

**Constraint:** `UNIQUE(post_id, user_id)` - prevents duplicate likes

---

### 8. **tasks**
Assignment and task management.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `user_id` | UUID (FK) | References `profiles.id` |
| `title` | TEXT | Task title |
| `description` | TEXT | Task description |
| `due_date` | TIMESTAMPTZ | Due date |
| `priority` | TEXT | Priority (low, medium, high) |
| `status` | TEXT | Status (todo, in_progress, completed) |
| `category` | TEXT | Category (assignment, exam, project) |
| `related_timetable_id` | UUID (FK) | Optional link to timetable |
| `completed_at` | TIMESTAMPTZ | Completion timestamp |

**RLS Policies:**
- ✅ Users can only view, create, update, and delete their own tasks

---

## 🔐 Row Level Security (RLS)

All tables have RLS **enabled** with the following principles:

1. **Personal Data** (timetables, resources, tasks): Users can only access their own data
2. **Social Data** (posts, communities): Access based on membership
3. **Public Data** (profiles, public resources): Readable by all authenticated users

## 🔄 Automatic Triggers

### 1. **updated_at Timestamps**
All tables automatically update the `updated_at` column on modification.

### 2. **Profile Auto-Creation**
When a user signs up via Supabase Auth, a profile is automatically created.

### 3. **Community Member Count**
The `communities.member_count` is automatically updated when members join/leave.

### 4. **Post Likes Count**
The `posts.likes_count` is automatically updated when users like/unlike posts.

---

## 🗄️ Storage Buckets

### Recommended Buckets:
1. **avatars** (public) - User profile pictures
2. **resources** (private) - User-uploaded files
3. **community-assets** (public) - Community avatars/banners

---

## 🚀 Setup Instructions

### 1. Create a Supabase Project
Visit [supabase.com](https://supabase.com) and create a new project.

### 2. Run the Migration
```bash
# Copy the migration SQL
# Go to Supabase Dashboard > SQL Editor
# Paste and run the contents of:
# supabase/migrations/20250101000000_initial_schema.sql
```

### 3. Configure Environment Variables
```bash
# Copy env.example to .env.local
cp env.example .env.local

# Fill in your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set Up Storage Buckets (Optional)
In the Supabase Dashboard, create the following Storage buckets:
- `avatars` (public)
- `resources` (private with RLS)
- `community-assets` (public)

---

## 📝 Type Safety

TypeScript types are auto-generated in `src/types/database.types.ts`. Import and use them:

```typescript
import { Database } from '@/types/database.types'
import { supabase } from '@/lib/supabase'

// Fully type-safe queries
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
```

---

## 🔗 Relationships

```
auth.users
  ↓
profiles (1:1)
  ├─→ timetables (1:N)
  ├─→ resources (1:N)
  ├─→ tasks (1:N)
  └─→ community_members (N:M with communities)
       └─→ communities
            └─→ posts (1:N)
                 └─→ post_likes (N:M with profiles)
```

---

## 📊 Indexes

Optimized indexes are created for:
- Foreign key relationships
- Frequently queried fields (user_id, created_at, tags)
- GIN indexes for array columns (tags, interests)

---

## 🎯 Next Steps

1. ✅ Run the migration in Supabase
2. ✅ Configure environment variables
3. ✅ Set up storage buckets
4. 🔨 Build the UI components
5. 🔨 Implement authentication flows
6. 🔨 Create API routes for complex operations

---

**Created for Vadae Student OS** | Database Version 1.0
