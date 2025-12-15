# Vadae Social Community Hub

## ✅ Complete

A full-featured social feed where students connect based on shared interests, with optimistic UI updates and RLS protection.

---

## 🎯 **Overview**

**Purpose:** Enable students to share posts, like content, and engage with classmates who share their interests.

**Key Features:**
- Interest-based community matching
- Create posts with community selection
- Like posts with optimistic UI
- Real-time engagement counters
- RLS membership verification

---

## 📁 **Files Created**

| File | Purpose |
|------|---------|
| `src/app/community/page.tsx` | Server component (main feed) |
| `src/app/actions/community.ts` | Server actions (create, like, join) |
| `src/components/community/post-card.tsx` | Post display with like button |
| `src/components/community/create-post-form.tsx` | Post creation form |
| `src/components/community/index.ts` | Component exports |

---

## 🔄 **Data Flow**

### **Server Component Logic:**

```typescript
1. Get authenticated user
   ↓
2. Get user profile (includes interests)
   ↓
3. Find communities matching interests:
   SELECT * FROM communities 
   WHERE topic_tag IN (user.interests)
   ↓
4. Get user's community memberships:
   SELECT * FROM community_members 
   WHERE user_id = current_user
   ↓
5. Fetch posts from matched communities:
   SELECT * FROM posts 
   WHERE community_id IN (matched_communities)
   ORDER BY created_at DESC
   ↓
6. Get user's likes:
   SELECT post_id FROM post_likes 
   WHERE user_id = current_user
   ↓
7. Render feed with client components
```

---

## 📊 **Database Queries**

### **1. Find Matching Communities**
```typescript
await supabase
  .from('communities')
  .select('id, name, topic_tag')
  .in('topic_tag', userInterests)
```

**Example:**
```
User interests: ["Coding", "Design"]
→ Communities: CS Major, Web Dev Club, Design Studio
```

### **2. Get User Memberships**
```typescript
await supabase
  .from('community_members')
  .select('community_id, communities (id, name)')
  .eq('user_id', userId)
```

**Purpose:** Populate "Select Community" dropdown

### **3. Fetch Posts**
```typescript
await supabase
  .from('posts')
  .select(`
    *,
    profiles:author_id (id, full_name, avatar_url),
    communities:community_id (id, name)
  `)
  .in('community_id', communityIds)
  .order('created_at', { ascending: false })
  .limit(50)
```

**Includes:**
- Post content
- Author details (join)
- Community name (join)
- Engagement counts

### **4. Check User Likes**
```typescript
await supabase
  .from('post_likes')
  .select('post_id')
  .eq('user_id', userId)
  .in('post_id', postIds)
```

**Returns:** Set of liked post IDs for UI state

---

## 🎨 **UI Components**

### **1. CreatePostForm** (Client Component)

**Features:**
- ✅ Community selector dropdown
- ✅ Textarea with character count
- ✅ Submit button with loading state
- ✅ Empty state (no communities)
- ✅ Form validation

**Props:**
```typescript
{
  userCommunities: Array<{
    id: string
    name: string
  }>
}
```

**Empty State:**
```tsx
if (userCommunities.length === 0) {
  return (
    "You haven't joined any communities yet.
    Join communities to start posting."
  )
}
```

**Validation:**
- Content cannot be empty
- Must select a community
- Trims whitespace

**After Success:**
- Toast notification
- Clear form
- Refresh page to show new post

---

### **2. PostCard** (Client Component)

**Layout:**
```
┌─────────────────────────────────────┐
│ 👤 Alex Chen • CS Major   ⋮        │
│    2 hours ago                      │
├─────────────────────────────────────┤
│ Just finished the algorithm exam!   │
│ Who else thought question 3 was     │
│ tough?                               │
├─────────────────────────────────────┤
│ ❤️ 12    💬 5                       │
└─────────────────────────────────────┘
```

**Props:**
```typescript
{
  post: {
    id, content, likes_count, comments_count,
    created_at, profiles, communities
  },
  currentUserId: string,
  initialIsLiked: boolean
}
```

