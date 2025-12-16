"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase-server"
import { createCardsBulk } from "./flashcards"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// ===========================================
// TYPES
// ===========================================

export type GeneratedFlashcard = {
    front: string
    back: string
    tags?: string[]
}

// ===========================================
// AI FLASHCARD GENERATION
// ===========================================

/**
 * Generate flashcards from text content using AI
 */
export async function generateFlashcardsFromText(
    text: string,
    options?: {
        count?: number
        deckId?: string
        topic?: string
    }
): Promise<{ data?: GeneratedFlashcard[]; error?: string }> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

        const count = options?.count || 10
        const topic = options?.topic || "the provided content"

        const prompt = `You are an expert flashcard creator. Analyze the following text and create ${count} high-quality flashcards for effective studying.

RULES:
1. Create clear, concise questions on the front
2. Provide comprehensive but focused answers on the back
3. Focus on key concepts, definitions, and relationships
4. Use the Feynman technique - explain as if teaching someone
5. Include examples or context when helpful
6. Avoid yes/no questions - use "What", "How", "Why"
7. Return ONLY valid JSON array format

TEXT TO ANALYZE:
${text}

Return a JSON array in this EXACT format:
[
  {
    "front": "Question here?",
    "back": "Detailed answer here with explanations and examples.",
    "tags": ["tag1", "tag2"]
  }
]

Generate ${count} flashcards now:`

        const result = await model.generateContent(prompt)
        const response = result.response.text()

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = response.trim()
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "")
        }

        const flashcards = JSON.parse(jsonText) as GeneratedFlashcard[]

        // If deckId provided, automatically create cards
        if (options?.deckId && flashcards.length > 0) {
            await createCardsBulk(options.deckId, flashcards)
        }

        return { data: flashcards }
    } catch (error) {
        console.error("Error generating flashcards from text:", error)
        return {
            error: error instanceof Error ? error.message : "Failed to generate flashcards",
        }
    }
}

/**
 * Generate flashcards from PDF file
 */
export async function generateFlashcardsFromPDF(
    fileUrl: string,
    options?: {
        count?: number
        deckId?: string
    }
): Promise<{ data?: GeneratedFlashcard[]; error?: string }> {
    try {
        const supabase = await createClient()

        // Download PDF from Supabase storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from("resources")
            .download(fileUrl)

        if (downloadError || !fileData) {
            return { error: "Failed to download PDF" }
        }

        // Convert blob to buffer
        const buffer = Buffer.from(await fileData.arrayBuffer())

        // Parse PDF - pdf-parse is a CommonJS module, use dynamic import
        const pdfParse = await import("pdf-parse")
        const pdfData = await (pdfParse as any)(buffer)
        const text = pdfData.text

        if (!text || text.trim().length === 0) {
            return { error: "No text content found in PDF" }
        }

        // Generate flashcards from extracted text
        return await generateFlashcardsFromText(text, options)
    } catch (error) {
        console.error("Error generating flashcards from PDF:", error)
        return {
            error: error instanceof Error ? error.message : "Failed to process PDF",
        }
    }
}

/**
 * Improve an existing flashcard using AI
 */
export async function improveCard(
    cardId: string
): Promise<{ data?: { front: string; back: string }; error?: string }> {
    try {
        const supabase = await createClient()

        // Get current card
        const { data: card, error: cardError } = await supabase
            .from("flashcards")
            .select("front, back")
            .eq("id", cardId)
            .single()

        if (cardError || !card) {
            return { error: "Card not found" }
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

        const prompt = `You are an expert flashcard educator. Improve this flashcard for better learning outcomes.

CURRENT FLASHCARD:
Front: ${card.front}
Back: ${card.back}

IMPROVEMENT GUIDELINES:
1. Make the question more specific and testable
2. Ensure the answer is clear and comprehensive
3. Add examples or mnemonics if helpful
4. Remove ambiguity
5. Optimize for active recall

Return ONLY a JSON object in this format:
{
  "front": "Improved question",
  "back": "Improved answer with better explanation"
}

Improve the flashcard now:`

        const result = await model.generateContent(prompt)
        const response = result.response.text()

        let jsonText = response.trim()
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "")
        }

        const improved = JSON.parse(jsonText) as { front: string; back: string }

        return { data: improved }
    } catch (error) {
        console.error("Error improving card:", error)
        return {
            error: error instanceof Error ? error.message : "Failed to improve card",
        }
    }
}

