"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signup } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VadeaLogo } from "@/components/ui/logo"
import { AlertCircle } from "lucide-react"

const signupSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    })

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await signup(data.email, data.password, data.fullName)
            if (result?.error) {
                setError(result.error)
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background grid lg:grid-cols-2">
            {/* Left Side - Illustration/Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-secondary p-12 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white"></div>
                    <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-white"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center text-secondary-foreground max-w-md">
                    <VadeaLogo className="h-16 w-16 mx-auto mb-8 fill-white" />
                    <h1 className="text-4xl font-bold mb-6">Join thousands of students</h1>
                    <p className="text-xl opacity-90">
                        Get organized, stay focused, and achieve your academic goals with Vadea's powerful tools.
                    </p>

                    {/* Benefits */}
                    <div className="mt-12 space-y-4 text-left">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <p className="font-semibold mb-1">AI-Powered Organization</p>
                            <p className="text-sm opacity-80">Automatic syllabus parsing and deadline tracking</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <p className="font-semibold mb-1">Study Communities</p>
                            <p className="text-sm opacity-80">Collaborate with classmates and share resources</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <p className="font-semibold mb-1">Free Forever</p>
                            <p className="text-sm opacity-80">All core features, no credit card required</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo for mobile */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <VadeaLogo className="h-10 w-10" />
                        <span className="text-2xl font-bold">Vadea</span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold text-foreground">Create account</h2>
                            <p className="text-muted-foreground mt-2">
                                Get started with your free Vadea account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="fullName" className="text-sm font-medium">
                                    Full Name
                                </label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    {...register("fullName")}
                                    disabled={isLoading}
                                    className="h-11"
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-red-600">{errors.fullName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@university.edu"
                                    {...register("email")}
                                    disabled={isLoading}
                                    className="h-11"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("password")}
                                    disabled={isLoading}
                                    className="h-11"
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password
                                </label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("confirmPassword")}
                                    disabled={isLoading}
                                    className="h-11"
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                {isLoading ? "Creating account..." : "Create Account"}
                            </Button>
                        </form>

                        <div className="text-center text-sm">
                            <p className="text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