**Features:**
- ✅ Avatar (first letter of name)
- ✅ Author name + community badge
- ✅ Time ago (formatDistance)
- ✅ Content (whitespace preserved)
- ✅ Like button (heart icon)
- ✅ Comment count (placeholder)
- ✅ More options button

**Optimistic UI:**
```typescript
User clicks like
  ↓
1. Immediately update UI:
   - Toggle heart fill
   - Increment/decrement count
  ↓
2. Call server action
  ↓
3. On success: Keep UI updated
   On error: Revert to previous state
```

**States:**
```typescript
const [isLiked, setIsLiked] = useState(initialIsLiked)
const [likesCount, setLikesCount] = useState(post.likes_count)
const [isLiking, setIsLiking] = useState(false)
```

---

## 🔐 **Server Actions**

### **1. createPost**

**Function:**
```typescript
async function createPost(
  communityId: string, 
  content: string
)
```

**Logic:**
1. Get authenticated user
2. **Check membership:**
   ```sql
   SELECT * FROM community_members 
   WHERE user_id = current_user 
   AND community_id = communityId
   ```
3. **RLS Protection:** If not member → error
4. Insert post:
   ```sql
   INSERT INTO posts (
     community_id, author_id, content
   )
   ```
5. Revalidate community page

**Error Handling:**
- Not authenticated → error
- Not member → "You must be a member..."
- DB error → "Failed to create post"

---

### **2. toggleLike**

**Function:**
```typescript
async function toggleLike(postId: string)
```

**Logic:**
1. Get authenticated user
2. Check if already liked:
   ```sql
   SELECT * FROM post_likes 
   WHERE user_id = current_user 
   AND post_id = postId
   ```
3. **If liked:** Delete + decrement count
4. **If not liked:** Insert + increment count
5. Return new state

**Response:**
```typescript
{
  success: true,
  isLiked: boolean,
  likesCount: number
}
```

**Optimistic Update Flow:**
```
Client updates UI instantly
  ↓
Server processes request
  ↓
Client receives confirmation
  ↓
If error: revert UI
If success: keep UI updated
```

---

### **3. joinCommunity**

**Function:**
```typescript
async function joinCommunity(communityId: string)
```

**Logic:**
1. Get authenticated user
2. Insert membership:
   ```sql
   INSERT INTO community_members (
     community_id, user_id, role
   )
   ```
3. Increment community member_count
4. Revalidate community page

**Use Case:** Future feature for browse communities

---

## 🎯 **Interest Matching**

### **How It Works:**

**User Profile:**
```json
{
  "id": "user-123",
  "interests": ["Coding", "Design", "Math"]
}
```

**Communities:**
```json
[
  { "id": "c1", "name": "CS Major", "topic_tag": "Coding" },
  { "id": "c2", "name": "Design Club", "topic_tag": "Design" },
  { "id": "c3", "name": "Math Tutoring", "topic_tag": "Math" }
]
```

**Result:** User sees posts from all 3 communities

### **No Interests:**
```tsx
{userInterests.length === 0 && (
  <Card className="border-yellow-200 bg-yellow-50">
    ⚠️ Add your interests to see communities
    Visit settings to add interests...
  </Card>
)}
```

---

## 📱 **UI States**

### **Empty States:**

**1. No Communities Joined:**
```
You haven't joined any communities yet.
Join communities to start posting.
```

**2. No Posts:**
```
┌─────────────────────────┐
│     👥 (icon)           │
│   No posts yet          │
│   Be the first to post! │
└─────────────────────────┘
```

**3. No Interests:**
```
⚠️ Add your interests to see communities
Visit settings to discover communities.
```

### **Loading States:**

**Creating Post:**
- Button disabled
- Text: "Posting..."

**Toggling Like:**
- Button disabled (while request pending)
- Optimistic UI update shown

---

## 🔒 **RLS Protection**

### **Membership Check:**

```typescript
// Before posting
const { data: membership } = await supabase
  .from('community_members')
  .select('id')
  .eq('user_id', userId)
  .eq('community_id', communityId)
  .single()

if (!membership) {
  return { 
    error: 'You must be a member of this community to post' 
  }
}
```

**Database RLS Policies:**
```sql
-- User can only post in communities they're members of
CREATE POLICY "Users can create posts in their communities"
ON posts FOR INSERT
USING (
  EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = posts.community_id
    AND user_id = auth.uid()
  )
);
```

