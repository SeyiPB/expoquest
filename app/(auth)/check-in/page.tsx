"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function CheckInPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

    useEffect(() => {
        router.push("/register")
    }, [router])
    const [formData, setFormData] = useState({
        role: "",
        experience: 3,
        zipCode: "",
        aiFamiliarity: 3
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleRangeChange = (name: string, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // 1. Generate Attendee Code (Simple 6-char random string)
        // In production, we should check for collisions, but for this prototype, collision probability is low enough
        const attendeeCode = Math.random().toString(36).substring(2, 8).toUpperCase()

        // 2. Fetch Default Event ID (For this demo, we'll create one if it doesn't exist or pick the first one)
        // In a real app, this might come from the URL or a configured default
        let eventId = localStorage.getItem("expo_event_id")

        if (!eventId) {
            const { data: events, error: eventsError } = await supabase
                .from('events')
                .select('id')
                .limit(1)

            if (events && events.length > 0) {
                eventId = events[0].id
            } else {
                // Create a default event if none exists
                const { data: newEvent, error: createError } = await supabase
                    .from('events')
                    .insert({ name: 'Queens Expo Demo' })
                    .select()
                    .single()

                if (createError) {
                    console.error("Error creating event:", createError)
                    setLoading(false)
                    alert("Failed to initialize event. Please try again.")
                    return
                }
                eventId = newEvent.id
            }
            if (eventId) localStorage.setItem("expo_event_id", eventId)
        }

        // 3. Insert Attendee
        const { data: attendee, error } = await supabase
            .from("attendees")
            .insert({
                event_id: eventId,
                attendee_code: attendeeCode,
                demographics: formData,
                total_points: 0
            })
            .select()
            .single()

        if (error) {
            console.error("Error creating attendee:", error)
            setLoading(false)
            alert("Failed to check in. Please try again.")
            return
        }

        // 4. Save to Local Storage for persistence
        localStorage.setItem("expo_attendee_id", attendee.id)
        localStorage.setItem("expo_attendee_code", attendee.attendee_code)

        // 5. Redirect to Dashboard
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[80px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[80px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-[0_0_50px_-12px_rgba(59,130,246,0.2)]">
                    <CardHeader>
                        <CardTitle className="text-3xl text-center bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent font-bold">
                            Check In
                        </CardTitle>
                        <CardDescription className="text-center">
                            Create your profile to start the quest.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <Label htmlFor="role">Current Role</Label>
                                <Input
                                    id="role"
                                    name="role"
                                    placeholder="e.g. Software Engineer, Student"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="bg-secondary/50 border-primary/10 focus:border-neon-blue transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="zipCode">Zip Code</Label>
                                <Input
                                    id="zipCode"
                                    name="zipCode"
                                    placeholder="e.g. 94105"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    required
                                    className="bg-secondary/50 border-primary/10 focus:border-neon-blue transition-colors"
                                />
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="aiFamiliarity">AI Familiarity (1-5)</Label>
                                    <span className="text-neon-blue font-bold text-lg">{formData.aiFamiliarity}</span>
                                </div>
                                <input
                                    type="range"
                                    id="aiFamiliarity"
                                    min="1"
                                    max="5"
                                    value={formData.aiFamiliarity}
                                    onChange={(e) => handleRangeChange("aiFamiliarity", parseInt(e.target.value))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-neon-blue"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>Novice</span>
                                    <span>Expert</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90 transition-opacity text-white font-bold py-6 text-lg shadow-lg shadow-neon-blue/20"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : "Start Quest"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
