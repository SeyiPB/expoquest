"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Lock, Trophy } from "lucide-react"

export default function BingoPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [stations, setStations] = useState<any[]>([])
    const [scans, setScans] = useState<Set<string>>(new Set())
    const [attendee, setAttendee] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            const attendeeId = localStorage.getItem("expo_attendee_id")
            const eventId = localStorage.getItem("expo_event_id")

            if (!attendeeId || !eventId) {
                router.push("/check-in")
                return
            }

            // Fetch Attendee
            const { data: att } = await supabase.from('attendees').select('*').eq('id', attendeeId).single()
            if (att) setAttendee(att)

            // Fetch Stations
            const { data: st } = await supabase.from('stations').select('*').eq('event_id', eventId).order('created_at')
            if (st) setStations(st)

            // Fetch Scans
            const { data: s } = await supabase.from('scans').select('station_id').eq('attendee_id', attendeeId)
            if (s) {
                setScans(new Set(s.map(i => i.station_id)))
            }

            setLoading(false)
        }
        fetchData()
    }, [router, supabase])

    if (loading) return <div className="p-8 text-center">Loading Bingo...</div>

    // Calculate Progress
    const totalStations = stations.length
    const visitedStations = scans.size
    const progress = totalStations === 0 ? 0 : Math.round((visitedStations / totalStations) * 100)

    return (
        <div className="min-h-screen p-4 bg-background text-foreground pb-24">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                    Expo Bingo
                </h1>
            </header>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-4 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-neon-blue to-neon-green transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Bingo Grid */}
            <div className="grid grid-cols-2 gap-4">
                {stations.map((station, index) => {
                    const isVisited = scans.has(station.id)
                    return (
                        <div
                            key={station.id}
                            className={`aspect-square rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 border transition-all ${isVisited
                                    ? "bg-neon-blue/20 border-neon-blue text-neon-blue shadow-[0_0_15px_rgba(var(--neon-blue),0.2)]"
                                    : "bg-card border-white/5 opacity-80"
                                }`}
                        >
                            {isVisited ? (
                                <Check className="w-8 h-8" />
                            ) : (
                                <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                                </div>
                            )}
                            <span className="text-sm font-medium line-clamp-2 leading-tight">
                                {station.name}
                            </span>
                            {isVisited && <span className="text-xs font-bold">+100pts</span>}
                        </div>
                    )
                })}
            </div>

            {/* Completion Prize Teaser */}
            {progress === 100 && (
                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl text-center animate-pulse">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-yellow-500">All Stations Cleared!</h3>
                    <p className="text-sm text-yellow-200/80">Head to the exit booth to claim a special prize.</p>
                </div>
            )}
        </div>
    )
}
