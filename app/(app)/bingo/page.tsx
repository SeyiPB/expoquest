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
                router.push("/check-in")
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
                            className={`border rounded-2xl p-4 space-y-3 transition-all ${isCompleted
                                ? "bg-neon-blue/5 border-neon-blue/20 opacity-80"
                                : "bg-white/5 border-white/10 active:scale-[0.98]"
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${isCompleted
                                    ? "bg-neon-blue/20 text-neon-blue border-neon-blue/30"
                                    : "bg-neon-blue/10 text-neon-blue border-neon-blue/20"
                                    }`}>
                                    {quest.category}
                                </span>
                                <div className="text-right">
                                    <div className={`text-xl font-black tracking-tight ${isCompleted ? 'text-neon-blue' : 'text-white'}`}>
                                        {isCompleted ? <Check className="w-6 h-6 inline-block" /> : quest.points}
                                    </div>
                                    {!isCompleted && <div className="text-[8px] font-black text-neon-purple uppercase tracking-tighter">Points</div>}
                                </div>
                            </div>

                            <div>
                                <h3 className={`text-sm font-bold mb-1 ${isCompleted ? 'text-white/70' : 'text-white'}`}>{quest.title}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed font-medium">
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
                                    className={`h-8 text-[10px] font-black uppercase tracking-widest transition-all ${isCompleted
                                        ? "text-neon-blue bg-neon-blue/10"
                                        : "border-white/10 hover:bg-white/5 active:bg-neon-blue active:text-white active:border-neon-blue"
                                        }`}
                                >
                                    {isCompleted ? "Successfully Completed" : "Mark Complete"}
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </main>
        </div>
    )
}
