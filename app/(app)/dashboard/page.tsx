"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Scan, Users, Trophy } from "lucide-react"

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()
    const [attendee, setAttendee] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAttendee = async () => {
            const attendeeId = localStorage.getItem("expo_attendee_id")
            if (!attendeeId) {
                router.push("/check-in")
                return
            }

            const { data, error } = await supabase
                .from("attendees")
                .select("*")
                .eq("id", attendeeId)
                .single()

            if (error || !data) {
                console.error("Error fetching attendee", error)
                router.push("/check-in")
                return
            }

            setAttendee(data)
            setLoading(false)
        }

        fetchAttendee()
    }, [router, supabase])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 bg-background text-foreground pb-24">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                    ExpoQuest
                </h1>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Code:</span>
                    <span className="font-mono font-bold text-neon-blue">{attendee.attendee_code}</span>
                </div>
            </header>

            <section className="mb-8 text-center pt-8 pb-12 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-neon-purple/20 rounded-full blur-[60px] -z-10" />
                <span className="text-muted-foreground text-sm uppercase tracking-widest">Total Points</span>
                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mt-2 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {attendee.total_points}
                </div>
            </section>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <Button
                    className="h-32 flex flex-col gap-2 bg-secondary/30 border border-primary/20 hover:bg-secondary/50"
                    onClick={() => router.push('/scan')}
                >
                    <Scan className="w-8 h-8 text-neon-blue" />
                    <span className="text-lg font-bold">Scan Station</span>
                </Button>
                <Button
                    className="h-32 flex flex-col gap-2 bg-secondary/30 border border-primary/20 hover:bg-secondary/50"
                    onClick={() => router.push('/bingo')}
                >
                    <Trophy className="w-8 h-8 text-neon-green" />
                    <span className="text-lg font-bold">Bingo Card</span>
                </Button>
            </div>
        </div>
    )
}
