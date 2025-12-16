import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase-server'
import { checkRateLimit, getRateLimitIdentifier, RATE_LIMITS } from '@/lib/rate-limit'
import { withCache } from '@/lib/ai-cache'

export async function POST(request: NextRequest) {
    try {
        const { courseId } = await request.json()

        if (!courseId) {
            return NextResponse.json(
                { error: 'Course ID is required' },
                { status: 400 }
            )
        }

        // Get user and check rate limit
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const identifier = getRateLimitIdentifier(user.id)
        const rateLimit = checkRateLimit(identifier, RATE_LIMITS.AI_ANALYZE)

        if (rateLimit.limited) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded. You can analyze up to 10 courses per hour.',
                    resetTime: rateLimit.resetTime
                },
                { status: 429 }
            )
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey || apiKey === 'your-gemini-key') {
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 500 }
            )
        }

        // Fetch course details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single()

        if (courseError || !course) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            )
        }

        // Check if already analyzed
        if (course.is_analyzed) {
            return NextResponse.json({
                message: 'Course already analyzed',
                course
            })
        }

        // Perform AI analysis with caching
        const genAI = new GoogleGenerativeAI(apiKey)

        const cachedAnalysis = await withCache(
            {
                endpoint: 'ai-analyze-course',
                ttlDays: 30 // Cache course analysis for 30 days
            },
            { courseId, courseName: course.course_name, courseCode: course.course_code },
            async () => {
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

                const analysisPrompt = `You are an expert academic advisor analyzing a course for a university student.

COURSE INFORMATION:
- Code: ${course.course_code}
- Name: ${course.course_name}
- Instructor: ${course.instructor || 'Not specified'}
- Description: ${course.description || 'No description provided'}

TASK: Provide a comprehensive analysis of this course with the following structure:

1. **Course Overview**: Brief summary of what the course covers (2-3 sentences)

2. **Typical Units/Modules**: List 6-10 major units typically covered in this course
   Format each as: {"title": "Unit Name", "topics": ["Topic 1", "Topic 2", ...]}

3. **Recommended Resources**: Suggest 5-7 high-quality learning resources
   Format each as: {"title": "Resource Name", "type": "Book/Video/Website/Tool", "url": "URL if applicable", "description": "Why it's useful"}

4. **Study Approach**: Recommend the best study methodology for this subject (e.g., visual learning, practice problems, concept mapping, etc.) - 3-4 sentences

5. **Exam Preparation Tips**: Specific strategies for succeeding in exams for this type of course - 3-4 sentences

Return the response in JSON format with keys: overview, units, resources, studyApproach, examTips`

                const result = await model.generateContent(analysisPrompt)
                const response = await result.response
                const analysisText = response.text()

                // Parse JSON from response
                let analysis
                try {
                    // Extract JSON from markdown code blocks if present
                    const jsonMatch = analysisText.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) ||
                        analysisText.match(/\{[\s\S]*\}/)

                    if (jsonMatch) {
                        const jsonText = jsonMatch[1] || jsonMatch[0]
                        analysis = JSON.parse(jsonText)
                    } else {
                        throw new Error('No JSON found in response')
                    }
                } catch (parseError) {
                    console.error('Failed to parse AI response:', analysisText)
                    throw new Error('Failed to parse AI analysis')
                }

                return analysis
            }
        )

        const analysis = cachedAnalysis.data

        // Update course with analysis
        const { data: updatedCourse, error: updateError } = await supabase
            .from('courses')
            .update({
                units: analysis.units || [],
                resources: analysis.resources || [],
                study_suggestions: analysis.studyApproach || '',
                ai_analysis: JSON.stringify({
                    overview: analysis.overview,
                    examTips: analysis.examTips,
                    analyzedAt: new Date().toISOString()
                }),
                is_analyzed: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', courseId)
            .select()
            .single()

        if (updateError) {
            return NextResponse.json(
                { error: 'Failed to save analysis', details: updateError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            course: updatedCourse,
            analysis: {
                overview: analysis.overview,
                unitsCount: analysis.units?.length || 0,
                resourcesCount: analysis.resources?.length || 0
            }
        })

    } catch (error: any) {
        console.error('Course Analysis Error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze course', details: error.message },
            { status: 500 }
        )
    }
}
