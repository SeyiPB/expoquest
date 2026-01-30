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
import { HackAIthonModal } from "@/components/HackAIthonModal"
import { MentoringLoungeModal } from "@/components/MentoringLoungeModal"
import { Calendar, Sparkles, Brain, Users } from "lucide-react"

export default function Dashboard() {
    const router = useRouter()
    const supabase = createClient()
    const [attendee, setAttendee] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>({ points: 0, vendorVisits: 0 })
    const [interests, setInterests] = useState<any[]>([])
    const [showHuntModal, setShowHuntModal] = useState(false)
    const [showAgendaModal, setShowAgendaModal] = useState(false)
    const [showHackModal, setShowHackModal] = useState(false)
    const [showMentoringModal, setShowMentoringModal] = useState(false)

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
                .filter((s: any) => s.vendors?.type === 'vendor' && s.vendors.vendor_info && s.vendors.vendor_info.length > 0)
                .map((s: any) => ({
                    ...s.vendors.vendor_info[0],
                    scanned_at: s.created_at
                }))

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
            <HackAIthonModal isOpen={showHackModal} onClose={() => setShowHackModal(false)} />
            <MentoringLoungeModal isOpen={showMentoringModal} onClose={() => setShowMentoringModal(false)} />
            <div className="min-h-screen bg-black text-foreground flex flex-col pb-24">
                {/* Sticky Header */}
                <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent uppercase tracking-tighter">
                            Queens Expo
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
                        <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-1">Live Participant Board</p>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            {attendee?.first_name} <span className="w-2 h-2 rounded-full bg-neon-green"></span>
                        </h2>
                        {attendee?.attendee_number && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-[15px] font-mono font-bold text-neon-purple w-fit">
                                {attendee.attendee_number}
                            </div>
                        )}
                    </div>

                    {/* Side Attractions Section */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Side Attractions</h3>
                        <div className="grid gap-3">
                            <Button
                                onClick={() => setShowHackModal(true)}
                                className="h-16 w-full bg-gradient-to-r from-neon-blue/20 to-transparent border border-neon-blue/30 rounded-2xl flex items-center justify-between px-6 group active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
                                        <Brain className="w-5 h-5 text-neon-blue" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-black text-white uppercase tracking-tight">Hack-AI-thon</p>
                                        <p className="text-[8px] font-bold text-neon-blue/80 uppercase tracking-widest">Powered by All Star Code</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-neon-blue opacity-50 group-hover:opacity-100 transition-opacity" />
                            </Button>

                            <Button
                                onClick={() => setShowMentoringModal(true)}
                                className="h-16 w-full bg-gradient-to-r from-neon-purple/20 to-transparent border border-neon-purple/30 rounded-2xl flex items-center justify-between px-6 group active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center border border-neon-purple/20">
                                        <Users className="w-5 h-5 text-neon-purple" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-black text-white uppercase tracking-tight">Mentoring Lounge</p>
                                        <p className="text-[8px] font-bold text-neon-purple/80 uppercase tracking-widest">Powered by WERULE</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-neon-purple opacity-50 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </div>
                    </div>

                    {/* Points Card */}
                    <Card className="glass-card bg-gradient-to-br from-card/80 to-secondary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Trophy className="w-32 h-32" />
                        </div>
                        <CardContent className="p-6">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1">Total Experience Points</div>
                            <div className="text-6xl font-black text-white tracking-tighter leading-none">{stats.points}</div>
                            <Link href="/leaderboard" className="inline-flex items-center gap-1.5 mt-8 px-3 py-1.5 rounded-full bg-neon-green/10 text-neon-green text-[10px] font-bold uppercase tracking-widest hover:bg-neon-green/20 transition-colors border border-neon-green/20">
                                View Global Ranking <ArrowRight className="w-3 h-3" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Progress Section */}
                    <div className="glass-card p-6 neon-border-blue">
                        <div className="flex justify-between items-end text-[10px] mb-4 font-black uppercase tracking-[0.2em]">
                            <span className="text-muted-foreground">Vendor Connections</span>
                            <span className={qualified ? "text-neon-green" : "text-neon-blue"}>
                                {stats.vendorVisits} / 5 COMPLETE
                            </span>
                        </div>
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                            <div
                                className={`h-full ${qualified ? 'bg-neon-green shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-neon-blue shadow-[0_0_15px_rgba(59,130,246,0.4)]'} transition-all duration-1000 ease-out`}
                                style={{ width: `${Math.min(100, (stats.vendorVisits / 5) * 100)}%` }}
                            />
                        </div>
                        {qualified ? (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-neon-green/10 border border-neon-green/20">
                                <ClipboardCheck className="w-4 h-4 text-neon-green" />
                                <p className="text-[10px] text-neon-green font-black uppercase tracking-tight">
                                    Sweepstakes Qualified
                                </p>
                            </div>
                        ) : (
                            <p className="text-[11px] text-muted-foreground leading-snug">
                                Visit and scan <span className="text-white font-bold">{5 - stats.vendorVisits} more vendors</span> to qualify for grand prize drawings!
                            </p>
                        )}
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-3 pb-4">
                        <Button
                            onClick={() => setShowHuntModal(true)}
                            variant="secondary"
                            className="h-20 flex flex-col gap-1 bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl active:scale-95 transition-all"
                        >
                            <Sparkles className="w-5 h-5 text-neon-yellow" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Prizes</span>
                        </Button>

                        <Button
                            onClick={() => setShowAgendaModal(true)}
                            variant="secondary"
                            className="h-20 flex flex-col gap-1 bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl active:scale-95 transition-all"
                        >
                            <Calendar className="w-5 h-5 text-neon-teal" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Agenda</span>
                        </Button>
                    </div>

                    {/* My Interests Section */}
                    {interests.length > 0 && (
                        <div className="pt-4 space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.2em] text-muted-foreground">
                                    <ClipboardCheck className="w-3.5 h-3.5 text-neon-blue" />
                                    My Network
                                </h3>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{interests.length} Scanned</span>
                            </div>
                            <div className="grid gap-3">
                                {interests.map((vendor, idx) => (
                                    <div key={idx} className="glass-card hover:border-white/20 transition-all active:scale-[0.99] group cursor-default">
                                        <div className="p-5 flex flex-col gap-2">
                                            <div className="flex justify-between items-start gap-4">
                                                <h4 className="font-bold text-white text-[15px] leading-tight group-hover:text-neon-blue transition-colors">{vendor.name}</h4>
                                                {vendor.industry_category && (
                                                    <span className="shrink-0 text-[8px] bg-neon-purple/10 text-neon-purple px-2 py-1 rounded-md border border-neon-purple/20 font-black uppercase tracking-[0.1em] h-fit">
                                                        {vendor.industry_category}
                                                    </span>
                                                )}
                                            </div>
                                            {vendor.solution_overview && (
                                                <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed font-medium">
                                                    {vendor.solution_overview}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
