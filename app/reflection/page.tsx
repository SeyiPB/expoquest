"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"

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
        <div className="min-h-screen bg-black text-foreground flex flex-col pb-24">
            <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="text-muted-foreground hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent uppercase tracking-tighter">
                    Event Reflection
                </h1>
            </header>

            <main className="p-6 pt-4 max-w-md mx-auto w-full">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">Your Voice Matters</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Tell us about your experience today.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-tight text-gray-400">Post-Expo Confidence *</Label>
                            <p className="text-[10px] text-muted-foreground leading-tight mb-2">How confident are you in accessing tech career opportunities now? (1-5)</p>
                            <Input
                                type="number" min="1" max="5" required
                                value={form.confidence_tech_access_post}
                                onChange={e => setForm({ ...form, confidence_tech_access_post: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-neon-blue h-12 text-lg font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-tight text-gray-400">Pathway Clarity *</Label>
                            <p className="text-[10px] text-muted-foreground leading-tight mb-2">How clear are you now on the pathways into tech careers? (1-5)</p>
                            <Input
                                type="number" min="1" max="5" required
                                value={form.clarity_tech_pathways_post}
                                onChange={e => setForm({ ...form, clarity_tech_pathways_post: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-neon-blue h-12 text-lg font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-tight text-gray-400">MVP Activity *</Label>
                            <p className="text-[10px] text-muted-foreground leading-tight mb-2">Which activity was most valuable to you?</p>
                            <select
                                className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-3 text-sm focus:border-neon-blue focus:outline-none appearance-none"
                                required
                                value={form.valuable_activity}
                                onChange={e => setForm({ ...form, valuable_activity: e.target.value })}
                            >
                                <option value="" className="bg-black">Select...</option>
                                <option value="Vendor booths" className="bg-black">Vendor booths</option>
                                <option value="AI activations" className="bg-black">AI activations</option>
                                <option value="Gaming" className="bg-black">Gaming</option>
                                <option value="Workshops" className="bg-black">Workshops</option>
                                <option value="Mentorship" className="bg-black">Mentorship</option>
                                <option value="Networking" className="bg-black">Networking</option>
                                <option value="Other" className="bg-black">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-tight text-gray-400">Next Action Step *</Label>
                            <p className="text-[10px] text-muted-foreground leading-tight mb-2">One action you are likely to take as a result of the Expo?</p>
                            <Input
                                placeholder="e.g. apply for a program..."
                                required
                                value={form.future_action}
                                onChange={e => setForm({ ...form, future_action: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-neon-blue h-12"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-14 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-neon-blue/20"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : "Submit Reflection"}
                    </Button>
                </form>
            </main>
        </div>
    )
}
