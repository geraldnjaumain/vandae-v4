# Vadae Syllabus Parser - AI-Powered Feature

## ✅ Complete

An **AI-powered syllabus parser** that extracts assignment deadlines and exam dates from PDF files using OpenAI's GPT-4.

---

## 🎯 **Overview**

**Feature**: Upload a PDF syllabus → AI extracts dates → Auto-populate calendar

**Technology Stack:**
- ✅ **PDF Parsing**: `pdf-parse` library
- ✅ **AI Extraction**: OpenAI GPT-4o-mini
- ✅ **File Handling**: Next.js Server Actions
- ✅ **UI**: Drag-and-drop modal with Shadcn/UI
- ✅ **Notifications**: Sonner toasts

---

## 📁 **Files Created**

| File | Purpose |
|------|---------|
| `src/app/actions/syllabus.ts` | Server action for PDF → AI → Database |
| `src/components/dashboard/upload-syllabus-modal.tsx` | Upload modal with drag-drop |
| `src/app/layout.tsx` | Updated with Toaster component |

---

## 🔄 **Flow Diagram**

```
1. User clicks "Upload Syllabus" button
   ↓
2. Modal opens with drag-and-drop zone
   ↓
3. User selects/drops PDF file
   ↓
4. Client validates file (type, size)
   ↓
5. FormData sent to server action
   ↓
6. Server Action (parseSyllabus):
   ├─ Validate authentication
   ├─ Extract text from PDF
   ├─ Send text to OpenAI API
   ├─ Parse JSON response
   └─ Insert events into timetables table
   ↓
7. Success toast: "Syllabus imported! 12 events added"
   ↓
8. Page refreshes to show new calendar events
```

---

## 🤖 **AI Prompt Engineering**

### **System Prompt:**
```
You are a helpful assistant that extracts assignment deadlines, 
exam dates, and important class events from syllabus text.

Extract all dates and events. For each event, determine:
1. title/name
2. date in ISO 8601 format (YYYY-MM-DD)
3. type: "exam", "assignment", or "class"
4. optional description

Return ONLY a valid JSON array.
```

### **User Prompt:**
```
Extract all assignment deadlines, exam dates, and class events 
from this syllabus:

[PDF TEXT HERE - limited to 12,000 characters]
```

### **Expected JSON Response:**
```json
[
  {
    "title": "Midterm Exam",
    "date": "2025-03-15",
    "type": "exam",
    "description": "Chapters 1-5"
  },
  {
    "title": "Assignment 1: Literature Review",
    "date": "2025-02-10",
    "type": "assignment"
  }
]
```

---

## 📄 **PDF Text Extraction**

```typescript
// Convert File to Buffer
const arrayBuffer = await file.arrayBuffer()
const buffer = Buffer.from(arrayBuffer)

// Extract text with pdf-parse
const pdfParse = (await import('pdf-parse')).default
const pdfData = await pdfParse(buffer)
const pdfText = pdfData.text
```

---

## 🎨 **Upload Modal Features**

### **Drag-and-Drop Zone**
```typescript
✅ Drag enter/over/leave detection
✅ Visual feedback (border highlight)
✅ Click to open file browser
✅ File type validation (PDF only)
✅ File size limit (10MB)
```

### **File Display**
```typescript
Before selection:
┌───────────────────┐
│   📤 Upload      │
│   Drop PDF here  │
│   or click       │
└───────────────────┘

After selection:
┌───────────────────┐
│   📄 File Icon   │
│   syllabus.pdf   │
│   2.3 MB         │
│   [Remove]       │
└───────────────────┘
```

### **UI States**
- **Idle**: Ready for upload
- **File Selected**: Shows file info + Remove button
- **Uploading**: Loading spinner + "Processing..."
- **Success**: Toast notification → Page refresh
- **Error**: Toast with error message

---

## 💾 **Database Integration**

### **Timetable Entry Creation**
```typescript
For each extracted event:
  - title: From AI response
  - start_time: Date + default time based on type
  - end_time: start_time + duration
  - location: "Online Submission" (assignment) or "TBA"
  - color: Red (exam), Orange (assignment), Blue (class)
  - notes: Description from AI or "Imported from syllabus"
```

### **Default Times by Type:**
| Type | Start Time | End Time | Duration |
|------|------------|----------|----------|
| **Exam** | 9:00 AM | 11:00 AM | 2 hours |
| **Assignment** | 11:59 PM | 11:59 PM | Due at EOD |
| **Class** | 10:00 AM | 11:30 AM | 1.5 hours |

### **Color Coding:**
- 🔴 **Exam**: `#ef4444` (Red)
- 🟠 **Assignment**: `#f59e0b` (Orange)
- 🔵 **Class**: `#3b82f6` (Blue)

---

## ✅ **Validation & Error Handling**

### **Client-Side Validation**
```typescript
✅ File type: Must be "application/pdf"
✅ File size: Max 10MB
✅ File existence: Must select a file
```

