import { AppLayout } from "@/components/layout"
import { ResearchTab } from "@/components/ai-advisor/research-tab"

export default function ResearchPage() {
    return (
        <AppLayout>
            <div className="h-[calc(100vh-64px)]">
                <ResearchTab />
            </div>
        </AppLayout>
    )
}
