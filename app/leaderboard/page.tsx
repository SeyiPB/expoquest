"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Medal } from "lucide-react"

export default function LeaderboardPage() {
    const router = useRouter()
    const supabase = createClient()
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('total_points', { ascending: false })
                .limit(20)

            if (!error && data) {
                setLeaderboard(data)
            }
            setLoading(false)
        }
        fetchLeaderboard()
    }, [])

    return (
        <div className="min-h-screen bg-black text-foreground flex flex-col pb-24">
            <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="text-muted-foreground hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent italic uppercase tracking-tighter">
                    Global Rankings
                </h1>
            </header>

            <main className="p-6 pt-4">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map((entry, index) => {
                            const isTop3 = index < 3;
                            return (
                                <div
                                    key={entry.id}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] ${index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' :
                                            index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-transparent border-gray-400/50 shadow-[0_0_15px_rgba(156,163,175,0.1)]' :
                                                index === 2 ? 'bg-gradient-to-r from-orange-700/20 to-transparent border-orange-700/50 shadow-[0_0_15px_rgba(194,65,12,0.1)]' :
                                                    'bg-white/5 border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-yellow-500 text-black' :
                                                index === 1 ? 'bg-gray-400 text-black' :
                                                    index === 2 ? 'bg-orange-700 text-white' :
                                                        'bg-white/10 text-white'
                                            }`}>
                                            {isTop3 ? <Trophy className="w-5 h-5 text-current" /> : index + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">
                                                {entry.first_name} {entry.last_name.charAt(0)}.
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                                {entry.vendor_visits} Stations • LVL {Math.floor(entry.total_points / 500) + 1}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-xl bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                                            {entry.total_points}
                                        </div>
                                        <div className="text-[8px] text-neon-blue font-bold uppercase tracking-widest">Points</div>
                                    </div>
                                </div>
                            );
                        })}

                        {leaderboard.length === 0 && (
                            <div className="text-center text-muted-foreground py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">No active players yet.</p>
                                <p className="text-xs">Be the first to claim the #1 spot!</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