/**
 * Generate cloze deletion flashcards from text
 */
export async function generateClozeCards(
    text: string,
    options?: {
        count?: number
        deckId?: string
    }
): Promise<{ data?: GeneratedFlashcard[]; error?: string }> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

        const count = options?.count || 5

        const prompt = `Create ${count} cloze deletion flashcards from this text. Cloze deletions test knowledge by hiding key terms.

TEXT:
${text}

RULES:
1. Identify the most important terms, dates, or concepts
2. Create a sentence with [...] replacing the key term
3. The answer should be the hidden term plus brief context
4. Make deletions that test understanding, not just memorization

Return ONLY a JSON array:
[
  {
    "front": "The [...] was signed in 1776.",
    "back": "Declaration of Independence - This document declared American independence from Britain.",
    "tags": ["history", "american-revolution"]
  }
]

Generate ${count} cloze flashcards now:`

        const result = await model.generateContent(prompt)
        const response = result.response.text()

        let jsonText = response.trim()
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "")
        }

        const flashcards = JSON.parse(jsonText) as GeneratedFlashcard[]

        // If deckId provided, automatically create cards
        if (options?.deckId && flashcards.length > 0) {
            await createCardsBulk(options.deckId, flashcards)
        }

        return { data: flashcards }
    } catch (error) {
        console.error("Error generating cloze cards:", error)
        return {
            error: error instanceof Error ? error.message : "Failed to generate cloze cards",
        }
    }
}

/**
 * Generate flashcards from uploaded course notes
 */
export async function generateFlashcardsFromResource(
    resourceId: string,
    options?: {
        count?: number
        deckId?: string
    }
): Promise<{ data?: GeneratedFlashcard[]; error?: string }> {
    try {
        const supabase = await createClient()

        // Get resource
        const { data: resource, error: resourceError } = await supabase
            .from("resources")
            .select("file_url, file_type, title")
            .eq("id", resourceId)
            .single()

        if (resourceError || !resource) {
            return { error: "Resource not found" }
        }

        // Handle based on file type
        if (resource.file_type === "pdf") {
            return await generateFlashcardsFromPDF(resource.file_url, options)
        } else {
            return { error: "Unsupported file type. Currently only PDF is supported." }
        }
    } catch (error) {
        console.error("Error generating flashcards from resource:", error)
        return {
            error: error instanceof Error ? error.message : "Failed to process resource",
        }
    }
}

/**
 * Generate flashcards from course units (integration with research system)
 */
export async function generateFlashcardsFromCourseUnit(
    unitId: string,
    options?: {
        count?: number
        deckId?: string
    }
): Promise<{ data?: GeneratedFlashcard[]; error?: string }> {
    try {
        const supabase = await createClient()

        // Get course unit
        const { data: unit, error: unitError } = await supabase
            .from("course_units")
            .select("title, topics, description")
            .eq("id", unitId)
            .single()

        if (unitError || !unit) {
            return { error: "Course unit not found" }
        }

        // Get research sources for context
        const { data: sources } = await supabase
            .from("research_sources")
            .select("title, snippet")
            .eq("unit_id", unitId)
            .limit(5)

        // Build context from unit and sources
        let context = `Course Unit: ${unit.title}\n\n`
        if (unit.description) {
            context += `Description: ${unit.description}\n\n`
        }
        if (unit.topics && unit.topics.length > 0) {
            context += `Topics: ${unit.topics.join(", ")}\n\n`
        }
        if (sources && sources.length > 0) {
            context += "Research Context:\n"
            sources.forEach((source) => {
                context += `- ${source.title}: ${source.snippet}\n`
            })
        }

        // Generate flashcards
        return await generateFlashcardsFromText(context, {
            ...options,
            topic: unit.title,
        })
    } catch (error) {
        console.error("Error generating flashcards from course unit:", error)
        return {
            error: error instanceof Error ? error.message : "Failed to generate flashcards",
        }
    }
}
