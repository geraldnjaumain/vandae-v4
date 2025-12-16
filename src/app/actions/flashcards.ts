"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

// ===========================================
// TYPES
// ===========================================

export type FlashcardDeck = {
  id: string
  user_id: string
  name: string
  description: string | null
  settings: {
    newCardsPerDay: number
    reviewsPerDay: number
    intervalModifier: number
    easyBonus: number
    hardInterval: number
  }
  color: string
  icon: string | null
  created_at: string
  updated_at: string
}

export type Flashcard = {
  id: string
  deck_id: string
  front: string
  back: string
  front_media_url: string | null
  back_media_url: string | null
  tags: string[]
  difficulty_rating: number
  interval: number
  ease_factor: number
  repetitions: number
  next_review_date: string | null
  card_state: "new" | "learning" | "reviewing" | "relearning"
  times_reviewed: number
  times_failed: number
  created_at: string
  updated_at: string
}

export type ReviewSession = {
  id: string
  user_id: string
  deck_id: string
  cards_reviewed: number
  cards_correct: number
  cards_failed: number
  session_duration: number
  completion_status: "active" | "completed" | "paused" | "abandoned"
  started_at: string
  completed_at: string | null
}

export type ReviewRating = 1 | 2 | 3 | 4 // Again, Hard, Good, Easy

// ===========================================
// DECK MANAGEMENT ACTIONS
// ===========================================

/**
 * Get all decks for the current user with statistics
 */
export async function getDecks() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: decks, error } = await supabase
    .from("flashcard_decks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching decks:", error)
    return { error: error.message }
  }

  // Get statistics for each deck
  const decksWithStats = await Promise.all(
    (decks || []).map(async (deck) => {
      const stats = await getDeckStats(deck.id)
      return {
        ...deck,
        stats: stats.data || {},
      }
    })
  )

  return { data: decksWithStats }
}

/**
 * Get a single deck by ID
 */
export async function getDeck(deckId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: deck, error } = await supabase
    .from("flashcard_decks")
    .select("*")
    .eq("id", deckId)
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching deck:", error)
    return { error: error.message }
  }

  return { data: deck }
}

/**
 * Create a new flashcard deck
 */
export async function createDeck(data: {
  name: string
  description?: string
  color?: string
  icon?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: deck, error } = await supabase
    .from("flashcard_decks")
    .insert({
      user_id: user.id,
      name: data.name,
      description: data.description || null,
      color: data.color || "#3b82f6",
      icon: data.icon || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating deck:", error)
    return { error: error.message }
  }

  revalidatePath("/flashcards")
  return { data: deck }
}

/**
 * Update a deck
 */
export async function updateDeck(
  deckId: string,
  updates: Partial<Pick<FlashcardDeck, "name" | "description" | "color" | "icon" | "settings">>
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: deck, error } = await supabase
    .from("flashcard_decks")
    .update(updates)
    .eq("id", deckId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating deck:", error)
    return { error: error.message }
  }

  revalidatePath("/flashcards")
  revalidatePath(`/flashcards/${deckId}`)
  return { data: deck }
}

/**
 * Delete a deck (cascades to flashcards)
 */
export async function deleteDeck(deckId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("flashcard_decks")
    .delete()
    .eq("id", deckId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting deck:", error)
    return { error: error.message }
  }

  revalidatePath("/flashcards")
  return { data: { success: true } }
}

/**
 * Get deck statistics from materialized view
 */
export async function getDeckStats(deckId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: stats, error } = await supabase
    .from("deck_statistics")
    .select("*")
    .eq("deck_id", deckId)
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching deck stats:", error)
    return { error: error.message }
  }

  return { data: stats }
}

// ===========================================
// FLASHCARD CRUD ACTIONS
// ===========================================

/**
 * Get cards in a deck with optional filters
 */
