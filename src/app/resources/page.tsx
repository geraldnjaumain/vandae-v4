import { AppLayout } from "@/components/layout"
import { Typography } from "@/components/ui/typography"
import { FolderOpen } from "lucide-react"
import { UploadDropzone } from "@/components/resources/upload-dropzone"
import { ResourceBrowser } from "@/components/resources/resource-browser" // Changed import
import { getResources } from "@/app/resources/actions"
import { getUser } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function ResourcesPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const resources = await getResources()

    return (
        <AppLayout>
            <div className="container mx-auto p-4 md:p-6 max-w-6xl">
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <Typography variant="h1" className="flex items-center gap-2">
                            <FolderOpen className="h-8 w-8 text-blue-600" />
                            Resource Vault
                        </Typography>
                        <Typography variant="muted">
                            Securely store and organize your academic files.
                        </Typography>
                    </div>

                    {/* Upload Section */}
                    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                        <Typography variant="h3" className="mb-4 text-base font-medium">Upload Files</Typography>
                        <UploadDropzone userId={user.id} />
                    </div>

                    {/* Browser Section */}
                    <ResourceBrowser resources={resources} />
                </div>
            </div>
        </AppLayout>
    )
}
