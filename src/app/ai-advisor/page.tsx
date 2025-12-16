import { AppLayout } from "@/components/layout"
import { ChatInterface } from "@/components/ai-advisor/chat-interface"
import { ResearchPanel } from "@/components/ai-advisor/research-panel"
import { getUser, getUserProfile } from "@/lib/supabase-server"
import { GraduationCap } from "lucide-react"

export default async function AIAdvisorPage() {
    const user = await getUser()
    const profile = await getUserProfile()
    const userName = profile?.full_name?.split(' ')[0] || "Student"

    return (
        <AppLayout>
            <div className="flex h-[calc(100vh-64px)] bg-background">
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Vadea AI Advisor</h1>
                                <p className="text-xs text-muted-foreground">Your intelligent academic companion</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                            Beta
                        </div>
                    </div>

                    {/* Chat Interface */}
                    <div className="flex-1 overflow-hidden">
                        <ChatInterface userName={userName} className="h-full" />
                    </div>
                </div>

                {/* Research Sidebar */}
                <ResearchPanel userId={user?.id} />
            </div>
        </AppLayout>
    )
}
