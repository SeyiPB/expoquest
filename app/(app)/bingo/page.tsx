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
        <div className="min-h-screen bg-black text-foreground flex flex-col pb-24">
            <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="text-muted-foreground hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent uppercase tracking-tighter">
                    Bingo Passport
                </h1>
            </header>

            <main className="p-6 pt-4">
                {/* Progress Bar */}
                <div className="mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between text-xs mb-3 text-muted-foreground uppercase tracking-widest font-bold">
                        <span>Completion Status</span>
                        <span className="text-neon-green">{progress}%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-neon-blue to-neon-green transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Bingo Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {stations.map((station, index) => {
                        const isVisited = scans.has(station.id)
                        return (
                            <div
                                key={station.id}
                                className={`aspect-square rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 border transition-all active:scale-95 ${isVisited
                                        ? "bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border-neon-blue shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                        : "bg-white/5 border-white/10 opacity-60"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isVisited ? 'bg-neon-blue border-neon-blue text-black' : 'border-dashed border-white/20 text-white/20'
                                    }`}>
                                    {isVisited ? <Check className="w-6 h-6" /> : <span className="text-lg font-black">{index + 1}</span>}
                                </div>
                                <div>
                                    <span className={`text-[11px] font-bold uppercase tracking-tight block leading-tight ${isVisited ? 'text-white' : 'text-muted-foreground'}`}>
                                        {station.name}
                                    </span>
                                    {isVisited && <span className="text-[9px] font-black text-neon-green mt-1 uppercase tracking-widest">+100 PTS</span>}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Completion Prize Teaser */}
                {progress === 100 && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl text-center shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                        <h3 className="text-xl font-black text-yellow-500 uppercase tracking-tighter italic">BINGO!</h3>
                        <p className="text-xs text-yellow-200/80 font-medium">Head to the exit booth for your prize!</p>
                    </div>
                )}
            </main>
        </div>
    )
}
