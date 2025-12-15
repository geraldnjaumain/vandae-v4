# 📚 Feature Documentation

## Complete Guide to Vadea's Advanced Features

---

## 🤖 AI Assistant

### Overview
The AI Assistant is your personal academic companion powered by Google Gemini AI. It provides context-aware help with your studies, assignments, and academic planning.

###Access
Navigate to **AI Advisor** (`/ai-advisor`)

### Features

#### **1. Full-Page Chat Interface**
- **Modern Design**: Gradient accents, smooth animations
- **Conversation History**: All messages persist during session
- **Starter Prompts**: Quick-start suggestions for common tasks
- **Markdown Support**: Formatted responses with code blocks, lists, etc.
- **Timestamps**: Track when each message was sent

#### **2. Research Hub Sidebar**
- **Course Units Tab**: View all extracted course modules and topics
- **Sources Tab**: Browse curated academic resources
- **Search Functionality**: Filter units or sources
- **Update Research**: Manually trigger research updates
- **Collapsible**: Hide sidebar for focused chat

#### **3. AI Capabilities**
- Study schedule planning
- Academic writing assistance
- Course concept explanations
- Exam preparation strategies
- Note-taking techniques
- Stress management advice

### Usage Examples

**Study Planning:**
```
User: "Plan my study schedule for this week"
AI: Creates personalized schedule based on your courses and deadlines
```

**Writing Help:**
```
User: "How do I write a strong thesis statement?"
AI: Provides step-by-step guidance with examples
```

**Concept Explanation:**
```
User: "Explain the Feynman technique"
AI: Detailed explanation with practical tips
```

---

## ✍️ Assignment Editor

### Overview
A full-featured rich text editor designed specifically for academic writing, with integrated AI assistance and research capabilities.

### Access
**Assignments** → **New Assignment** → **Open Editor**

### Features

#### **1. Rich Text Editing**
- **Markdown Support**: Write with familiar syntax
- **Formatting Toolbar**:
  - Bold, Italic
  - Headers (H1, H2)
  - Lists (Ordered, Unordered)
  - Quotes
  - Code blocks
  - Links and images

#### **2. AI Writing Assistant**
Click the AI buttons at the bottom for:
- **Improve**: Enhance your writing quality
- **Check Grammar**: Find and fix errors
- **Generate Outline**: Create structure from topic

#### **3. Research Integration**
- **Toggle Research Panel**: Access sources while writing
- **Quick Search**: Find relevant materials
- **One-Click Citations**: Add references easily

#### **4. Smart Features**
- **Word Counter**: Track progress in real-time
- **Auto-Save**: Never lose your work (coming soon)
- **Full-Screen Mode**: Distraction-free writing
- **Keyboard Shortcuts**: Efficient formatting

### Workflow

1. **Create Assignment**
   ```
   Assignments → New Assignment
   Enter title and details
   Choose "Open Editor"
   ```

2. **Write Content**
   ```
   Use formatting toolbar
   Write in markdown
   Check word count
   ```

3. **Get AI Help**
   ```
   Select text
   Click "Improve"
   Review suggestions
   Accept or modify
   ```

4. **Add Research**
   ```
   Toggle Research panel
   Search for sources  Click to open
   Cite in your work
   ```

5. **Save**
   ```
   Click "Save" button
   Assignment added to board
   ```

---

## 🔬 Research Engine

### Overview
A background system that continuously discovers and curates academic resources based on your courses.

### How It Works

#### **Phase 1: Course Extraction**
```
User uploads syllabus → AI extracts units → Topics identified
```

#### **Phase 2: Source Discovery**
```
For each unit → Search online → Find articles, videos, papers
```

#### **Phase 3: Relevance Ranking**
```
Score sources → Filter by quality → Present best matches
```

### Features

#### **1. Course Units**
- **Auto-Extraction**: Pulls from uploaded syllabi
- **Topic Breakdown**: Identifies sub-topics per unit
- **Completion Tracking**: Mark units as done
- **Course Grouping**: Organized by class

#### **2. Research Sources**
- **Type Categories**:
  - 📘 Articles: Blog posts, tutorials
  - 🎥 Videos: Lectures, tutorials
  - 📚 Books: Textbooks, references
  - 📄 Papers: Academic research