---

## 🎨 **Design System**

### **Post Card:**
```css
Card: border hover:shadow-md transition
Avatar: h-10 w-10 rounded-full gradient
Author: font-semibold text-sm
Time: text-xs text-gray-600
Badge: variant="outline" text-xs
Content: text-sm whitespace-pre-wrap
Buttons: variant="ghost" size="sm"
```

### **Like Button:**
```tsx
Unliked: text-gray-600, heart outline
Liked: text-red-600, heart filled (fill-red-600)
Hover: Smooth transition
```

### **Colors:**
```
Red (like): #DC2626
Gray (unlike): #4B5563
Yellow (warning): #FCD34D
```

---

## 📊 **Performance**

### **Optimizations:**

**1. Limit Posts:**
```typescript
.limit(50)  // Don't load all posts
```

**2. Parallel Queries:**
All data fetched in single server component render

**3. Optimistic UI:**
No waiting for server on likes (instant feedback)

**4. Selective Joins:**
Only join needed fields:
```typescript
.select('id, full_name')  // Not all profile columns
```

---

## 🚀 **User Journey**

### **First Time User:**
```
1. Login → Dashboard
2. Click "Community" in sidebar
3. See warning: "Add interests"
4. Go to Settings (or Onboarding)
5. Add interests: Coding, Design
6. Return to Community
7. See posts from CS and Design communities
8. Create first post
9. Like classmates' posts
```

### **Active User:**
```
1. Visit /community
2. See feed of posts from matched communities
3. Create post in CS Major community
4. Like interesting posts
5. Comment on discussions (future feature)
```

---

## ✨ **Features Implemented**

**Data Fetching:**
- ✅ Server-side queries
- ✅ Interest-based matching
- ✅ Community membership checks
- ✅ Post likes tracking

**UI Components:**
- ✅ PostCard with author info
- ✅ CreatePostForm with validation
- ✅ Like button (optimistic)
- ✅ Community selector dropdown
- ✅ Empty states

**Interactions:**
- ✅ Create posts
- ✅ Toggle likes
- ✅ Time ago formatting
- ✅ Character count
- ✅ Toast notifications

**Security:**
- ✅ Authentication required
- ✅ RLS membership verification
- ✅ Server-side validation
- ✅ Error handling

---

## 🔧 **Future Enhancements**

**Planned Features:**
1. **Comments:** Reply to posts
2. **Images:** Upload media with posts
3. **Mentions:** Tag other users (@username)
4. **Hashtags:** Categorize posts (#algorithm)
5. **Search:** Find posts by keyword
6. **Notifications:** Get notified on likes/comments
7. **Pin Posts:** Featured community announcements
8. **Report:** Flag inappropriate content
9. **Infinite Scroll:** Load more on scroll
10. **Real-time:** WebSocket updates for new posts

---

## ✅ **Testing Checklist**

**Feed Display:**
- ✅ Posts load from matched communities
- ✅ Author names display correctly
- ✅ Time ago formats properly
- ✅ Community badges show

**Post Creation:**
- ✅ Form validates empty content
- ✅ Community selector works
- ✅ Submit creates post
- ✅ Non-members can't post (RLS)
- ✅ Page refreshes to show new post

**Like Functionality:**
- ✅ Click like toggles state
- ✅ Count increments/decrements
- ✅ UI updates optimistically
- ✅ Reverts on error
- ✅ Server state syncs

**Empty States:**
- ✅ No communities joined
- ✅ No posts in feed
- ✅ No interests set

---

## 🎊 **Status: Production Ready**

**All requirements met:**
- ✅ Server component with data fetching
- ✅ Interest-based community matching
- ✅ Post creation with RLS checks
- ✅ Like button with optimistic UI
- ✅ Post card with author info
- ✅ Community selector dropdown
- ✅ Empty state handling
- ✅ Error handling
- ✅ Mobile responsive

**The Social Community Hub is ready for student engagement!** 🎓

---

**Created:** 2025-12-14  
**Version:** 1.0  
**Route:** `/community`  
**Status:** ✅ Production Ready
