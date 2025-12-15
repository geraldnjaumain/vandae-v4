"use server"

import { createClient } from '@/lib/supabase-server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

interface ExtractedEvent {
    title: string
    date: string // ISO string
    type: 'exam' | 'assignment' | 'class'
    description?: string
}

export async function parseSyllabus(formData: FormData) {
    try {
        const file = formData.get('file') as File
        if (!file) {
            return { error: 'No file provided' }
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            return { error: 'Only PDF files are supported' }
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return { error: 'File size must be less than 10MB' }
        }

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { error: 'You must be logged in to upload a syllabus' }
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Extract text from PDF
        let pdfText: string
        try {
            const pdfParseModule = await import('pdf-parse')
            const pdfParse = (pdfParseModule as any).default || pdfParseModule
            const pdfData = await pdfParse(buffer)
            pdfText = pdfData.text

            if (!pdfText || pdfText.trim().length === 0) {
                return { error: 'Could not extract text from PDF. The file may be empty or image-based.' }
            }
        } catch (pdfError) {
            console.error('PDF parsing error:', pdfError)
            return { error: 'Failed to read PDF file. Please ensure the file is not corrupted.' }
        }

        // Use OpenAI to extract structured data
        let extractedEvents: ExtractedEvent[]
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful assistant that extracts assignment deadlines, exam dates, and important class events from syllabus text.

Extract all dates and events from the provided syllabus text. For each event, determine:
1. The title/name of the event
2. The date in ISO 8601 format (YYYY-MM-DD). If only a day/month is given, assume the current academic year.
3. The type: "exam", "assignment", or "class" based on context
4. Optional description if available

Return ONLY a valid JSON array of objects. Each object must have: title, date, type, and optionally description.

Example response format:
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

If no dates are found, return an empty array: []`
                    },
                    {
                        role: 'user',
                        content: `Extract all assignment deadlines, exam dates, and class events from this syllabus:\n\n${pdfText.substring(0, 12000)}` // Limit to ~12k characters
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
            })

            const responseContent = completion.choices[0]?.message?.content
            if (!responseContent) {
                return { error: 'No response from AI. Please try again.' }
            }

            // Parse the JSON response
            const parsed = JSON.parse(responseContent)
            extractedEvents = Array.isArray(parsed) ? parsed : parsed.events || []

            if (extractedEvents.length === 0) {
                return { error: 'No dates found in syllabus. Please check if the file contains assignment or exam dates.' }
            }
        } catch (aiError: any) {
            console.error('OpenAI error:', aiError)
            if (aiError?.error?.code === 'insufficient_quota') {
                return { error: 'AI service quota exceeded. Please contact support.' }
            }
            return { error: 'Failed to analyze syllabus. Please try again.' }
        }

        // Insert events into timetables table
        const timetableEntries = extractedEvents.map(event => {
            const startDate = new Date(event.date)
            const endDate = new Date(startDate)

            // Set default times based on type
            if (event.type === 'exam') {
                startDate.setHours(9, 0, 0, 0) // 9 AM
                endDate.setHours(11, 0, 0, 0)  // 11 AM (2 hour exam)
            } else if (event.type === 'assignment') {
                startDate.setHours(23, 59, 0, 0) // Due at end of day
                endDate.setHours(23, 59, 0, 0)
            } else {
                startDate.setHours(10, 0, 0, 0) // 10 AM
                endDate.setHours(11, 30, 0, 0)  // 1.5 hour class
            }

            return {
                user_id: user.id,
                title: event.title,
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                location: event.type === 'assignment' ? 'Online Submission' : 'TBA',
                is_recurring: false,
                color: event.type === 'exam' ? '#ef4444' : event.type === 'assignment' ? '#f59e0b' : '#3b82f6',
                notes: event.description || `Imported from syllabus`,
            }
        })

        const { error: insertError } = await supabase
            .from('timetables')
            .insert(timetableEntries)

        if (insertError) {
            console.error('Database insert error:', insertError)
            return { error: 'Failed to save events to calendar. Please try again.' }
        }

        return {
            success: true,
            count: extractedEvents.length,
            events: extractedEvents
        }
    } catch (error: any) {
        console.error('Syllabus parsing error:', error)
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}
