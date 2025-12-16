"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export type ExtractedEvent = {
    title: string
    start_time: string
    end_time: string
    location?: string
    description?: string
    type: 'class' | 'exam' | 'assignment'
}

// Lazy load pdf-parse only when needed
async function parsePDF(buffer: Buffer): Promise<string> {
    try {
        // Dynamic import to avoid bundling issues
        const pdfParseModule = await import('pdf-parse')
        // @ts-ignore
        const pdfParse = pdfParseModule.default || pdfParseModule
        const data = await pdfParse(buffer)
        return data.text
    } catch (error: any) {
        console.error('PDF parsing error:', error)
        throw new Error('Failed to extract text from PDF. Please make sure the file is a valid PDF.')
    }
}

export async function parseSyllabusPDF(formData: FormData): Promise<ExtractedEvent[]> {
    try {
        const file = formData.get('file') as File
        if (!file) throw new Error("No file provided")

        // Validate file type
        if (!file.type.includes('pdf')) {
            throw new Error("Please upload a PDF file")
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 1. Extract Text from PDF
        const text = await parsePDF(buffer)

        if (!text || text.length < 50) {
            throw new Error("Could not extract meaningful text from PDF. The file might be empty or scanned.")
        }

        // 2. AI Analysis
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("AI Service is not configured. Please contact support.")
        }

        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" })
        const year = new Date().getFullYear()

        // Prompt Engineering
        const prompt = `
            You are a precise data extractor for academic syllabi. Extract schedule events from this syllabus text.
            Capture recurring classes, exams, and assignment due dates.
            
            Return ONLY a valid JSON array of objects. Do not include markdown code blocks or any other text.
            
            Format:
            [
                {
                    "title": "Course Name - Event Name",
                    "start_time": "YYYY-MM-DDTHH:mm:00",
                    "end_time": "YYYY-MM-DDTHH:mm:00",
                    "location": "Room number/building or null",
                    "description": "Additional details or null",
                    "type": "class" | "exam" | "assignment"
                }
            ]

            Context:
            - Current Year: ${year}
            - For recurring classes (e.g., "MWF 10:00 AM"), create ONE example event for the next occurrence.
            - For exams and assignments, use the specific dates mentioned.
            - Use 24-hour time format (HH:mm).
            - If location is not specified, use null.
            
            Syllabus Text:
            ${text.substring(0, 30000)}
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        let jsonStr = response.text().trim()

        // Cleanup JSON response
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7)
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3)
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3)
        jsonStr = jsonStr.trim()

        const events = JSON.parse(jsonStr)

        if (!Array.isArray(events) || events.length === 0) {
            throw new Error("No events could be extracted from the syllabus")
        }

        return events
    } catch (e: any) {
        console.error("Syllabus Parse Error:", e)
        throw new Error(e.message || "Failed to parse syllabus")
    }
}

export async function saveImportedEvents(events: ExtractedEvent[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Map to DB Schema
    const dbEvents = events.map(evt => ({
        user_id: user.id,
        title: evt.title,
        start_time: evt.start_time,
        end_time: evt.end_time,
        location: evt.location,
        notes: evt.description,
        color: evt.type === 'exam' ? 'bg-red-500' : evt.type === 'assignment' ? 'bg-orange-500' : 'bg-blue-500',
        is_recurring: false // Import as one-time events
    }))

    const { error } = await supabase.from('timetables').insert(dbEvents)
    if (error) throw new Error("Failed to save events to database")

    revalidatePath('/timetable')
    revalidatePath('/dashboard')

    return { success: true, count: dbEvents.length }
}
