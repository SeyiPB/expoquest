"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, ClipboardCheck, Trophy, LogOut, Map, User } from "lucide-react"
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
            <div className="min-h-screen bg-black text-foreground flex flex-col p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">Queens Tech Expo</h1>
                        <div className="flex flex-col gap-1 mt-1">
                            <p className="text-muted-foreground text-sm">Welcome, {attendee?.first_name}</p>
                            {attendee?.attendee_number && (
                                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-[10px] font-mono text-neon-purple w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse"></span>
                                    {attendee.attendee_number}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Points Card */}
                <Card className="bg-card border-neon-blue/50 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-32 h-32" />
                    </div>
                    <CardContent className="p-4 sm:p-6">
                        <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Points</div>
                        <div className="text-5xl xs:text-6xl sm:text-7xl font-black text-white mt-2">{stats.points}</div>
                        <p className="text-[10px] sm:text-xs text-neon-green mt-2">Rank: #-- (View Leaderboard)</p>
                    </CardContent>
                </Card>

                {/* Progress */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Vendor Passport</span>
                        <span className={qualified ? "text-neon-green" : "text-muted-foreground"}>
                            {stats.vendorVisits} / 5 Visited
                        </span>
                    </div>
                    <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full ${qualified ? 'bg-neon-green' : 'bg-neon-blue'} transition-all duration-1000`}
                            style={{ width: `${Math.min(100, (stats.vendorVisits / 5) * 100)}%` }}
                        />
                    </div>
                    {qualified && <p className="text-xs text-neon-green mt-2 flex items-center gap-1"><ClipboardCheck className="w-4 h-4" /> Qualification requirement met!</p>}
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                    <Link href="/scan" className="col-span-2">
                        <Button className="w-full h-32 flex flex-col gap-3 text-lg bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0">
                            <QrCode className="w-10 h-10" />
                            Scan Station
                        </Button>
                    </Link>

                    <Button
                        onClick={() => setShowHuntModal(true)}
                        variant="secondary"
                        className="col-span-2 h-20 flex flex-col gap-2 border-neon-purple/30 hover:bg-neon-purple/10"
                    >
                        <Map className="w-6 h-6 text-neon-purple" />
                        Scavenger Hunt
                    </Button>

                    <Button
                        onClick={() => setShowAgendaModal(true)}
                        variant="secondary"
                        className="col-span-2 h-20 flex flex-col gap-2 border-neon-teal/30 hover:bg-neon-teal/10"
                    >
                        <Calendar className="w-6 h-6 text-neon-teal" />
                        Event Agenda
                    </Button>

                    <Link href="/leaderboard">
                        <Button variant="secondary" className="w-full h-24 flex flex-col gap-2">
                            <Trophy className="w-6 h-6" />
                            Leaderboard
                        </Button>
                    </Link>

                    <Link href="/reflection">
                        <Button variant="secondary" className="w-full h-24 flex flex-col gap-2">
                            <ClipboardCheck className="w-6 h-6" />
                            Leave a Review
                        </Button>
                    </Link>
                </div>

                {/* My Interests Section */}
                {interests.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-neon-blue" />
                            My Interests
                        </h3>
                        <div className="grid gap-3">
                            {interests.map((vendor, idx) => (
                                <Card key={idx} className="bg-card/50 border-white/10">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white">{vendor.name}</h4>
                                            {vendor.industry_category && (
                                                <span className="text-[10px] bg-neon-purple/20 text-neon-purple px-2 py-1 rounded-full border border-neon-purple/30">
                                                    {vendor.industry_category}
                                                </span>
                                            )}
                                        </div>
                                        {vendor.solution_overview && (
                                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                                {vendor.solution_overview}
                                            </p>
                                        )}
                                        <div className="flex flex-col gap-1 text-xs text-gray-400">
                                            {vendor.primary_contact && <div className="flex items-center gap-2"><User className="w-3 h-3" /> {vendor.primary_contact}</div>}
                                            {vendor.email && <div>✉️ {vendor.email}</div>}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    variant="ghost"
                    className="mt-8 text-muted-foreground hover:text-white"
                    onClick={() => {
                        localStorage.removeItem("expo_attendee_id")
                        router.push("/")
                    }}
                >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
            </div>
        </>
    )
}
