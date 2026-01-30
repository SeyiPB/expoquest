"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, ClipboardCheck, Trophy, LogOut, Map, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ScavengerHuntModal } from "@/components/ScavengerHuntModal"
import { AgendaModal } from "@/components/AgendaModal"
import { Calendar } from "lucide-react"

export default function Dashboard() {
    const router = useRouter()
    const supabase = createClient()
    const [attendee, setAttendee] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>({ points: 0, vendorVisits: 0 })
    const [interests, setInterests] = useState<any[]>([])
    const [showHuntModal, setShowHuntModal] = useState(false)
    const [showAgendaModal, setShowAgendaModal] = useState(false)

    useEffect(() => {
        const id = localStorage.getItem("expo_attendee_id")
        if (!id) {
            router.push("/register")
            return
        }

        const fetchData = async () => {
            // Get attendee
            const { data: attendeeData } = await supabase.from('attendees').select('*').eq('id', id).single()
            setAttendee(attendeeData)

            if (!attendeeData) {
                // Invalid ID?
                localStorage.removeItem("expo_attendee_id")
                router.push("/register")
                return
            }

            // Get stats (this could be a view or just count queries)
            // For now, let's just use the total_points from attendee and count scans
            // Technically we need to count vendor visits specifically for the 5 booth rule
            const { count: vendorCount } = await supabase
                .from('scans')
                .select('id', { count: 'exact', head: true })
                .eq('attendee_id', id)
            // NOTE: This counts ALL scans. Ideally we join stations. But for MVP let's assume all scans are good stats.
            // If we need to be strict about "Vendor" type, we need a join query.
            // Let's do a more robust query if possible, or just trusting scan count for visual progress.

            // Actually, let's get the specific vendor count for the qualification logic
            const { data: scans } = await supabase
                .from('scans')
                .select(`
                    id,
                    station:stations (type)
                `)
                .eq('attendee_id', id)

            const realVendorCount = scans?.filter((s: any) => s.station?.type === 'vendor').length || 0;

            setStats({
                points: attendeeData.total_points,
                vendorVisits: realVendorCount
            })

            // Get full interest details (vendors)
            const { data: interestsData } = await supabase
                .from('scans')
                .select(`
                    created_at,
                    vendors:stations (
                        id,
                        name,
                        type,
                        vendor_info:vendors (*)
                    )
                `)
                .eq('attendee_id', id)

            const formattedInterests = (interestsData || [])
                .filter((s: any) => s.vendors?.type === 'vendor')
                .map((s: any) => ({
                    ...s.vendors.vendor_info[0],
                    scanned_at: s.created_at
                }))
                .filter(v => v !== undefined)

            setInterests(formattedInterests)
            setLoading(false)
        }

        fetchData()

        // Subscribe to changes?
        // Simple polling or realtime. Let's do simple poll on focus for now if needed, or just rely on page refresh.
    }, [router])

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>

    const qualified = stats.vendorVisits >= 5

    return (
        <>
            <ScavengerHuntModal isOpen={showHuntModal} onClose={() => setShowHuntModal(false)} />
            <AgendaModal isOpen={showAgendaModal} onClose={() => setShowAgendaModal(false)} />
            <div className="min-h-screen bg-black text-foreground flex flex-col pb-24">
                {/* Sticky Header */}
                <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent uppercase tracking-tighter">
                            ExpoQuest
                        </h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-white"
                        onClick={() => {
                            localStorage.removeItem("expo_attendee_id")
                            router.push("/")
                        }}
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                </header>

                <div className="p-6 pt-4 space-y-6">
                    <div>
                        <p className="text-muted-foreground text-sm">Welcome back,</p>
                        <h2 className="text-2xl font-bold text-white">{attendee?.first_name}</h2>
                        {attendee?.attendee_number && (
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 mt-2 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-[10px] font-mono text-neon-purple w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse"></span>
                                {attendee.attendee_number}
                            </div>
                        )}
                    </div>

                    {/* Points Card */}
                    <Card className="bg-gradient-to-br from-card to-secondary/50 border-neon-blue/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Trophy className="w-32 h-32" />
                        </div>
                        <CardContent className="p-6">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Points</div>
                            <div className="text-6xl font-black text-white mt-1">{stats.points}</div>
                            <Link href="/leaderboard" className="text-[10px] text-neon-green mt-4 flex items-center gap-1 hover:underline">
                                Rank: #-- • View Leaderboard <ArrowRight className="w-3 h-3" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Progress Section */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex justify-between text-xs mb-3">
                            <span className="text-muted-foreground font-medium uppercase tracking-tight">Vendor Passport</span>
                            <span className={qualified ? "text-neon-green font-bold" : "text-muted-foreground"}>
                                {stats.vendorVisits} / 5 Stations
                            </span>
                        </div>
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${qualified ? 'bg-neon-green' : 'bg-neon-blue'} transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
                                style={{ width: `${Math.min(100, (stats.vendorVisits / 5) * 100)}%` }}
                            />
                        </div>
                        {qualified ? (
                            <p className="text-[10px] text-neon-green mt-3 flex items-center gap-1 font-medium">
                                <ClipboardCheck className="w-3.5 h-3.5" /> Qualification requirement met!
                            </p>
                        ) : (
                            <p className="text-[10px] text-muted-foreground mt-3">
                                Visit {5 - stats.vendorVisits} more vendors to qualify for prizes.
                            </p>
                        )}
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => setShowHuntModal(true)}
                            variant="secondary"
                            className="h-24 flex flex-col gap-2 bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl"
                        >
                            <Map className="w-6 h-6 text-neon-purple" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Scavenger Hunt</span>
                        </Button>

                        <Button
                            onClick={() => setShowAgendaModal(true)}
                            variant="secondary"
                            className="h-24 flex flex-col gap-2 bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl"
                        >
                            <Calendar className="w-6 h-6 text-neon-teal" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Event Agenda</span>
                        </Button>
                    </div>

                    {/* My Interests Section */}
                    {interests.length > 0 && (
                        <div className="pt-2">
                            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                                <ClipboardCheck className="w-4 h-4 text-neon-blue" />
                                My Interests
                            </h3>
                            <div className="grid gap-3">
                                {interests.map((vendor, idx) => (
                                    <Card key={idx} className="bg-white/5 border-white/10 rounded-xl overflow-hidden active:scale-[0.98] transition-all">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-white text-sm">{vendor.name}</h4>
                                                {vendor.industry_category && (
                                                    <span className="text-[8px] bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded-full border border-neon-purple/30 font-bold uppercase">
                                                        {vendor.industry_category}
                                                    </span>
                                                )}
                                            </div>
                                            {vendor.solution_overview && (
                                                <p className="text-[11px] text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                                                    {vendor.solution_overview}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                                {vendor.primary_contact && <div className="flex items-center gap-1"><User className="w-3 h-3" /> {vendor.primary_contact}</div>}
                                                {vendor.email && <div className="flex items-center gap-1">✉️ {vendor.email}</div>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
