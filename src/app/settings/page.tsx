"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Typography } from "@/components/ui/typography"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Trash2, User, Bell, Lock, Mail } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { deleteAccount } from "@/app/actions/account"
import { toast } from "sonner"
import { updateProfile, getProfile } from "@/app/settings/actions"
import { updateNotificationPreferences, getNotificationPreferences } from "@/app/settings/notification-actions"
import { AvatarUpload } from "@/components/settings/avatar-upload"
import { ChangePasswordForm } from "@/components/settings/change-password-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { Moon, Sun, Laptop, LogOut, Palette } from "lucide-react"

export default function SettingsPage() {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [confirmText, setConfirmText] = React.useState("")
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    // Profile State
    const [isLoadingProfile, setIsLoadingProfile] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)
    const [formData, setFormData] = React.useState({
        id: "",
        fullName: "",
        email: "",
        university: "",
        major: "",
        interests: "",
        avatarUrl: ""
    })

    // Notification State
    const [notificationPrefs, setNotificationPrefs] = React.useState({
        emailNotifications: true,
        communityUpdates: true,
        taskReminders: true,
        weeklyDigest: false
    })

    const { theme, setTheme } = useTheme()
    const router = useRouter()

    React.useEffect(() => {
        setMounted(true)
        getProfile().then(profile => {
            if (profile) {
                setFormData({
                    id: profile.id,
                    fullName: profile.full_name || "",
                    email: "",
                    university: profile.university || "",
                    major: profile.major || "",
                    interests: (profile.interests || []).join(', '),
                    avatarUrl: profile.avatar_url || ""
                })
            }
            setIsLoadingProfile(false)
        })

        // Load notification preferences
        getNotificationPreferences().then(prefs => {
            if (prefs) {
                setNotificationPrefs(prefs)
            }
        })
    }, [])

    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
            await updateProfile({
                fullName: formData.fullName,
                major: formData.major,
                university: formData.university,
                interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
                avatarUrl: formData.avatarUrl
            })
            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error("Failed to update profile")
        } finally {
            setIsSaving(false)
        }
    }

    const handleNotificationToggle = async (key: keyof typeof notificationPrefs) => {
        const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] }
        setNotificationPrefs(newPrefs)

        try {
            await updateNotificationPreferences(newPrefs)
            toast.success("Notification preferences updated")
        } catch (error) {
            toast.error("Failed to update notification preferences")
            // Revert on error
            setNotificationPrefs(notificationPrefs)
        }
    }

    const handleDeleteAccount = async () => {
        if (confirmText !== "DELETE MY ACCOUNT") {
            toast.error("Please type the confirmation text exactly as shown")
            return
        }
        setIsDeleting(true)
        try {
            const result = await deleteAccount()
            if (result?.error) {
                toast.error(result.error)
                setIsDeleting(false)
            } else {
                toast.success("Your account has been deleted successfully")
            }
        } catch (error) {
            toast.error("Failed to delete account. Please try again or contact support.")
            setIsDeleting(false)
        }
    }

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <AppLayout>
            <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <Typography variant="h1">Settings</Typography>
                    <Typography variant="muted">
                        Manage your account settings and preferences
                    </Typography>
                </div>

                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>
                            Update your profile details and preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <AvatarUpload
                            userId={formData.id}
                            displayName={formData.fullName}
                            currentAvatarUrl={formData.avatarUrl}
                            onUploadComplete={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                        />

                        <div className="space-y-2">
                            <label htmlFor="fullName" className="text-sm font-medium">
                                Full Name
                            </label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="John Doe"
                                disabled={isLoadingProfile}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </label>
                            <Input id="email" type="email" placeholder="Managed by Auth Provider" disabled />
                            <p className="text-xs text-slate-500">
                                Email cannot be changed here
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="university" className="text-sm font-medium">
                                University
                            </label>
                            <Input
                                id="university"
                                value={formData.university}
                                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                placeholder="Your University"
                                disabled={isLoadingProfile}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="major" className="text-sm font-medium">
                                Major
                            </label>
                            <Input
                                id="major"
                                value={formData.major}
                                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                placeholder="Computer Science"
                                disabled={isLoadingProfile}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="interests" className="text-sm font-medium">
                                Interests (comma separated)
                            </label>
                            <Input
                                id="interests"
                                value={formData.interests}
                                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                                placeholder="Coding, Design, AI, Math"
                                disabled={isLoadingProfile}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.interests.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleSaveProfile} disabled={isSaving || isLoadingProfile}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Appearance Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>
                            Customize the look and feel of the application
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {mounted && (
                            <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
                                <div>
                                    <RadioGroupItem value="light" id="light" className="peer sr-only" />
                                    <Label
                                        htmlFor="light"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <Sun className="mb-3 h-6 w-6" />
                                        Light
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                                    <Label
                                        htmlFor="dark"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <Moon className="mb-3 h-6 w-6" />
                                        Dark
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="system" id="system" className="peer sr-only" />
                                    <Label
                                        htmlFor="system"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <Laptop className="mb-3 h-6 w-6" />
                                        System
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                        {!mounted && (
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-[104px] rounded-md border-2 border-muted bg-muted/50 animate-pulse" />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Notifications Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>
                            Manage your email and push notification preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Email Notifications</p>
                                <p className="text-xs text-muted-foreground">Receive updates about your schedule and assignments</p>
                            </div>
                            <Switch
                                checked={notificationPrefs.emailNotifications}
                                onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Community Updates</p>
                                <p className="text-xs text-muted-foreground">Get notified about posts in your communities</p>
                            </div>
                            <Switch
                                checked={notificationPrefs.communityUpdates}
                                onCheckedChange={() => handleNotificationToggle('communityUpdates')}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Task Reminders</p>
                                <p className="text-xs text-muted-foreground">Reminders for upcoming tasks and deadlines</p>
                            </div>
                            <Switch
                                checked={notificationPrefs.taskReminders}
                                onCheckedChange={() => handleNotificationToggle('taskReminders')}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Weekly Digest</p>
                                <p className="text-xs text-muted-foreground">Receive a weekly summary of your activity</p>
                            </div>
                            <Switch
                                checked={notificationPrefs.weeklyDigest}
                                onCheckedChange={() => handleNotificationToggle('weeklyDigest')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>
                            Manage your password and security settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <div className="flex gap-2">
                                <Input type="password" value="••••••••" disabled />
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            Change Password
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Change Password</DialogTitle>
                                            <DialogDescription>
                                                Enter your new password below
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ChangePasswordForm />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Update your password to keep your account secure
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Session Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LogOut className="h-5 w-5" />
                            Session
                        </CardTitle>
                        <CardDescription>
                            Manage your active session
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Sign Out</p>
                                <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
                            </div>
                            <Button variant="outline" onClick={handleSignOut} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="text-red-600">
                            Irreversible actions that permanently affect your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <p className="text-sm text-red-700">
                                <strong>Delete Account:</strong> This will permanently delete your account and all associated data.
                                This action cannot be undone.
                            </p>

                            <div className="bg-white dark:bg-card rounded-lg p-4 border border-red-200 dark:border-red-900/50">
                                <h4 className="font-medium text-sm text-red-900 mb-2">What will be deleted:</h4>
                                <ul className="text-xs text-red-700 space-y-1">
                                    <li>• Your profile and personal information</li>
                                    <li>• All class schedules and timetables</li>
                                    <li>• Uploaded files and resources</li>
                                    <li>• Tasks and assignments</li>
                                    <li>• Community posts and likes</li>
                                    <li>• Community memberships</li>
                                </ul>
                            </div>

                            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete My Account
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-red-700">
                                            <AlertCircle className="h-5 w-5" />
                                            Are you absolutely sure?
                                        </DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            and remove all your data from our servers.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="text-sm text-red-700 font-medium mb-2">
                                                All of the following will be permanently deleted:
                                            </p>
                                            <ul className="text-xs text-red-600 space-y-1">
                                                <li>• Your profile and account</li>
                                                <li>• All uploaded files and resources</li>
                                                <li>• Class schedules and timetables</li>
                                                <li>• Tasks and assignments</li>
                                                <li>• Community posts and memberships</li>
                                            </ul>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="confirm" className="text-sm font-medium">
                                                Type <span className="font-mono bg-red-100 px-1 rounded">DELETE MY ACCOUNT</span> to confirm
                                            </label>
                                            <Input
                                                id="confirm"
                                                value={confirmText}
                                                onChange={(e) => setConfirmText(e.target.value)}
                                                placeholder="DELETE MY ACCOUNT"
                                                className="font-mono"
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsDeleteDialogOpen(false)
                                                setConfirmText("")
                                            }}
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteAccount}
                                            disabled={confirmText !== "DELETE MY ACCOUNT" || isDeleting}
                                        >
                                            {isDeleting ? "Deleting..." : "Delete My Account"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Links */}
                <div className="flex gap-4 text-sm text-slate-600">
                    <a href="/legal/privacy" className="hover:underline">Privacy Policy</a>
                    <span>•</span>
                    <a href="/legal/terms" className="hover:underline">Terms of Service</a>
                    <span>•</span>
                    <a href="mailto:support@vadae.com" className="hover:underline">Contact Support</a>
                </div>
            </div>
        </AppLayout>
    )
}
