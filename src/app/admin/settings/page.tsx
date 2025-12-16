import { requireSuperAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsEditor } from '@/components/admin/settings-editor'

export default async function AdminSettingsPage() {
    await requireSuperAdmin() // Only super admins can access settings
    const supabase = await createClient()

    // Fetch all settings
    const { data: settings } = await supabase
        .from('app_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true })

    // Group settings by category
    const settingsByCategory = settings?.reduce((acc: any, setting: any) => {
        const category = setting.category || 'general'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(setting)
        return acc
    }, {}) || {}

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Application Settings</h1>
                <p className="text-muted-foreground">
                    Configure environment variables and application settings
                </p>
            </div>

            <div className="space-y-6">
                {Object.entries(settingsByCategory).map(([category, items]: [string, any]) => (
                    <Card key={category}>
                        <CardHeader>
                            <CardTitle className="capitalize">{category.replace(/_/g, ' ')}</CardTitle>
                            <CardDescription>
                                Manage {category} configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SettingsEditor settings={items} category={category} />
                        </CardContent>
                    </Card>
                ))}

                {Object.keys(settingsByCategory).length === 0 && (
                    <Card>
                        <CardContent className="py-8">
                            <p className="text-center text-muted-foreground">
                                No settings configured yet. Settings can be added via SQL migrations.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
