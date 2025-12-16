'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Setting {
    id: string
    key: string
    value: string
    description?: string
    is_secret: boolean
}

export function SettingsEditor({
    settings,
    category,
}: {
    settings: Setting[]
    category: string
}) {
    const [values, setValues] = useState<Record<string, string>>(
        settings.reduce((acc, s) => ({ ...acc, [s.key]: s.is_secret ? '••••••••' : s.value }), {})
    )
    const [saving, setSaving] = useState(false)

    const handleSave = async (key: string) => {
        setSaving(true)
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value: values[key] })
            })

            if (response.ok) {
                alert('Setting updated successfully')
            } else {
                alert('Failed to update setting')
            }
        } catch (error) {
            alert('Error updating setting')
        }
        setSaving(false)
    }

    return (
        <div className="space-y-6">
            {settings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                    <Label htmlFor={setting.key}>{setting.key}</Label>
                    {setting.description && (
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                    )}
                    <div className="flex gap-2">
                        <Input
                            id={setting.key}
                            type={setting.is_secret ? 'password' : 'text'}
                            value={values[setting.key] || ''}
                            onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                            placeholder={setting.is_secret ? 'Enter new value' : ''}
                        />
                        <Button
                            onClick={() => handleSave(setting.key)}
                            disabled={saving}
                            size="sm"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
