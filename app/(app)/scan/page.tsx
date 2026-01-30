"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Info, ThumbsUp } from "lucide-react"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "framer-motion"

export default function ScanPage() {
    const router = useRouter()
    const supabase = createClient()
    const [step, setStep] = useState<'scan' | 'review' | 'success' | 'error'>('scan')
    const [processing, setProcessing] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [result, setResult] = useState<{ points?: number; newTotal?: number } | null>(null)
    const [stationData, setStationData] = useState<any>(null)
    const [attendeeId, setAttendeeId] = useState<string | null>(null)

    useEffect(() => {
        const id = localStorage.getItem("expo_attendee_id")
        if (!id) {
            router.push("/register")
        } else {
            setAttendeeId(id)
        }
    }, [router])

    const handleScan = async (detectedCodes: any[]) => {
        if (processing || step !== 'scan' || !attendeeId) return
        const rawValue = detectedCodes[0]?.rawValue
        if (!rawValue) return

        setProcessing(true)

        try {
            let stationId = rawValue
            try {
                const parsed = JSON.parse(rawValue)
                stationId = parsed.s || parsed.station_id || rawValue
            } catch { }

            // Validate UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            if (!uuidRegex.test(stationId)) {
                throw new Error("Invalid QR code format")
            }

            // Fetch station info
            const { data: station, error: sError } = await supabase
                .from('stations')
                .select(`
                    *,
                    vendor:vendors (*)
                `)
                .eq('id', stationId)
                .single()

            if (sError || !station) throw new Error("Station not found")

            if (station.type === 'vendor' && station.vendor && station.vendor.length > 0) {
                setStationData({ ...station, vendor: station.vendor[0] })
                setStep('review')
                setProcessing(false)
            } else {
                // Auto-scan for non-vendors
                await executeScan(stationId)
            }

        } catch (err: any) {
            setErrorMsg(err.message || "Something went wrong")
            setStep('error')
            setProcessing(false)
        }
    }

    const executeScan = async (stationId: string) => {
        setProcessing(true)
        try {
            const { data, error } = await supabase.rpc("record_scan", {
                p_attendee_id: attendeeId,
                p_station_id: stationId
            })

            if (error) throw error
            if (data.success) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
                setResult({ points: data.points_earned, newTotal: data.new_total })
                setStep('success')
            } else {
                throw new Error(data.message || "Scan failed")
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to record scan")
            setStep('error')
        } finally {
            setProcessing(false)
        }
    }

    const confirmInterest = () => {
        if (stationData?.id) {
            executeScan(stationData.id)
        }
    }

    if (!attendeeId) return null

    return (
        <div className="min-h-screen bg-black text-foreground flex flex-col">
            <header className="p-4 flex items-center gap-4 bg-background z-10 border-b border-white/5">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">
                    {step === 'review' ? 'Review & Opt-in' : 'Scan Station'}
                </h1>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <AnimatePresence mode="wait">
                    {step === 'scan' && (
                        <motion.div
                            key="scan"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-sm flex flex-col items-center gap-8"
                        >
                            <div className="w-full aspect-square relative overflow-hidden rounded-3xl border-2 border-neon-blue/50 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                                <Scanner
                                    onScan={handleScan}
                                    allowMultiple={true}
                                    scanDelay={2000}
                                    styles={{
                                        container: { width: '100%', height: '100%' },
                                        video: { width: '100%', height: '100%', objectFit: 'cover' }
                                    }}
                                />
                                <div className="absolute inset-0 border-[40px] border-black/40 z-10 pointer-events-none">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-48 h-48 border-2 border-white/30 rounded-2xl relative">
                                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-neon-blue -mt-1 -ml-1 rounded-tl-lg" />
                                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-neon-blue -mt-1 -mr-1 rounded-tr-lg" />
                                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-neon-blue -mb-1 -ml-1 rounded-bl-lg" />
                                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-neon-blue -mb-1 -mr-1 rounded-br-lg" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-lg font-medium text-white">Ready to Scan</p>
                                <p className="text-sm text-muted-foreground">Align the station QR code within the frame</p>
                            </div>
                            {processing && (
                                <div className="flex items-center gap-2 text-neon-blue">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 'review' && (
                        <motion.div
                            key="review"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-6"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-2xl font-bold text-white">{stationData.vendor.name}</h2>
                                    <span className="text-xs bg-neon-blue/20 text-neon-blue px-3 py-1 rounded-full border border-neon-blue/30 font-semibold tracking-wide uppercase">
                                        {stationData.vendor.industry_category || 'Vendor'}
                                    </span>
                                </div>

                                <div className="space-y-4 py-2">
                                    {stationData.vendor.solution_overview && (
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-neon-purple uppercase tracking-tighter">Solution Overview</p>
                                            <p className="text-sm text-gray-300 leading-relaxed">{stationData.vendor.solution_overview}</p>
                                        </div>
                                    )}
                                    {stationData.vendor.value_proposition && (
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-neon-blue uppercase tracking-tighter">Value Proposition</p>
                                            <p className="text-sm text-gray-300 leading-relaxed">{stationData.vendor.value_proposition}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-2xl p-4 flex gap-3">
                                    <Info className="w-5 h-5 text-neon-blue shrink-0" />
                                    <p className="text-xs text-gray-400">
                                        Confirming interest will share your contact info with <span className="text-white font-medium">{stationData.vendor.name}</span> and reward you with <span className="text-neon-green font-bold">{stationData.points_base} points</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={confirmInterest}
                                    disabled={processing}
                                    className="w-full h-14 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-lg rounded-2xl shadow-lg shadow-neon-blue/20"
                                >
                                    {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <span className="flex items-center gap-2 tracking-tight">
                                            Confirm Interest & Collect Points <ThumbsUp className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => setStep('scan')}
                                    variant="ghost"
                                    className="w-full text-muted-foreground"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center gap-8 shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-neon-green/10 rounded-full flex items-center justify-center border-2 border-neon-green/30">
                                <CheckCircle2 className="w-12 h-12 text-neon-green" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none">AWESOME!</h2>
                                <p className="text-gray-400 font-medium tracking-tight">Points added to your badge.</p>
                            </div>
                            <div className="text-6xl font-black bg-gradient-to-r from-neon-blue via-white to-neon-purple bg-clip-text text-transparent">
                                +{result?.points}
                            </div>
                            <div className="flex flex-col gap-3 w-full pt-4">
                                <Button onClick={() => setStep('scan')} variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5 uppercase font-bold tracking-widest text-xs">
                                    Scan Next
                                </Button>
                                <Button onClick={() => router.push("/dashboard")} variant="ghost" className="w-full h-12 text-muted-foreground uppercase font-bold tracking-widest text-xs">
                                    Back to Dash
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center gap-6"
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Scan Failed</h2>
                                <p className="text-muted-foreground text-sm">{errorMsg}</p>
                            </div>
                            <Button onClick={() => setStep('scan')} className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold">
                                Try Again
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
