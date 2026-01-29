"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export default function ReflectionPage() {
    const router = useRouter()
    const supabase = createClient()
    const [attendeeId, setAttendeeId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const [form, setForm] = useState({
        confidence_tech_access_post: "",
        clarity_tech_pathways_post: "",
        valuable_activity: "",
        future_action: ""
    })

    useEffect(() => {
        const id = localStorage.getItem("expo_attendee_id")
        if (!id) {
            router.push("/register")
        } else {
            setAttendeeId(id)
        }
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!attendeeId) return
        setSubmitting(true)

        try {
            const { error } = await supabase
                .from('attendees')
                .update({
                    confidence_tech_access_post: parseInt(form.confidence_tech_access_post),
                    clarity_tech_pathways_post: parseInt(form.clarity_tech_pathways_post),
                    valuable_activity: form.valuable_activity,
                    future_action: form.future_action,
                })
                .eq('id', attendeeId)

            if (error) throw error
            setSubmitted(true)
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-black text-foreground flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-3xl font-bold text-neon-green mb-4">Thank You!</h1>
                <p className="text-muted-foreground mb-8">Your feedback helps us create better future events.</p>
                <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Event Reflection</h1>
                    <p className="text-muted-foreground">Tell us about your experience today.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Now that you've attended, how confident are you in accessing tech career opportunities? (1-5)</Label>
                        <Input
                            type="number" min="1" max="5" required
                            value={form.confidence_tech_access_post}
                            onChange={e => setForm({ ...form, confidence_tech_access_post: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>How clear are you now on the pathways into tech careers? (1-5)</Label>
                        <Input
                            type="number" min="1" max="5" required
                            value={form.clarity_tech_pathways_post}
                            onChange={e => setForm({ ...form, clarity_tech_pathways_post: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Which activity was most valuable?</Label>
                        <select
                            className="w-full p-2 rounded-md border bg-background"
                            required
                            value={form.valuable_activity}
                            onChange={e => setForm({ ...form, valuable_activity: e.target.value })}
                        >
                            <option value="">Select...</option>
                            <option value="Vendor booths">Vendor booths</option>
                            <option value="AI activations">AI activations</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Workshops">Workshops</option>
                            <option value="Mentorship">Mentorship</option>
                            <option value="Networking">Networking</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>One action you are more likely to take as a result of the Expo?</Label>
                        <Input
                            placeholder="e.g. apply for a program..."
                            required
                            value={form.future_action}
                            onChange={e => setForm({ ...form, future_action: e.target.value })}
                        />
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? <Loader2 className="animate-spin" /> : "Submit Feedback"}
                    </Button>
                </form>
            </div>
        </div>
    )
}