- **Metadata**:
  - Title and snippet
  - Relevance score
  - Source URL
  - Publication type

#### **3. Continuous Updates**
- Runs incrementally as you use the app
- New sources added weekly
- Improves with usage
- No manual intervention needed

### Data Structure

```typescript
CourseUnit {
  id: UUID
  title: "Introduction to Algorithms"
  topics: ["Big O", "Sorting", "Searching"]
  course_name: "CS 101"
  completed: false
}

ResearchSource {
  id: UUID
  title: "Understanding Big O Notation"
  url: "https://example.com/big-o"
  snippet: "Comprehensive guide..."
  type: "article"
  relevance_score: 0.95
  unit_id: UUID (linked to unit)
}
```

### Best Practices

1. **Upload Quality Syllabi**
   - Clear section headings
   - Structured topic lists
   - PDF format preferred

2. **Regular Updates**
   - Click "Update Research" weekly
   - Review new sources
   - Mark favorites

3. **Integration**
   - Use during assignment writing
   - Reference in study sessions
   - Share with study groups

---

## 📋 Task Management

### Overview
Kanban-style board for tracking assignments and deadlines with visual workflow management.

### Board Structure

```
┌─────────────┬──────────────┬─────────────┐
│   To Do     │ In Progress  │    Done     │
├─────────────┼──────────────┼─────────────┤
│  New tasks  │ Active work  │ Completed   │
│             │              │             │
└─────────────┴──────────────┴─────────────┘
```

### Task Properties

- **Title**: Assignment name
- **Description**: Details and requirements
- **Due Date**: Deadline tracker
- **Priority**: High, Medium, Low
- **Status**: To Do, In Progress, Done
- **Notes**: Additional information

### Quick Actions

- **Drag & Drop**: Move between columns
- **Quick Add**: Create simple tasks
- **Full Editor**: Rich assignments
- **Bulk Actions**: Multi-select and move

---

## 🎨 Dark Mode

### Overview
Complete theme system with semantic colors that adapt to light/dark preferences.

### Features

- **System Integration**: Follows OS preference
- **Manual Toggle**: Settings → Appearance
- **Three Modes**:
  - 🌞 Light
  - 🌙 Dark
  - 💻 System (Auto)

### Color System

```css
/* Semantic Variables */
--background: Main page background
--foreground: Primary text color
--card: Card backgrounds
--muted: Subtle backgrounds
--accent: Interactive elements
--border: All UI borders
```

### Benefits

- **Eye Comfort**: Reduced strain in low light
- **Battery Saving**: On OLED screens
- **Focus Mode**: Less distracting
- **Accessibility**: Better contrast options

---

## 🔄 Keyboard Shortcuts

Coming in next update:

```
Cmd/Ctrl + K: Open command palette
Cmd/Ctrl + N: New assignment
Cmd/Ctrl + B: Bold text
Cmd/Ctrl + I: Italic text
Cmd/Ctrl + /: Toggle AI assistant
Esc: Close modals
```

---

## 📊 Analytics & Insights

Future feature to track:
- Study time per course
- Assignment completion rate
- AI usage statistics
- Research source effectiveness
- Productivity trends

---

## 🔧 Troubleshooting

### AI Assistant Not Responding
1. Check GEMINI_API_KEY in .env.local
2. Verify API quota
3. Check browser console for errors

### Research Not Updating
1. Upload course materials first
2. Wait for background extraction
3. Manually click "Update Research"

### Dark Mode Issues
1. Clear browser cache
2. Toggle theme in Settings
3. Refresh page

---

## 💡 Pro Tips

1. **Upload Syllabi Early**: Better research results
2. **Use AI for Outlines**: Start assignments faster
3. **Review Research Weekly**: Stay updated
4. **Tag Important Sources**: Mark favorites
5. **Customize Priorities**: Focus on what matters
6. **Export Work**: Save drafts externally

---

## 🚀 Coming Soon

- [ ] LaTeX equation support
- [ ] Bibliography management
- [ ] Plagiarism checking
- [ ] Voice-to-text
- [ ] Collaborative editing
- [ ] Mobile app
- [ ] Offline mode
- [ ] Custom AI personalities

---

For questions or feedback, open an issue on GitHub.
