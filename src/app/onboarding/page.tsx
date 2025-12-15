"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateProfile } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Typography } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"

const onboardingSchema = z.object({
    university: z.string().min(2, "University name is required"),
    major: z.string().min(2, "Major is required"),
    interests: z.array(z.string()).min(3, "Select at least 3 interests").max(5, "Select at most 5 interests"),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

const INTEREST_OPTIONS = [
    "Coding", "Design", "Writing", "Mathematics", "Science",
    "Business", "Art", "Music", "Sports", "Gaming",
    "Reading", "Photography", "Travel", "Cooking", "Fitness"
]

const STEPS = [
    { id: 1, title: "University", description: "Where do you study?" },
    { id: 2, title: "Major", description: "What's your field of study?" },
    { id: 3, title: "Interests", description: "What are you passionate about?" },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = React.useState(1)
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            university: "",
            major: "",
            interests: [],
        },
    })

    const selectedInterests = watch("interests") || []

    const toggleInterest = (interest: string) => {
        const current = selectedInterests
        if (current.includes(interest)) {
            setValue("interests", current.filter((i) => i !== interest))
        } else if (current.length < 5) {
            setValue("interests", [...current, interest])
        }
    }

    const onSubmit = async (data: OnboardingFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await updateProfile({
                university: data.university,
                major: data.major,
                interests: data.interests,
            })

            if (result?.error) {
                setError(result.error)
            } else {
                router.push('/dashboard')
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1)
    }

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const canProceed = () => {
        const values = watch()
        if (currentStep === 1) return values.university.length >= 2
        if (currentStep === 2) return values.major.length >= 2
        if (currentStep === 3) return values.interests.length >= 3
        return false
    }

    return (
        <div className="min-h-screen bg-notion-bg flex items-center justify-center p-4">
            <div className="w-full max-w-2xl space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex h-12 w-12 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 items-center justify-center text-white font-bold text-xl mx-auto">
                        V
                    </div>
                    <Typography variant="h2">Let's get you set up</Typography>
                    <Typography variant="muted">
                        This will help us personalize your experience
                    </Typography>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between items-center">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${currentStep > step.id
                                            ? "bg-slate-900 text-white"
                                            : currentStep === step.id
                                                ? "bg-slate-900 text-white"
                                                : "bg-slate-200 text-slate-600"
                                        }`}
                                >
                                    {currentStep > step.id ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                <Typography variant="small" className="mt-2 text-center hidden sm:block">
                                    {step.title}
                                </Typography>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div
                                    className={`h-0.5 flex-1 mx-2 transition-colors ${currentStep > step.id ? "bg-slate-900" : "bg-slate-200"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                        <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Step 1: University */}
                            {currentStep === 1 && (
                                <div className="space-y-2">
                                    <label htmlFor="university" className="text-sm font-medium">
                                        University Name
                                    </label>
                                    <Input
                                        id="university"
                                        type="text"
                                        placeholder="e.g., Stanford University"
                                        {...register("university")}
                                        autoFocus
                                    />
                                    {errors.university && (
                                        <p className="text-sm text-red-600">{errors.university.message}</p>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Major */}
                            {currentStep === 2 && (
                                <div className="space-y-2">
                                    <label htmlFor="major" className="text-sm font-medium">
                                        Major / Field of Study
                                    </label>
                                    <Input
                                        id="major"
                                        type="text"
                                        placeholder="e.g., Computer Science"
                                        {...register("major")}
                                        autoFocus
                                    />
                                    {errors.major && (
                                        <p className="text-sm text-red-600">{errors.major.message}</p>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Interests */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div>
                                        <Typography variant="small" className="mb-2">
                                            Select 3-5 interests (Selected: {selectedInterests.length})
                                        </Typography>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {INTEREST_OPTIONS.map((interest) => {
                                            const isSelected = selectedInterests.includes(interest)
                                            const isDisabled = !isSelected && selectedInterests.length >= 5

                                            return (
                                                <Badge
                                                    key={interest}
                                                    variant={isSelected ? "default" : "outline"}
                                                    className={`cursor-pointer transition-all ${isSelected
                                                            ? "bg-slate-900 text-white hover:bg-slate-800"
                                                            : isDisabled
                                                                ? "opacity-50 cursor-not-allowed"
                                                                : "hover:border-slate-400"
                                                        }`}
                                                    onClick={() => !isDisabled && toggleInterest(interest)}
                                                >
                                                    {interest}
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                    {errors.interests && (
                                        <p className="text-sm text-red-600">{errors.interests.message}</p>
                                    )}
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-3 pt-4">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={isLoading}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                )}

                                {currentStep < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!canProceed()}
                                        className="ml-auto"
                                    >
                                        Next
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={!canProceed() || isLoading}
                                        className="ml-auto"
                                    >
                                        {isLoading ? "Saving..." : "Complete Setup"}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
