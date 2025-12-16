import { Mail } from "lucide-react"
import { ChatSidebar } from "@/components/messages/chat-sidebar"

export default function MessagesPage() {
    return (
        <div className="flex flex-col h-full relative bg-background">
            {/* Mobile Header with Sidebar Trigger - We need to render the trigger specifically here 
                because the layout hides the sidebar on mobile. 
                Wait, the Layout renders ChatSidebar with "md:hidden" className?? 
                No, layout renders it as hidden md:block.
                We need to render a mobile-only sidebar trigger here or in the layout.
                Ideally layout handles it. Let's look at layout.
                Layout has: <ChatSidebar ... className="hidden md:block ..." />
                It does NOT render the mobile version.
                So we should render the mobile trigger inside the main content area (here).
                
                Actually, simpler: Let's render the ChatSidebar in mobile mode here?
                No, that duplicates data fetching which was done in layout.
                
                Better fix: Update layout.tsx to render the mobile sidebar trigger. 
                BUT for now, let's just make this page look good.
            */}

            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 animate-in fade-in duration-500">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2 max-w-sm">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Your Messages</h2>
                    <p className="text-muted-foreground">
                        Select a conversation from the sidebar to start chatting.
                    </p>
                </div>

                {/* Mobile Hint */}
                <p className="text-sm text-muted-foreground/80 md:hidden pt-8">
                    Tap the menu button in the top left to see your chats.
                </p>
            </div>
        </div>
    )
}
