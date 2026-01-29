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
        <div className="min-h-screen bg-black text-foreground flex flex-col p-6">
            <header className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-bold">Leaderboard</h1>
            </header>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">Loading...</div>
            ) : (
                <div className="space-y-4">
                    {leaderboard.map((entry, index) => (
                        <div
                            key={entry.id}
                            className={`flex items-center justify-between p-4 rounded-xl border ${index === 0 ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' :
                                    index === 1 ? 'bg-gray-400/10 border-gray-400 text-gray-400' :
                                        index === 2 ? 'bg-orange-700/10 border-orange-700 text-orange-700' :
                                            'bg-card border-border'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-lg w-8 text-center">{index + 1}</span>
                                <div>
                                    <div className="font-semibold text-white">{entry.first_name} {entry.last_name.charAt(0)}.</div>
                                    <div className="text-xs text-muted-foreground">{entry.vendor_visits} Booths visited</div>
                                </div>
                            </div>
                            <div className="font-bold text-xl">
                                {entry.total_points}
                            </div>
                        </div>
                    ))}

                    {leaderboard.length === 0 && (
                        <div className="text-center text-muted-foreground py-10">
                            No active players yet. Be the first!
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
