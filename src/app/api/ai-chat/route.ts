import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { withCache, generateCacheKey } from '@/lib/ai-cache'

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

        // Fetch User Context INCLUDING COURSES
        let userContextString = ""
        let currentCourse: any = null
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

                // Fetch Courses with full analysis
                const { data: courses } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })

                // Fetch Recent Tasks (to infer current work)
                const { data: tasks } = await supabase
                    .from('tasks')
                    .select('title, category, description, due_date')
                    .eq('user_id', user.id)
                    .eq('status', 'in_progress')
                    .limit(10)

                // Build comprehensive course context
                let coursesContext = ""
                if (courses && courses.length > 0) {
                    currentCourse = courses[0] // Most recently updated course

                    coursesContext = courses.map((course: any) => {
                        let courseInfo = `\n📚 ${course.course_code}: ${course.course_name}
   Instructor: ${course.instructor || 'N/A'}
   Semester: ${course.semester || 'Current'}`

                        if (course.is_analyzed && course.units) {
                            const units = Array.isArray(course.units) ? course.units : []
                            courseInfo += `\n   Units: ${units.map((u: any) => u.title).join(', ')}`
                        }

                        if (course.study_suggestions) {
                            courseInfo += `\n   Study Approach: ${course.study_suggestions.slice(0, 100)}...`
                        }

                        return courseInfo
                    }).join('\n')
                }

                userContextString = `
STUDENT PROFILE:
${profile ? `- Major: ${profile.major || 'Undeclared'}
- University: ${profile.university || 'Unknown'}
- Interests: ${Array.isArray(profile.interests) ? profile.interests.join(', ') : profile.interests || 'None'}` : 'No profile data'}

ENROLLED COURSES:${coursesContext || '\nNo courses enrolled yet.'}

CURRENT ASSIGNMENTS/TASKS:
${tasks?.length ? tasks.map((t: any) => `- ${t.title} (${t.category || 'General'}) [Due: ${t.due_date || 'No date'}]`).join('\n') : 'No active assignments.'}
`
            }
        } catch (err) {
            console.error("Failed to fetch user context:", err)
        }

        // Enhanced system context with FULL COURSE KNOWLEDGE
        const systemContext = `You are Vadea AI, an intelligent academic assistant specialized in helping ${userName} succeed in their courses.

${userContextString}

${currentCourse && currentCourse.is_analyzed ? `
🎯 CURRENT FOCUS COURSE: ${currentCourse.course_code} - ${currentCourse.course_name}

COMPREHENSIVE COURSE KNOWLEDGE:
${currentCourse.ai_analysis ? JSON.parse(currentCourse.ai_analysis).overview : ''}

Course Units:
${currentCourse.units ? JSON.stringify(currentCourse.units, null, 2) : 'Not yet analyzed'}

Recommended Resources:
${currentCourse.resources ? JSON.stringify(currentCourse.resources, null, 2) : 'Not yet analyzed'}

Study Methodology: ${currentCourse.study_suggestions || 'Not yet analyzed'}

You have DEEP KNOWLEDGE of this course and can:
- Explain ANY concept from any unit in detail
- Recommend specific resources from the course material
- Create study plans for each unit
- Provide practice problems and examples relevant to the course
- Connect concepts across different units
- Offer exam preparation strategies specific to this course type
` : ''}

CORE CAPABILITIES:
- Study planning and time management
- Course material explanation with DEEP SUBJECT KNOWLEDGE
- Academic writing and research guidance
- Exam preparation strategies (CUSTOMIZED to course type)
- Note-taking techniques
- Stress management for students

INSTRUCTIONS:
1. When answering questions, ALWAYS reference specific course units, topics, or resources when relevant
2. If the student asks about a topic covered in their enrolled courses, provide IN-DEPTH explanations
3. Suggest SPECIFIC resources from the course resource list when applicable
4. Create ACTIONABLE study plans with concrete steps
5. Be encouraging, supportive, and professional

Use markdown formatting for better readability. Be concise but comprehensive.`

        // Generate cache key from messages (only user messages to avoid cache misses)
        const userMessages = messages.filter((m: any) => m.role === 'user')
        const cacheKey = generateCacheKey({
            messages: userMessages,
            userName
        })

        // Try cache first, then generate if not found
        const cachedResult = await withCache(
            {
                endpoint: 'ai-chat',
                ttlDays: 7 // Cache AI chat responses for 7 days
            },
            { messages: userMessages, userName },
            async () => {
                // Initialize model with system instruction
                const model = genAI.getGenerativeModel({
                    model: 'models/gemini-2.5-flash',
                    systemInstruction: systemContext
                })

                // Format history for Gemini
                const conversationHistory = messages.slice(0, -1).map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                }))

                // Create chat with clean history
                const chat = model.startChat({
                    history: conversationHistory
                })

                // Send the latest user message
                const lastMessage = messages[messages.length - 1]
                const result = await chat.sendMessage(lastMessage.content)
                const response = await result.response
                const text = response.text()

                return text
            }
        )

        return NextResponse.json({
            response: cachedResult.data,
            timestamp: new Date().toISOString(),
            fromCache: cachedResult.fromCache
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
