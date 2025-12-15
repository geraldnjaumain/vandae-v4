# implementation_plan.md

## Vadae V4 Completion Plan: "Path to Perfection"

This plan outlines the steps to upgrade the current placeholders (Timetable, Resources, AI Advisor) into fully functional, premium features.

---

### **Phase 1: The Resource Vault (File Management)**
**Goal:** Allow users to securely upload, organize, and view academic files.

#### 1.1 Backend & Storage (Supabase)
- [ ] **Storage Bucket:** Create a Supabase Storage bucket named `vault` (private).
- [ ] **RLS Policies:**
    - Allow users to upload to their own folder (`{user_id}/*`).
    - Allow users to read/download their own files.
    - Allow users to delete their own files.

#### 1.2 UI Components
- [ ] **`UploadZone` Component:**
    - Drag-and-drop area with hover animations.
    - Progress bar for uploads.
    - File type validation (PDF, DOCX, IMG).
- [ ] **`FileCard` Component:**
    - Visual preview (icon based on file type).
    - Actions menu (Rename, Download, Delete).
    - "New" badge for recently added files.

#### 1.3 Page Integration
- [ ] **Update `src/app/resources/page.tsx`:**
    - Replace placeholder with grid of `FileCard`s.
    - Add Filter/Sort toolbar (by date, type, name).
    - Connect `UploadZone` to `resources` table in DB (metadata) + Storage bucket (file).

---

### **Phase 2: Timetable & Calendar**
**Goal:** Enable users to manage their weekly class schedule and one-off events.

#### 2.1 Backend Actions
- [ ] **Server Actions (`src/app/timetable/actions.ts`):**
    - `createEvent(data)`: Insert into `timetables` table.
    - `getEvents(startDate, endDate)`: Fetch events for the view.
    - `deleteEvent(id)`: Remove event.

#### 2.2 UI Components
- [ ] **`EventForm` Dialog:**
    - Fields: Title, Type (Class, Exam, Study), Day/Time, Location, Color Code.
    - Recurring options (e.g., "Weekly on Mondays").
- [ ] **`WeekView` Component:**
    - specific CSS grid layout for Monday-Sunday columns.
    - Dynamic visual blocks positioned by time.
    - Click-to-edit functionality.

#### 2.3 Page Integration
- [ ] **Update `src/app/timetable/page.tsx`:**
    - Implement `WeekView` as the main interface.
    - Add "Add Event" button floating action or header button.
    - Empty state: "No classes this week? Add one to get started."

---

### **Phase 3: AI Advisor**
**Goal:** Create a responsive, helpful AI chat interface for academic assistance.

#### 3.1 Backend API
- [ ] **API Route (`src/app/api/chat/route.ts`):**
    - Connect to OpenAI API (accessing `OPENAI_API_KEY`).
    - System Prompt: Configure AI as a "Friendly Academic Advisor".
    - Context Awareness: Optionally fetch user's schedule/interests to inform answers.

#### 3.2 UI Components
- [ ] **`ChatInterface` Component:**
    - Scrollable message history (User bubbles right, AI bubbles left).
    - Markdown rendering for AI responses (bolding key terms, lists).
    - "Thinking..." animation state.
- [ ] **`PromptLibrary`:**
    - Quick-start chips: "Summarize this topic", "Create a study plan", "Explain this concept".

#### 3.3 Page Integration
- [ ] **Update `src/app/ai-advisor/page.tsx`:**
    - Full-screen or contained chat layout.
    - Persist chat history locally or in DB (optional for V1).

---

### **Phase 4: Polish & Quality Assurance**
**Goal:** Ensure the app feels "Premium" and bug-free.

- [ ] **Global Loading States:** Skeleton loaders for all data fetching.
- [ ] **Toasts/Notifications:** Success messages for "File Uploaded", "Class Added".
- [ ] **Mobile Responsiveness:** Verify Timetable and Chat work on mobile screens.
- [ ] **Final Code Cleanup:** Remove unused placeholders and comments.
