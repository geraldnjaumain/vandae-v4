"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, Play, Pause, RefreshCw, Target, CheckCircle2 } from "lucide-react"
import { Typography } from "@/components/ui/typography"

export function StudyRoomTools() {
    const [timeLeft, setTimeLeft] = React.useState(25 * 60)
    const [isRunning, setIsRunning] = React.useState(false)
    const [mode, setMode] = React.useState<'focus' | 'break'>('focus')
    const [goal, setGoal] = React.useState("")
    const [isGoalSet, setIsGoalSet] = React.useState(false)

    React.useEffect(() => {
        let interval: NodeJS.Timeout

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsRunning(false)
            // Play sound or notification here
        }

        return () => clearInterval(interval)
    }, [isRunning, timeLeft])

    const toggleTimer = () => setIsRunning(!isRunning)
    const resetTimer = () => {
        setIsRunning(false)
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
    }

    const switchMode = () => {
        const newMode = mode === 'focus' ? 'break' : 'focus'
        setMode(newMode)
        setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60)
        setIsRunning(false)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="w-80 border-l border-slate-800 bg-slate-900 text-slate-100 flex flex-col h-full">
            <div className="p-4 border-b border-slate-800">
                <h3 className="font-semibold flex items-center gap-2 text-indigo-400">
                    <Timer className="h-5 w-5" />
                    Study Tools
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Timer Section */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider flex justify-between items-center">
                            {mode === 'focus' ? 'Focus Timer' : 'Break Timer'}
                            <Button variant="ghost" size="sm" onClick={switchMode} className="h-auto p-0 text-xs text-indigo-400 hover:text-indigo-300">
                                Switch to {mode === 'focus' ? 'Break' : 'Focus'}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-mono font-bold text-center py-4 tracking-widest text-white">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="flex justify-center gap-3">
                            <Button
                                variant={isRunning ? "destructive" : "default"}
                                size="sm"
                                onClick={toggleTimer}
                                className={!isRunning ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                            >
                                {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                {isRunning ? "Pause" : "Start"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={resetTimer} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Goal Section */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                            Current Goal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isGoalSet ? (
                            <div className="flex items-start gap-3 bg-indigo-900/30 p-3 rounded-md border border-indigo-900/50">
                                <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-indigo-100 break-words">{goal}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
                                    onClick={() => setIsGoalSet(false)}
                                >
                                    <RefreshCw className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Input
                                    placeholder="What are you working on?"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && goal.trim()) setIsGoalSet(true)
                                    }}
                                />
                                <Button
                                    size="sm"
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200"
                                    disabled={!goal.trim()}
                                    onClick={() => setIsGoalSet(true)}
                                >
                                    <Target className="h-4 w-4 mr-2" />
                                    Set Goal
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tips */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800">
                    <Typography variant="small" className="text-slate-400 italic block text-center">
                        "The best way to get something done is to begin."
                    </Typography>
                </div>
            </div>
        </div>
    )
}
