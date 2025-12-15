# Vadae Database Schema - Quick Reference

## 📋 Tables Summary

```
┌─────────────────────────────────────────────────────────────┐
│                       VADAE SCHEMA                          │
└─────────────────────────────────────────────────────────────┘

🔐 Authentication & Profiles
├── profiles
│   ├── id (PK, FK → auth.users)
│   ├── full_name
│   ├── major, university
│   ├── is_pro_member
│   ├── interests[]
│   └── avatar_url

📅 Productivity
├── timetables
│   ├── id (PK)
│   ├── user_id (FK → profiles)
│   ├── title, location
│   ├── start_time, end_time
│   ├── is_recurring, recurrence_pattern
│   └── color, notes
│
├── tasks
│   ├── id (PK)
│   ├── user_id (FK → profiles)
│   ├── title, description
│   ├── due_date, priority, status
│   ├── category
│   └── related_timetable_id (FK → timetables)

📚 Resources/Vault
├── resources
│   ├── id (PK)
│   ├── user_id (FK → profiles)
│   ├── title, file_url, file_type
│   ├── file_size, tags[]
│   ├── description
│   └── is_public

👥 Social/Community
├── communities
│   ├── id (PK)
│   ├── name (UNIQUE)
│   ├── description, topic_tag
│   ├── creator_id (FK → profiles)
│   ├── avatar_url, banner_url
│   ├── is_private
│   └── member_count
│
├── community_members (Junction Table)
│   ├── id (PK)
│   ├── community_id (FK → communities)
│   ├── user_id (FK → profiles)
│   ├── role (admin/moderator/member)
│   └── joined_at
│
├── posts
│   ├── id (PK)
│   ├── community_id (FK → communities)
│   ├── author_id (FK → profiles)
│   ├── content
│   ├── attachments[]
│   ├── likes_count, comments_count
│   └── is_pinned
│
└── post_likes (Junction Table)
    ├── id (PK)
    ├── post_id (FK → posts)
    └── user_id (FK → profiles)
```

## 🔐 RLS Policy Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **profiles** | All users | Own only | Own only | ❌ |
| **timetables** | Own only | Own only | Own only | Own only |
| **tasks** | Own only | Own only | Own only | Own only |
| **resources** | Own + Public | Own only | Own only | Own only |
| **communities** | Public + Joined | Creator | Creator | Creator |
| **community_members** | In community | Self join | ❌ | Self leave |
| **posts** | In community | If member | Own only | Own only |
| **post_likes** | In community | Anyone | ❌ | Own only |

**Legend:**
- **Own only** = `auth.uid() = user_id`
- **Public** = All authenticated users
- **In community** = User is a member
- **If member** = Must belong to community

## 🔄 Automatic Features

### Triggers
- ✅ `updated_at` auto-updates on all tables
- ✅ Profile auto-created on user signup
- ✅ Community member count auto-maintained
- ✅ Post likes count auto-maintained

### Constraints
- ✅ End time must be after start time (timetables)
- ✅ Unique community names
- ✅ One membership per user per community
- ✅ One like per user per post

## 📦 Storage Buckets

| Bucket | Public | Used For |
|--------|--------|----------|
| `avatars` | ✅ Yes | User profile pictures |
| `resources` | ❌ No | Private user files (RLS) |
| `community-assets` | ✅ Yes | Community images |

---

**Quick Start:** Run `supabase/migrations/20250101000000_initial_schema.sql` in your Supabase SQL Editor.
