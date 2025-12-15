# 🎓 Vadea - Advanced Student Operating System

> Your all-in-one platform for academic excellence, powered by AI

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)

## ✨ Features

### 📚 **Smart Assignment Editor**
- Rich text editor with markdown support
- AI-powered writing assistance (grammar, improvements, outlines)
- Integrated research panel
- Real-time word counter
- Auto-save functionality

### 🤖 **AI Assistant**
- Full-page chat interface with conversation history
- Context-aware responses about your courses
- Study planning and time management advice
- Academic writing support
- Exam preparation strategies

### 🔬 **Background Research Engine**
- Automatic course unit extraction from syllabi
- Continuous online source discovery
- Relevance-based ranking system
- Categorized sources (Articles, Videos, Books, Papers)
- Integrated research hub sidebar

### 📅 **Smart Timetable**
- Week view calendar
- AI-powered syllabus parsing
- Recurring event support
- Color-coded classes and exams
- Conflict detection

### ✅ **Task Management**
- Kanban-style board (To Do, In Progress, Done)
- Priority levels and due dates
- Drag-and-drop interface
- Quick task creation
- Advanced task editor

### 💬 **Community Features**
- Public community discovery
- Channel-based discussions (General, Announcements, Resources, Live)
- Real-time messaging
- File sharing
- Live video sessions (Jitsi integration)

### 🎨 **Modern UI/UX**
- Complete dark/light mode support
- Semantic color system
- Smooth animations and transitions
- Responsive design
- Premium gradients and effects

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vandae-v4
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key

# Optional: Analytics, etc.
```

4. **Run database migrations**

Go to your Supabase project → SQL Editor → Execute:
```bash
supabase/migrations/20250115_research_system.sql
```

5. **Start development server**
```bash
npm run dev
```

Navigate to `http://localhost:3000`

## 📖 Usage

### AI Assistant

1. Navigate to **AI Advisor** (`/ai-advisor`)
2. Use starter prompts or ask custom questions
3. View research suggestions in the sidebar
4. Click "Update Research" for latest sources

### Assignment Creation

1. Go to **Assignments** (`/assignments`)
2. Click **"New Assignment"**
3. Choose:
   - **Quick Add**: Simple task creation
   - **Open Editor**: Full-featured editor
4. Use AI assistance for writing
5. Access research sources from sidebar

### Research System

The research engine runs automatically:
- Extracts course units from uploaded syllabi
- Searches for relevant academic resources
- Updates incrementally as you use the app
- Appears in Research Hub sidebar

### Course Setup

1. Upload syllabi to **Resources** page
2. System extracts course units automatically
3. Research begins in background
4. View in AI Advisor sidebar

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Edge Functions

**AI & ML:**
- Google Gemini AI
- PDF parsing (pdf-parse)
- Markdown rendering

**UI Components:**
- Radix UI primitives
- shadcn/ui
- Custom components
- Lucide icons

### Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── actions/           # Server actions
│   │   └── research.ts    # Research engine
│   ├── api/               # API routes
│   │   └── ai-chat/       # AI chat endpoint
│   ├── assignments/       # Assignment pages
│   ├── ai-advisor/        # AI assistant page
│   └── ...
├── components/
│   ├── ai-advisor/        # AI components
│   │   ├── chat-interface.tsx
│   │   └── research-panel.tsx
│   ├── assignments/       # Assignment components
│   │   ├── assignment-editor.tsx
│   │   └── create-assignment-dialog.tsx
│   ├── ui/                # shadcn/ui components
│   └── ...
├── lib/                   # Utilities
│   ├── supabase-*.ts     # Supabase clients
│   └── utils.ts          # Helper functions
└── types/                # TypeScript types

supabase/
└── migrations/           # Database migrations
    └── 20250115_research_system.sql
```

## 🗄️ Database Schema

### Core Tables

**course_units**
- Stores extracted course modules and topics
- Links to user's courses
- Tracks completion status

**research_sources**
- Curated academic resources
- Relevance scoring
- Type categorization
- Links to course units

**tasks**
- Assignment tracking
- Status management
- Due dates and priorities

**communities**
- Student discussion groups
- Public/Private visibility
- Interest-based matching

## 🎨 Theme System

The app uses semantic color variables for perfect dark/light mode:

```css
/* Light Mode */
--background: White backgrounds
--foreground: Dark text
--muted: Subtle backgrounds
--border: UI borders

/* Dark Mode */
--background: Dark backgrounds
--foreground: Light text
--muted: Darker accents
--border: Subtle borders
```

All components use these variables automatically.

## 🔐 Security

- Row Level Security (RLS) on all tables
- Server-side authentication checks
- Protected API routes
- Secure file uploads
- XSS protection

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Manual Deployment

```bash
npm run build
npm start
```

## 📝 API Reference

### Research System

```typescript
// Extract course units from syllabi
await extractCourseUnits(userId: string)

// Research a specific unit
await researchUnit(unitId: string, query: string)

// Get all course units
await getCourseUnits(userId: string)

// Get research sources
await getResearchSources(userId: string, unitId?: string)

// Auto-research all units (background job)
await autoResearchAllUnits(userId: string)
```

### AI Chat

```typescript
POST /api/ai-chat
Body: {
  messages: Message[],
  userName: string
}
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Google for Gemini AI
- shadcn for beautiful UI components
- Vercel for hosting

## 💡 Future Enhancements

- [ ] Real-time collaboration on assignments
- [ ] Google Calendar integration
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Advanced analytics dashboard
- [ ] Peer study matching
- [ ] Gamification and achievements
- [ ] Integration with Learning Management Systems (LMS)

---

Made with ❤️ for students worldwide
