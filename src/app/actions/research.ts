"use server"

import { createClient } from "@/lib/supabase-server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return null
    return new GoogleGenerativeAI(apiKey)
}

export interface CourseUnit {
    id: string
    title: string
    topics: string[]
    course_name: string
    completed: boolean
    user_id: string
    created_at: string
}

export interface ResearchSource {
    id: string
    title: string
    url: string
    snippet: string
    type: 'article' | 'video' | 'book' | 'paper'
    relevance_score: number
    user_id: string
    unit_id?: string
    created_at: string
}

/**
 * Extract course units from user's syllabus and course materials
 */
export async function extractCourseUnits(userId: string) {
    try {
        const supabase = await createClient()

        // Get user's uploaded resources (syllabi, course materials)
        const { data: resources } = await supabase
            .from('resources')
            .select('id, title, file_type, file_url')
            .eq('user_id', userId)
            .in('file_type', ['pdf', 'doc', 'docx'])
            .limit(10)

        if (!resources || resources.length === 0) {
            return { units: [], message: "No course materials found. Upload syllabi to get started." }
        }

        // For now, create sample units
        // In production, you would:
        // 1. Download and parse PDF content
        // 2. Use AI to extract units and topics
        // 3. Store in database

        const sampleUnits: Partial<CourseUnit>[] = [
            {
                title: "Introduction to Data Structures",
                topics: ["Arrays", "Linked Lists", "Stacks", "Queues"],
                course_name: "CS 101",
                completed: false,
                user_id: userId
            },
            {
                title: "Algorithm Analysis",
                topics: ["Big O Notation", "Time Complexity", "Space Complexity"],
                course_name: "CS 101",
                completed: false,
                user_id: userId
            }
        ]

        // Store units in database
        const { data: insertedUnits, error } = await supabase
            .from('course_units')
            .upsert(sampleUnits as any, { onConflict: 'title,user_id' })
            .select()

        if (error) throw error

        return { units: insertedUnits || [], message: "Course units extracted successfully!" }
    } catch (error: any) {
        console.error('Error extracting course units:', error)
        return { units: [], error: error.message }
    }
}

/**
 * Research online sources for a specific unit or topic
 */
export async function researchUnit(unitId: string, query: string) {
    try {
        const supabase = await createClient()

        // Get unit details
        const { data: unit } = await supabase
            .from('course_units')
            .select('*')
            .eq('id', unitId)
            .single()

        if (!unit) throw new Error("Unit not found")

        // Use AI to generate relevant search queries
        const genAI = getGenAI()
        if (!genAI) {
            return { sources: [], error: "Gemini API Key is missing. Please configure it in your environment." }
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `
            Generate 3 relevant search queries for finding educational content about:
            Topic: ${query || unit.title}
            Related Topics: ${unit.topics.join(', ')}
            
            Return ONLY a JSON array of strings (search queries).
            Example: ["query 1", "query 2", "query 3"]
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        let jsonStr = response.text().trim()

        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7)
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3)
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3)

        const queries = JSON.parse(jsonStr)

        // Mock research results (in production, integrate with Google Custom Search API)
        const mockSources: Partial<ResearchSource>[] = [
            {
                title: `Complete Guide to ${unit.title}`,
                url: `https://example.com/${unit.title.toLowerCase().replace(/\s+/g, '-')}`,
                snippet: `Comprehensive coverage of ${unit.title} including ${unit.topics.slice(0, 2).join(' and ')}...`,
                type: 'article',
                relevance_score: 0.95,
                user_id: unit.user_id,
                unit_id: unitId
            },
            {
                title: `${unit.title} - Video Tutorial Series`,
                url: "https://youtube.com/example",
                snippet: "Step-by-step video tutorials covering all key concepts...",
                type: 'video',
                relevance_score: 0.88,
                user_id: unit.user_id,
                unit_id: unitId
            },
            {
                title: `Academic Paper: ${unit.topics[0]} Analysis`,
                url: "https://scholar.google.com/example",
                snippet: "Research paper discussing theoretical foundations and practical applications...",
                type: 'paper',
                relevance_score: 0.82,
                user_id: unit.user_id,
                unit_id: unitId
            }
        ]

        // Store research sources
        const { data: sources, error } = await supabase
            .from('research_sources')
            .upsert(mockSources as any, { onConflict: 'url,user_id' })
            .select()

        if (error) throw error

        return { sources: sources || [], queries }
    } catch (error: any) {
        console.error('Error researching unit:', error)
        return { sources: [], error: error.message }
    }
}

/**
 * Get all course units for a user
 */
export async function getCourseUnits(userId: string) {
    try {
        const supabase = await createClient()

        const { data: units, error } = await supabase
            .from('course_units')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return { units: units || [] }
    } catch (error: any) {
        console.error('Error getting course units:', error)
        return { units: [], error: error.message }
    }
}

/**
 * Get research sources for a user (optionally filtered by unit)
 */
export async function getResearchSources(userId: string, unitId?: string) {
    try {
        const supabase = await createClient()

        let query = supabase
            .from('research_sources')
            .select('*')
            .eq('user_id', userId)
            .order('relevance_score', { ascending: false })

        if (unitId) {
            query = query.eq('unit_id', unitId)
        }

        const { data: sources, error } = await query.limit(20)

        if (error) throw error

        return { sources: sources || [] }
    } catch (error: any) {
        console.error('Error getting research sources:', error)
        return { sources: [], error: error.message }
    }
}

/**
 * Background job: Auto-research all units (run periodically)
 */
export async function autoResearchAllUnits(userId: string) {
    try {
        const { units } = await getCourseUnits(userId)

        if (units.length === 0) {
            // Try to extract units first
            await extractCourseUnits(userId)
        }

        // Research each unit
        for (const unit of units) {
            await researchUnit(unit.id, unit.title)
        }

        return { success: true, unitsResearched: units.length }
    } catch (error: any) {
        console.error('Error in auto-research:', error)
        return { success: false, error: error.message }
    }
}
