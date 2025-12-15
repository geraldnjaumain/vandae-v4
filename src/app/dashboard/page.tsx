import { AppLayout } from "@/components/layout"
import { getUser, getUserProfile } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export default async function DashboardPage() {
    // Get authenticated user
    const user = await getUser()
    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const profile = await getUserProfile()
    if (!profile) {
        redirect('/onboarding')
    }

    const userName = profile.full_name?.split(' ')[0] || 'Student'

    return (
        <AppLayout>
            <DashboardClient userName={userName} />
        </AppLayout>
    )
}
