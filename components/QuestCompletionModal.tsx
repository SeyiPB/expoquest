"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
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

const CITYWORKS_THEMES = [
    "transportation",
    "water",
    "waste water",
    "wastewater",
    "sanitation",
    "construction",
    "urban development",
    "integrated systems"
]

const CHARACTER_FEATURES = [
    "gold chain",
    "red glasses",
    "glasses",
    "durag",
    "fat",
    "orc",
    "mutant",
    "socks",
    "elf ears",
    "fangs",
    "84",
    "white elbow pads",
    "gold chain necklace",
    "large muscular orc-like humanoid with a tanky build",
    "prominent upward tusks",
    "stern aggressive expression",
    "red-tinted sunglasses",
    "red bandana headwrap",
    "massive spiked shoulder pads with skull details",
    "heavy metal chains across the shoulders",
    "black football jersey with the number 84",
    "red football pants",
    "reinforced football-style padding",
    "thick gold chain necklace",
    "spiked wrist bracers",
    "skull-themed knee guards",
    "white arm wrap on one arm",
    "red-and-white cleats",
    "metal studs and spikes throughout the armor",
    "fantasy and american football hybrid style",
    "brute enforcer power-player archetype",
    "intimidating boss-like presence"
]

export function QuestCompletionModal({ isOpen, onClose, quest, onSuccess }: QuestCompletionModalProps) {
    const [answer, setAnswer] = useState("")
    const [answers, setAnswers] = useState(["", "", ""])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Reset state when quest changes
    useEffect(() => {
        if (quest) {
            setAnswer("")
            setAnswers(["", "", ""])
            setError(null)
        }
    }, [quest])

    if (!quest) return null

    const isNysciQuest = quest.id === 'q6'
    const isCharacterQuest = quest.id === 'q5'
    const isMultiInput = isNysciQuest || isCharacterQuest

    const validateNysciAnswers = () => {
        // Clean and normalize answers
        const cleanedAnswers = answers.map(a =>
            a.trim().toLowerCase().replace(/\s+/g, ' ')
        ).filter(a => a !== "")

        const uniqueAnswers = Array.from(new Set(cleanedAnswers))

        if (uniqueAnswers.length < 3) {
            throw new Error("Please provide 3 unique themes from the Cityworks exhibit.")
        }

        const validMatches = uniqueAnswers.filter(a => {
            // Check for exact match or normalized variations (e.g. "wastewater" vs "waste water")
            return CITYWORKS_THEMES.includes(a) ||
                CITYWORKS_THEMES.includes(a.replace(/\s/g, '')) ||
                CITYWORKS_THEMES.some(theme => theme.replace(/\s/g, '') === a.replace(/\s/g, ''))
        })

        if (validMatches.length < 3) {
            throw new Error("Some of your answers are incorrect. Please check the themes at the NYSCI exhibit and try again.")
        }

        return uniqueAnswers.join(", ")
    }

    const validateCharacterAnswers = () => {
        const cleanedAnswers = answers.map(a =>
            a.trim().toLowerCase().replace(/\s+/g, ' ')
        ).filter(a => a !== "")

        const uniqueAnswers = Array.from(new Set(cleanedAnswers))

        if (uniqueAnswers.length < 3) {
            throw new Error("Please provide 3 unique features of the BP character.")
        }

        const validMatches = uniqueAnswers.filter(a => {
            return CHARACTER_FEATURES.includes(a) ||
                CHARACTER_FEATURES.some(feat => feat.includes(a) && a.length > 3)
        })

        if (validMatches.length < 3) {
            throw new Error("Some of your answers don't match the character's features. Please look closer and try again.")
        }

        return uniqueAnswers.join(", ")
    }

    const handleSubmit = async () => {
        setError(null)
        let finalAnswer = ""
        let isValidationError = false

        try {
            if (isNysciQuest) {
                isValidationError = true
                finalAnswer = validateNysciAnswers()
                isValidationError = false
            } else if (isCharacterQuest) {
                isValidationError = true
                finalAnswer = validateCharacterAnswers()
                isValidationError = false
            } else {
                const cleanedAnswer = answer.trim().toLowerCase()

                if (quest.id === 'q1') {
                    if (cleanedAnswer !== "danny rojas") {
                        isValidationError = true
                        throw new Error("Incorrect name. Please check the person who accepted the award and try again.")
                    }
                } else if (quest.id === 'q2') {
                    if (cleanedAnswer !== "at&t") {
                        isValidationError = true
                        throw new Error("Incorrect organization. Please check the partner mentioned in the agenda.")
                    }
                }

                if (!answer.trim()) {
                    isValidationError = true
                    throw new Error("Please provide an answer before submitting.")
                }
                finalAnswer = answer.trim()
            }

            setSubmitting(true)
            const attendeeId = localStorage.getItem("expo_attendee_id")
            if (!attendeeId) throw new Error("Attendee ID not found")

            // 1. Record Submission
            const { error: submitError } = await supabase
                .from('quest_submissions')
                .insert({
                    attendee_id: attendeeId,
                    quest_id: quest.id,
                    answer: finalAnswer,
                    points_earned: quest.points
                })

            if (submitError) {
                if (submitError.code === '23505') {
                    isValidationError = true
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
            setAnswers(["", "", ""])
            onSuccess(quest.id)
            onClose()

        } catch (err: any) {
            if (!isValidationError) {
                console.error("Quest submission error:", err)
            }
            setError(err.message || "Something went wrong. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers]
        newAnswers[index] = value
        setAnswers(newAnswers)
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
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
                        {isNysciQuest ? "List 3 Cityworks Themes" :
                            isCharacterQuest ? "List 3 Character Features" : "Your Answer"}
                    </label>

                    {isMultiInput ? (
                        <div className="space-y-3">
                            {answers.map((val, idx) => (
                                <Input
                                    key={idx}
                                    placeholder={isNysciQuest ? `Theme ${idx + 1}...` : `Feature ${idx + 1}...`}
                                    className="bg-white/5 border-white/10 rounded-xl focus:ring-neon-blue/50 text-white placeholder:text-gray-600 h-12"
                                    value={val}
                                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                />
                            ))}
                        </div>
                    ) : quest.id === 'q1' || quest.id === 'q2' ? (
                        <Input
                            placeholder="Type your answer here..."
                            className="bg-white/5 border-white/10 rounded-xl focus:ring-neon-blue/50 text-white placeholder:text-gray-600 h-12"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                    ) : (
                        <Textarea
                            placeholder="Type your answer here..."
                            className="bg-white/5 border-white/10 rounded-2xl min-h-[120px] focus:ring-neon-blue/50 text-white placeholder:text-gray-600"
                            value={answer}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
                        />
                    )}

                    {error && <p className="text-xs text-red-400 px-1 font-medium leading-relaxed">{error}</p>}
                </div>

                <div className="flex gap-3 pt-2">
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
