"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Star, Gift, Crown, Trophy } from "lucide-react"

export default function PrizesPage() {
    const supabase = createClient()
    const [points, setPoints] = useState(0)

    useEffect(() => {
        const attendeeId = localStorage.getItem("expo_attendee_id")
        if (attendeeId) {
            supabase.from('attendees').select('total_points').eq('id', attendeeId).single()
                .then(({ data }) => {
                    if (data) setPoints(data.total_points)
                })
        }
    }, [supabase])

    const getTier = (pts: number) => {
        if (pts >= 1000) return { name: "Legendary", icon: Crown, color: "text-yellow-400" }
        if (pts >= 500) return { name: "Pro", icon: Trophy, color: "text-gray-300" }
        return { name: "Novice", icon: Star, color: "text-orange-400" }
    }

    const tier = getTier(points)
    const TierIcon = tier.icon

    return (
        <div className="min-h-screen p-6 bg-background text-foreground flex flex-col items-center justify-center text-center">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-neon-blue/20 blur-[50px] rounded-full" />
                <TierIcon className={`w-32 h-32 ${tier.color} relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`} />
            </div>

            <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-widest">{tier.name} Status</h1>
            <p className="text-muted-foreground mb-8">You chose your path.</p>

            <Card className="w-full max-w-sm mb-8 border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                        {points}
                    </CardTitle>
                    <CardDescription>Total Points Earned</CardDescription>
                </CardHeader>
            </Card>

            <div className="space-y-4 w-full max-w-sm">
                <div className={`p-4 rounded-xl border flex items-center gap-4 text-left transition-all ${points >= 500 ? "bg-neon-blue/10 border-neon-blue" : "bg-card border-white/5 opacity-50"}`}>
                    <div className="bg-neon-blue/20 p-2 rounded-lg">
                        <Gift className="text-neon-blue" />
                    </div>
                    <div>
                        <h3 className="font-bold">Pro Swag Bag</h3>
                        <p className="text-xs text-muted-foreground">Unlock at 500 pts</p>
                    </div>
                </div>

                <div className={`p-4 rounded-xl border flex items-center gap-4 text-left transition-all ${points >= 1000 ? "bg-yellow-500/10 border-yellow-500" : "bg-card border-white/5 opacity-50"}`}>
                    <div className="bg-yellow-500/20 p-2 rounded-lg">
                        <Crown className="text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="font-bold">VIP Access Pass</h3>
                        <p className="text-xs text-muted-foreground">Unlock at 1000 pts</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
