"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Lock, Trophy, Map as MapIcon, ClipboardList, Info, ClipboardCheck } from "lucide-react"
import { QuestCompletionModal } from "@/components/QuestCompletionModal"

export default function BingoPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [attendee, setAttendee] = useState<any>(null)
    const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set())
    const [selectedQuest, setSelectedQuest] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const quests = [
        {
            id: 'q1',
            title: "Welcome Session Hunt",
            description: "Attend the Tech Equity Award Honoree announcement and write down the name of the person who accepted the award.",
            points: 30,
            category: "Engagement"
        },
        {
            id: 'q2',
            title: "Sponsor Scavenger",
            description: "Find and visit the AT&T Laptop Distribution area outside the Auditorium and identify their partner organization mentioned in the agenda.",
            points: 35,
            category: "Location & Partner Discovery"
        },
        {
            id: 'q3',
            title: "Mentorship Master",
            description: "Attend any one of the Mentoring Lounge panels (at 11am, 12pm, or 1pm) and summarize one key piece of career or tech advice you heard.",
            points: 45,
            category: "Deep Learning & Reflection"
        },
        {
            id: 'q4',
            title: "Tech Explorer",
            description: "Locate a vendor or tech partner in the Expo/Demo Area and briefly describe the most innovative technology or demo they are showcasing.",
            points: 20,
            category: "Hands-on Exploration"
        },
        {
            id: 'q5',
            title: "Character Collector",
            description: "Witness the BP character reveal during Hiphop Gamer's remarks and describe one unique feature of the revealed character.",
            points: 50,
            category: "Engagement"
        },
        {
            id: 'q6',
            title: "NYSCI Cityworks Challenge",
            description: "List at least three of the main themes of Cityworks?",
            points: 20,
            category: "Sponsor Scavenger"
        }
    ]

    useEffect(() => {
        const fetchData = async () => {
            const attendeeId = localStorage.getItem("expo_attendee_id")
            if (!attendeeId) {
                router.push("/register")
                return
            }

            // Fetch Attendee
            const { data: att } = await supabase.from('attendees').select('*').eq('id', attendeeId).single()
            if (att) setAttendee(att)

            // Fetch Submissions
            const { data: subs } = await supabase
                .from('quest_submissions')
                .select('quest_id')
                .eq('attendee_id', attendeeId)

            if (subs) {
                setCompletedQuests(new Set(subs.map(s => s.quest_id)))
            }

            setLoading(false)
        }
        fetchData()
    }, [router, supabase])

    const handleQuestSuccess = (questId: string) => {
        setCompletedQuests(prev => new Set([...Array.from(prev), questId]))
    }

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-black text-foreground flex flex-col pb-24">
            <QuestCompletionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                quest={selectedQuest}
                onSuccess={handleQuestSuccess}
            />

            <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="text-muted-foreground hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent uppercase tracking-tighter">
                    Quests
                </h1>
            </header>

            <main className="p-6 pt-4 space-y-4">
                <div className="mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <ClipboardList className="w-5 h-5 text-neon-blue" />
                        <h2 className="text-lg font-bold text-white uppercase tracking-tight">Your Quest Log</h2>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Complete these challenges during the expo to earn bonus points and unlock rewards!</p>
                </div>

                {quests.map((quest) => {
                    const isCompleted = completedQuests.has(quest.id)
                    return (
                        <div
                            key={quest.id}
                            className={`glass-card transition-all ${isCompleted
                                ? "opacity-60 grayscale-[0.5]"
                                : "active:scale-[0.99]"
                                } shadow-lg`}
                        >
                            <div className="p-5 flex flex-col gap-4">
                                <div className="flex justify-between items-start gap-4">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded border ${isCompleted
                                        ? "bg-neon-blue/20 text-neon-blue border-neon-blue/30"
                                        : "bg-white/10 text-white/70 border-white/20"
                                        }`}>
                                        {quest.category}
                                    </span>
                                    <div className="text-right shrink-0">
                                        <div className={`text-2xl font-black tracking-tighter leading-none ${isCompleted ? 'text-neon-green' : 'text-white'}`}>
                                            {isCompleted ? <Check className="w-6 h-6 inline-block" /> : quest.points}
                                        </div>
                                        {!isCompleted && <div className="text-[8px] font-black text-neon-blue uppercase tracking-widest mt-0.5">Points</div>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className={`text-[15px] font-bold leading-snug ${isCompleted ? 'text-white/60' : 'text-white'}`}>{quest.title}</h3>
                                    <p className="text-[12px] text-gray-400 leading-relaxed font-medium line-clamp-3">
                                        {quest.description}
                                    </p>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <Button
                                        size="sm"
                                        variant={isCompleted ? "ghost" : "outline"}
                                        disabled={isCompleted}
                                        onClick={() => {
                                            setSelectedQuest(quest)
                                            setIsModalOpen(true)
                                        }}
                                        className={`h-9 w-full rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${isCompleted
                                            ? "text-neon-green bg-neon-green/10 border-none"
                                            : "border-white/10 hover:bg-white/10 hover:border-white/20 active:bg-neon-blue active:text-white active:border-neon-blue shadow-sm"
                                            }`}
                                    >
                                        {isCompleted ? "Goal Achieved" : "Mark Complete"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </main>
        </div>
    )
}
