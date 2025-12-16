"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

// ===========================================
// TYPES
// ===========================================

export type StudySession = {
  id: string
  user_id: string
  activity_type: "flashcard" | "assignment" | "reading" | "research" | "other"
  duration: number
  focus_score: number | null
  reference_id: string | null
  reference_type: string | null
  started_at: string
  ended_at: string | null
  metadata: Record<string, any>
  created_at: string
}

export type GradeEntry = {
  id: string
  user_id: string
  assignment_id: string | null
  grade: number
  max_grade: number
  percentage: number
  feedback: string | null
  graded_by: string | null
  graded_at: string
  created_at: string
}

export type UserGoal = {
  id: string
  user_id: string
  title: string
  description: string | null
  goal_type: "study_time" | "grade_average" | "flashcard_retention" | "assignment_completion" | "streak" | "custom"
  target_value: number
  current_value: number
  unit: string | null
  start_date: string
  target_date: string | null
  status: "active" | "completed" | "abandoned"
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ===========================================
// STUDY SESSION TRACKING
// ===========================================

/**
 * Start a new study session
 */
export async function startStudySession(data: {
  activityType: StudySession["activity_type"]
  referenceId?: string
  referenceType?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: session, error } = await supabase
    .from("study_sessions")
    .insert({
      user_id: user.id,
      activity_type: data.activityType,
      reference_id: data.referenceId || null,
      reference_type: data.referenceType || null,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error starting study session:", error)
    return { error: error.message }
  }

  return { data: session }
}

/**
 * End a study session and log duration
 */
export async function endStudySession(sessionId: string, focusScore?: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  // Get session to calculate duration
  const { data: session } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (!session) {
    return { error: "Session not found" }
  }

  const endedAt = new Date()
  const duration = Math.floor(
    (endedAt.getTime() - new Date(session.started_at).getTime()) / 1000
  )

  const { data: updatedSession, error } = await supabase
    .from("study_sessions")
    .update({
      ended_at: endedAt.toISOString(),
      duration,
      focus_score: focusScore || null,
    })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error ending study session:", error)
    return { error: error.message }
  }

  // Refresh analytics
  await supabase.rpc("refresh_user_analytics")

  revalidatePath("/analytics")
  return { data: updatedSession }
}

/**
 * Get user's study sessions
 */
export async function getStudySessions(limit = 50) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: sessions, error } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching study sessions:", error)
    return { error: error.message }
  }

  return { data: sessions }
}

// ===========================================
// GRADE MANAGEMENT
// ===========================================

/**
 * Create a grade entry
 */
export async function createGradeEntry(data: {
  assignmentId?: string
  grade: number
  maxGrade: number
  feedback?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: gradeEntry, error } = await supabase
    .from("grade_entries")
    .insert({
      user_id: user.id,
      assignment_id: data.assignmentId || null,
      grade: data.grade,
      max_grade: data.maxGrade,
      feedback: data.feedback || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating grade entry:", error)
    return { error: error.message }
  }

  // Refresh analytics
  await supabase.rpc("refresh_user_analytics")

  revalidatePath("/analytics")
  return { data: gradeEntry }
}

/**
 * Get user's grades
 */
export async function getGradeEntries(limit = 50) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: grades, error } = await supabase
    .from("grade_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("graded_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching grades:", error)
    return { error: error.message }
  }

  return { data: grades }
}

// ===========================================
// USER ANALYTICS
// ===========================================

/**
 * Get user analytics summary
 */
export async function getUserAnalytics() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: analytics, error } = await supabase
    .from("user_analytics")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching analytics:", error)
    return { error: error.message }
  }

  // Get study streak
  const { data: streak } = await supabase.rpc("get_study_streak", {
    p_user_id: user.id,
  })

  return {
    data: {
      ...analytics,
      study_streak: streak || 0,
    },
  }
}

// ===========================================
// GOALS
// ===========================================

/**
 * Create a new goal
 */
export async function createGoal(data: {
  title: string
  description?: string
  goalType: UserGoal["goal_type"]
  targetValue: number
  unit?: string
  targetDate?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: goal, error } = await supabase
    .from("user_goals")
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      goal_type: data.goalType,
      target_value: data.targetValue,
      unit: data.unit || null,
      target_date: data.targetDate || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating goal:", error)
    return { error: error.message }
  }

  revalidatePath("/analytics")
  return { data: goal }
}

/**
 * Update goal progress
 */
export async function updateGoalProgress(goalId: string, currentValue: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: goal, error } = await supabase
    .from("user_goals")
    .update({ current_value: currentValue })
    .eq("id", goalId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating goal:", error)
    return { error: error.message }
  }

  revalidatePath("/analytics")
  return { data: goal }
}

/**
 * Get active goals
 */
export async function getActiveGoals() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: goals, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching goals:", error)
    return { error: error.message }
  }

  return { data: goals }
}