export async function getCardsInDeck(
  deckId: string,
  filter?: "all" | "new" | "due" | "learning"
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  let query = supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId)
    .order("created_at", { ascending: false })

  // Apply filters
  if (filter === "new") {
    query = query.eq("card_state", "new")
  } else if (filter === "due") {
    query = query.lte("next_review_date", new Date().toISOString())
  } else if (filter === "learning") {
    query = query.in("card_state", ["learning", "relearning"])
  }

  const { data: cards, error } = await query

  if (error) {
    console.error("Error fetching cards:", error)
    return { error: error.message }
  }

  return { data: cards }
}

/**
 * Get a single flashcard
 */
export async function getCard(cardId: string) {
  const supabase = await createClient()

  const { data: card, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("id", cardId)
    .single()

  if (error) {
    console.error("Error fetching card:", error)
    return { error: error.message }
  }

  return { data: card }
}

/**
 * Create a single flashcard
 */
export async function createCard(data: {
  deckId: string
  front: string
  back: string
  frontMediaUrl?: string
  backMediaUrl?: string
  tags?: string[]
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: card, error } = await supabase
    .from("flashcards")
    .insert({
      deck_id: data.deckId,
      front: data.front,
      back: data.back,
      front_media_url: data.frontMediaUrl || null,
      back_media_url: data.backMediaUrl || null,
      tags: data.tags || [],
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating card:", error)
    return { error: error.message }
  }

  revalidatePath(`/flashcards/${data.deckId}`)
  return { data: card }
}

/**
 * Create multiple flashcards in bulk
 */
export async function createCardsBulk(
  deckId: string,
  cards: Array<{
    front: string
    back: string
    frontMediaUrl?: string
    backMediaUrl?: string
    tags?: string[]
  }>
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const cardsToInsert = cards.map((card) => ({
    deck_id: deckId,
    front: card.front,
    back: card.back,
    front_media_url: card.frontMediaUrl || null,
    back_media_url: card.backMediaUrl || null,
    tags: card.tags || [],
  }))

  const { data: createdCards, error } = await supabase
    .from("flashcards")
    .insert(cardsToInsert)
    .select()

  if (error) {
    console.error("Error creating cards in bulk:", error)
    return { error: error.message }
  }

  revalidatePath(`/flashcards/${deckId}`)
  return { data: createdCards }
}

/**
 * Update a flashcard
 */
export async function updateCard(
  cardId: string,
  updates: Partial<
    Pick<Flashcard, "front" | "back" | "front_media_url" | "back_media_url" | "tags">
  >
) {
  const supabase = await createClient()

  const { data: card, error } = await supabase
    .from("flashcards")
    .update(updates)
    .eq("id", cardId)
    .select()
    .single()

  if (error) {
    console.error("Error updating card:", error)
    return { error: error.message }
  }

  revalidatePath(`/flashcards/${card.deck_id}`)
  return { data: card }
}

/**
 * Delete a flashcard
 */
export async function deleteCard(cardId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("flashcards").delete().eq("id", cardId)

  if (error) {
    console.error("Error deleting card:", error)
    return { error: error.message }
  }

  revalidatePath("/flashcards")
  return { data: { success: true } }
}

// ===========================================
// REVIEW SESSION ACTIONS
// ===========================================

/**
 * Start a review session and get due cards
 */
export async function startReviewSession(deckId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  // Get deck settings
  const deckResult = await getDeck(deckId)
  if (deckResult.error || !deckResult.data) {
    return { error: "Deck not found" }
  }

  const deck = deckResult.data
  const settings = deck.settings

  // Get due cards
  const { data: dueCards } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId)
    .lte("next_review_date", new Date().toISOString())
    .limit(settings.reviewsPerDay)

  // Get new cards
  const { data: newCards } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId)
    .eq("card_state", "new")
    .limit(settings.newCardsPerDay)

  const cardsToReview = [...(dueCards || []), ...(newCards || [])]

  if (cardsToReview.length === 0) {
    return { error: "No cards to review" }
  }

  // Create review session
  const { data: session, error } = await supabase
    .from("review_sessions")
    .insert({
      user_id: user.id,
      deck_id: deckId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating review session:", error)
    return { error: error.message }
  }

  return {
    data: {
      session,
      cards: cardsToReview,
    },
  }
}

/**
 * Submit a card review and update using SM-2 algorithm
 */
export async function submitCardReview(
  cardId: string,
  sessionId: string,
  rating: ReviewRating,
  timeTaken?: number
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  // Get current card state
  const { data: card, error: cardError } = await supabase
    .from("flashcards")
    .select("*")
    .eq("id", cardId)
    .single()

  if (cardError || !card) {
    return { error: "Card not found" }
  }

  // Call SM-2 algorithm function
  const { data: sm2Result, error: sm2Error } = await supabase.rpc(
    "calculate_sm2_next_review",
    {
      p_rating: rating,
      p_current_interval: card.interval,
      p_current_ease_factor: card.ease_factor,
      p_repetitions: card.repetitions,
    }
  )

  if (sm2Error) {
    console.error("Error calculating SM-2:", sm2Error)
    return { error: sm2Error.message }
  }

  const result = sm2Result[0]

  // Update card with new SM-2 values
  const newCardState =
    rating === 1 ? "relearning" : result.new_repetitions > 1 ? "reviewing" : "learning"

  const { error: updateError } = await supabase
    .from("flashcards")
    .update({
      interval: result.new_interval,
      ease_factor: result.new_ease_factor,
      repetitions: result.new_repetitions,
      next_review_date: result.next_review_date,
      card_state: newCardState,
      times_reviewed: card.times_reviewed + 1,
      times_failed: rating === 1 ? card.times_failed + 1 : card.times_failed,
      difficulty_rating: result.new_ease_factor, // Use ease factor as difficulty proxy
    })
    .eq("id", cardId)

  if (updateError) {
    console.error("Error updating card:", updateError)
    return { error: updateError.message }
  }

  // Record review history
  const { error: historyError } = await supabase.from("card_review_history").insert({
    flashcard_id: cardId,
    session_id: sessionId,
    user_id: user.id,
    rating,
    time_taken: timeTaken || null,
    interval_before: card.interval,
    ease_factor_before: card.ease_factor,
    interval_after: result.new_interval,
    ease_factor_after: result.new_ease_factor,
    next_review_date: result.next_review_date,
  })

  if (historyError) {
    console.error("Error recording review history:", historyError)
  }

  // Update session stats
  const { error: sessionError } = await supabase
    .from("review_sessions")
    .update({
      cards_reviewed: supabase.sql`cards_reviewed + 1`,
      cards_correct: rating >= 3 ? supabase.sql`cards_correct + 1` : undefined,
      cards_failed: rating === 1 ? supabase.sql`cards_failed + 1` : undefined,
    })
    .eq("id", sessionId)

  if (sessionError) {
    console.error("Error updating session:", sessionError)
  }

  return {
    data: {
      newInterval: result.new_interval,
      newEaseFactor: result.new_ease_factor,
      nextReviewDate: result.next_review_date,
    },
  }
}

/**
 * Complete a review session
 */
export async function completeReviewSession(sessionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  // Get session to calculate duration
  const { data: session, error: sessionError } = await supabase
    .from("review_sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (sessionError || !session) {
    return { error: "Session not found" }
  }

  const duration = Math.floor(
    (new Date().getTime() - new Date(session.started_at).getTime()) / 1000
  )

  const { data: completedSession, error } = await supabase
    .from("review_sessions")
    .update({
      completion_status: "completed",
      completed_at: new Date().toISOString(),
      session_duration: duration,
    })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error completing session:", error)
    return { error: error.message }
  }

  revalidatePath("/flashcards")
  return { data: completedSession }
}