### **Server-Side Validation**
```typescript
✅ Authentication: User must be logged in
✅ PDF parsing: Handle corrupted/image-based PDFs
✅ Text extraction: Check if text is not empty
✅ AI response: Validate JSON structure
✅ Database insert: Handle insert failures
```

### **Error Messages**
| Error Type | Message |
|------------|---------|
| **No file** | "No file provided" |
| **Wrong type** | "Only PDF files are supported" |
| **Too large** | "File size must be less than 10MB" |
| **Not logged in** | "You must be logged in..." |
| **Empty PDF** | "Could not extract text from PDF..." |
| **��I failure** | "Failed to analyze syllabus..." |
| **No dates** | "No dates found in syllabus..." |
| **DB error** | "Failed to save events to calendar..." |

---

## 🎨 **Toast Notifications**

### **Success Toast:**
```typescript
toast.success(
  `Syllabus imported! ${count} events added to your calendar.`,
  {
    description: "Check your timetable to see the new events",
    duration: 5000,
  }
)
```

### **Error Toast:**
```typescript
toast.error("Failed to parse syllabus. Please try again.")
```

---

## 🚀 **Usage Example**

### **In Dashboard:**
```tsx
import { UploadSyllabusModal } from "@/components/dashboard/upload-syllabus-modal"

<UploadSyllabusModal 
  trigger={
    <Button>
      <Upload className="mr-2 h-4 w-4" />
      Upload Syllabus
    </Button>
  }
/>
```

### **With Custom Trigger:**
```tsx
<UploadSyllabusModal 
  trigger={<Button variant="outline">Import</Button>}
/>
```

---

## 📊 **AI Model Configuration**

```typescript
model: 'gpt-4o-mini'          // Cost-effective, fast
response_format: json_object   // Structured output
temperature: 0.3               // Low variance (consistent)
max_tokens: ~12,000 chars      // Input limit
```

**Why GPT-4o-mini?**
- ✅ Cost-effective ($0.15 per 1M input tokens)
- ✅ Fast response times
- ✅ Excellent at structured extraction
- ✅ JSON mode support

---

## 🔐 **Security Considerations**

### **Authentication:**
```typescript
const { data: { user }, error } = await supabase.auth.getUser()
if (!user) return { error: 'Must be logged in' }
```

### **File Validation:**
- Type checking (PDF only)
- Size limits (10MB max)
- Buffer sanitization

### **RLS Protection:**
- Events inserted with authenticated `user_id`
- Only user can see their own timetable entries

---

## 💰 **Cost Estimation**

**Assumptions:**
- Average syllabus: 5,000 characters
- GPT-4o-mini pricing: $0.15/1M input tokens, $0.60/1M output tokens
- ~1,250 tokens input, ~200 tokens output per syllabus

**Cost per upload:**
- Input: $0.000188
- Output: $0.00012
- **Total: ~$0.0003 per syllabus** (30 cents per 1,000 uploads)

---

## 🎯 **Feature Highlights**

### **Pro Feature Badge:**
```tsx
<Sparkles className="h-5 w-5 text-yellow-500" />
Upload Syllabus (Pro Feature)
```

### **Info Box:**
```
✨ AI-Powered Extraction
Our AI will automatically identify assignment deadlines,
exam dates, and important class events from your syllabus.
```

---

## 🔧 **Environment Setup**

### **Required Environment Variable:**
```.env.local
OPENAI_API_KEY=sk-...
```

### **Dependencies:**
```json
{
  "pdf-parse": "^1.1.1",
  "openai": "^4.x",
  "sonner": "^1.x"
}
```

---

## 📈 **Future Enhancements**

### **Potential Improvements:**
1. **OCR Support**: Handle image-based PDFs
2. **Recurring Events**: Detect "every Monday" patterns
3. **Location Extraction**: Parse room numbers
4. **Office Hours**: Extract professor availability
5. **Batch Upload**: Multiple syllabi at once
6. **Edit Before Import**: Preview + modify events
7. **Template Learning**: Improve accuracy per university
8. **Multi-file Support**: Word docs, images, etc.

---

## ✅ **Testing Checklist**

**Basic Flow:**
- ✅ Upload valid PDF
- ✅ See success toast
- ✅ Events appear in calendar

**Error Handling:**
- ✅ Upload non-PDF file
- ✅ Upload oversized file
- ✅ Upload empty PDF
- ✅ Upload corrupted PDF
- ✅ Upload without login

**Edge Cases:**
- ✅ PDF with no dates
- ✅ PDF with ambiguous dates
- ✅ PDF with only text (no events)

---

## 🎊 **Status: Production Ready**

**All requirements met:**
- ✅ PDF text extraction
- ✅ OpenAI integration
- ✅ Drag-and-drop UI
- ✅ Server action architecture
- ✅ Error handling
- ✅ Toast notifications
- ✅ Database insertion
- ✅ Authentication checks
- ✅ Type safety

**The syllabus parser is ready to extract events from student PDFs!** 🎓

---

**Created:** 2025-12-14  
**Version:** 1.0  
**Type:** Pro Feature
**AI Model:** GPT-4o-mini
