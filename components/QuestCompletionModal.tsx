"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import confetti from "canvas-confetti"

interface QuestCompletionModalProps {
    isOpen: boolean
    onClose: () => void
    quest: {
        id: string
        title: string
        description: string
        points: number
    } | null
    onSuccess: (questId: string) => void
}

export function QuestCompletionModal({ isOpen, onClose, quest, onSuccess }: QuestCompletionModalProps) {
    const [answer, setAnswer] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    if (!quest) return null

    const handleSubmit = async () => {
        if (!answer.trim()) {
            setError("Please provide an answer before submitting.")
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            const attendeeId = localStorage.getItem("expo_attendee_id")
            if (!attendeeId) throw new Error("Attendee ID not found")

            // 1. Record Submission
            const { error: submitError } = await supabase
                .from('quest_submissions')
                .insert({
                    attendee_id: attendeeId,
                    quest_id: quest.id,
                    answer: answer,
                    points_earned: quest.points
                })

            if (submitError) {
                if (submitError.code === '23505') {
                    throw new Error("You have already completed this quest!")
                }
                throw submitError
            }

            // 2. Update Points
            const { data: attendee, error: fetchError } = await supabase
                .from('attendees')
                .select('total_points')
                .eq('id', attendeeId)
                .single()

            if (fetchError) throw fetchError

            const newTotal = (attendee.total_points || 0) + quest.points
            const { error: updateError } = await supabase
                .from('attendees')
                .update({ total_points: newTotal })
                .eq('id', attendeeId)

            if (updateError) throw updateError

            // 3. Log Points
            await supabase.from('points_log').insert({
                attendee_id: attendeeId,
                amount: quest.points,
                reason: `Quest: ${quest.title}`
            })

            // Success!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#8b5cf6', '#10b981']
            })

            setAnswer("")
            onSuccess(quest.id)
            onClose()

        } catch (err: any) {
            console.error("Quest submission error:", err)
            setError(err.message || "Something went wrong. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Complete Quest">
            <div className="space-y-6 text-white pb-4">
                <div className="bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border border-white/10 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight">{quest.title}</h3>
                        <div className="text-right">
                            <span className="text-neon-blue font-black text-xl">+{quest.points}</span>
                            <span className="text-[8px] font-black text-neon-blue uppercase block tracking-tighter">Points</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{quest.description}</p>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Your Answer</label>
                    <Textarea
                        placeholder="Type your answer here..."
                        className="bg-white/5 border-white/10 rounded-2xl min-h-[120px] focus:ring-neon-blue/50 text-white placeholder:text-gray-600"
                        value={answer}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
                    />
                    {error && <p className="text-xs text-red-400 px-1 font-medium">{error}</p>}
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-[2] h-12 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-neon-blue/20"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <span className="flex items-center gap-2">
                                <Send className="w-4 h-4" /> Submit Quest
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
