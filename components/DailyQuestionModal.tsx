"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import confetti from "canvas-confetti"

interface DailyQuestionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (pointsEarned: number) => void
}

export function DailyQuestionModal({ isOpen, onClose, onSuccess }: DailyQuestionModalProps) {
    const [answer, setAnswer] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const handleSubmit = async () => {
        if (!answer.trim()) {
            setError("Please share your thoughts before submitting.")
            return
        }

        setError(null)
        setSubmitting(true)

        try {
            const attendeeId = localStorage.getItem("expo_attendee_id")
            if (!attendeeId) throw new Error("Attendee ID not found")

            const points = 100

            // 1. Record Submission
            const { error: submitError } = await supabase
                .from('quest_submissions')
                .insert({
                    attendee_id: attendeeId,
                    quest_id: 'daily_divide', // Special ID for this quest
                    answer: answer.trim(),
                    points_earned: points
                })

            if (submitError) {
                if (submitError.code === '23505') {
                    throw new Error("You have already answered today's question!")
                }
                throw submitError
            }

            // 2. Update Total Points
            const { data: attendee, error: fetchError } = await supabase
                .from('attendees')
                .select('total_points')
                .eq('id', attendeeId)
                .single()

            if (fetchError) throw fetchError

            const newTotal = (attendee.total_points || 0) + points
            const { error: updateError } = await supabase
                .from('attendees')
                .update({ total_points: newTotal })
                .eq('id', attendeeId)

            if (updateError) throw updateError

            // 3. Log Points
            await supabase.from('points_log').insert({
                attendee_id: attendeeId,
                amount: points,
                reason: "Daily Question: Digital Divide"
            })

            // Success Animation
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#a855f7', '#3b82f6', '#10b981']
            })

            onSuccess(points)
            setAnswer("")
            onClose()

        } catch (err: any) {
            setError(err.message || "Failed to submit. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Question for Today">
            <div className="space-y-6 text-white pb-4">
                <div className="bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 rounded-2xl p-6 text-center">
                    <Sparkles className="w-8 h-8 text-neon-yellow mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white leading-tight">
                        How do we conquer the digital divide?
                    </h3>
                    <p className="text-xs text-muted-foreground mt-3 uppercase tracking-widest font-black">
                        Earn 100 Points
                    </p>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
                        Your Response
                    </label>
                    <Textarea
                        placeholder="Share your ideas on how to ensure everyone has access to technology and the skills to use it..."
                        className="bg-white/5 border-white/10 rounded-2xl min-h-[160px] focus:ring-neon-blue/50 text-white placeholder:text-gray-600 leading-relaxed"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                    {error && <p className="text-xs text-red-400 px-1 font-medium">{error}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]"
                    >
                        Maybe Later
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-[2] h-12 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-neon-purple/20"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <span className="flex items-center gap-2">
                                <Send className="w-4 h-4" /> Submit Response
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
