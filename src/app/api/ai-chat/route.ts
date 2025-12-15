import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
    try {
        const { messages, userName } = await request.json()

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: 'No messages provided' },
                { status: 400 }
            )
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey || apiKey === 'your-gemini-key') {
            return NextResponse.json(
                { error: 'AI service not configured. Please add GEMINI_API_KEY to .env.local' },
                { status: 500 }
            )
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        // Fetch User Context
        let userContextString = ""
        try {
            const { createClient } = await import('@/lib/supabase-server')
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Fetch Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('major, university, interests')
                    .eq('id', user.id)
                    .single()

                // Fetch Recent Tasks (to infer courses/topics)
                const { data: tasks } = await supabase
                    .from('tasks')
                    .select('title, category, description, due_date')
                    .eq('user_id', user.id)
                    .eq('status', 'in_progress') // Focus on active work
                    .limit(10)

                userContextString = `
STUDENT CONTEXT:
${profile ? `- Major: ${profile.major || 'Undeclared'}
- University: ${profile.university || 'Unknown'}
- Interests: ${Array.isArray(profile.interests) ? profile.interests.join(', ') : profile.interests || 'None'}` : ''}

CURRENT ASSIGNMENTS/COURSES:
${tasks?.length ? tasks.map((t: any) => `- ${t.title} (Category: ${t.category || 'General'}) [Due: ${t.due_date || 'No date'}]`).join('\n') : 'No active assignments found.'}
`
            }
        } catch (err) {
            console.error("Failed to fetch user context:", err)
            // Continue without context if fetch fails
        }

        // Build conversation history
        const conversationHistory = messages.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }))

        // System context
        const systemContext = `You are Vadea AI, an intelligent academic assistant helping ${userName}. 
You specialize in:
- Study planning and time management
- Academic writing and research
- Course material explanation
- Exam preparation strategies
- Note-taking techniques
- Stress management for students

${userContextString}

CRITICAL INSTRUCTION:
The student wants you to specifically help with their COURSES. 
If they ask about a topic, cross-reference their "Current Assignments" and "Major" to provide highly relevant, specific resources.
- If they are working on a specific assignment, suggest relevant academic papers, crash course videos, or key concepts they should research.
- RESEARCH: When asked to research a unit or topic, provide a structured breakdown of key concepts and list 3-5 specific, high-quality resources (books, websites, tools) that would help them.
- Be proactive: if they mention a vague topic, connect it to their major or known assignments if possible.

Provide helpful, concise, and actionable advice. Use markdown formatting for better readability.
Be encouraging and supportive while maintaining professionalism.`

        // Create chat with history
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemContext }]
                },
                {
                    role: 'model',
                    parts: [{ text: `Hello ${userName}! I'm Vadea AI, your personal academic assistant. I'm here to help you succeed in your studies. How can I assist you today?` }]
                },
                ...conversationHistory.slice(0, -1) // Exclude last message (it will be sent separately)
            ]
        })

        // Send the latest user message
        const lastMessage = messages[messages.length - 1]
        const result = await chat.sendMessage(lastMessage.content)
        const response = await result.response
        const text = response.text()

        return NextResponse.json({
            response: text,
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error('AI Chat Error:', error)

        // Handle specific errors
        if (error.message?.includes('API_KEY')) {
            return NextResponse.json(
                { error: 'AI service authentication failed' },
                { status: 500 }
            )
        }

        if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            return NextResponse.json(
                { error: 'AI service temporarily unavailable. Please try again in a moment.' },
                { status: 429 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to process your request', details: error.message },
            { status: 500 }
        )
    }
}


