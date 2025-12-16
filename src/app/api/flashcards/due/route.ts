import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET() {
    try {
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get all decks with due card counts
        const { data: stats, error } = await supabase
            .from("deck_statistics")
            .select("deck_id, deck_name, due_cards")
            .eq("user_id", user.id)
            .gt("due_cards", 0)
            .order("due_cards", { ascending: false })

        if (error) {
            console.error("Error fetching due cards:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get deck colors
        const deckIds = (stats || []).map((s) => s.deck_id)
        const { data: decks } = await supabase
            .from("flashcard_decks")
            .select("id, color")
            .in("id", deckIds)

        const deckColorMap = new Map(decks?.map((d) => [d.id, d.color]) || [])

        const dueDecks = (stats || []).map((s) => ({
            id: s.deck_id,
            name: s.deck_name,
            color: deckColorMap.get(s.deck_id) || "#3b82f6",
            due_cards: s.due_cards,
        }))

        const totalDue = dueDecks.reduce((sum, deck) => sum + deck.due_cards, 0)

        return NextResponse.json({
            decks: dueDecks,
            total: totalDue,
        })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
