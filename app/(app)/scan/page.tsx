"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import confetti from "canvas-confetti"
import { motion } from "framer-motion"

export default function ScanPage() {
    const router = useRouter()
    const supabase = createClient()
    const [scanning, setScanning] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string; points?: number; newTotal?: number } | null>(null)
    const [attendeeId, setAttendeeId] = useState<string | null>(null)

    useEffect(() => {
        const id = localStorage.getItem("expo_attendee_id")
        if (!id) {
            router.push("/check-in")
        } else {
            setAttendeeId(id)
        }
    }, [router])

    const handleScan = async (detectedCodes: any[]) => {
        if (processing || !scanning || !attendeeId) return
        const rawValue = detectedCodes[0]?.rawValue
        if (!rawValue) return

        setScanning(false)
        setProcessing(true)

        try {
            console.log("Scanned raw value:", rawValue)
            let stationId = rawValue
            try {
                const parsed = JSON.parse(rawValue)
                if (parsed.s) stationId = parsed.s
                if (parsed.station_id) stationId = parsed.station_id
            } catch {
                // Not JSON, assume raw UUID string
            }

            console.log("Resolved Station ID:", stationId)

            // Validate UUID format to prevent RPC crashes
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            if (!uuidRegex.test(stationId)) {
                throw new Error(`Invalid QR Format. Expected Station UUID, got: ${stationId.substring(0, 10)}...`)
            }

            const { data, error } = await supabase.rpc("record_scan", {
                p_attendee_id: attendeeId,
                p_station_id: stationId
            })

            if (error) {
                console.error("RPC Error:", error)
                throw new Error(error.message || "Server Error")
            }

            if (data.success) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
                setResult({
                    success: true,
                    message: `Station Visited! +${data.points_earned} Points`,
                    points: data.points_earned,
                    newTotal: data.new_total
                })
            } else {
                setResult({
                    success: false,
                    message: data.message || "Scan failed"
                })
            }

        } catch (err: any) {
            console.error("Scan error:", err)
            setResult({
                success: false,
                message: err.message || "Invalid QR Code or System Error"
            })
        } finally {
            setProcessing(false)
        }
    }

    const resetScan = () => {
        setResult(null)
        setScanning(true)
    }

    if (!attendeeId) return null

    return (
        <div className="min-h-screen bg-black text-foreground flex flex-col">
            <header className="p-4 flex items-center gap-4 bg-background z-10">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">Scan Station</h1>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
                {scanning && (
                    <div className="w-full max-w-sm aspect-square relative overflow-hidden rounded-xl border-2 border-neon-blue shadow-[0_0_30px_rgba(var(--neon-blue),0.3)]">
                        <Scanner
                            onScan={handleScan}
                            allowMultiple={true}
                            scanDelay={2000}
                            styles={{
                                container: { width: '100%', height: '100%' },
                                video: { width: '100%', height: '100%', objectFit: 'cover' }
                            }}
                        />
                        <div className="absolute inset-0 border-[40px] border-black/50 z-10 pointer-events-none">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-neon-blue -mt-1 -ml-1" />
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-neon-blue -mt-1 -mr-1" />
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-neon-blue -mb-1 -ml-1" />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-neon-blue -mb-1 -mr-1" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-0 w-full text-center text-white/80 z-20 font-medium">
                            Point camera at station QR code
                        </div>
                    </div>
                )}

                {processing && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-neon-blue" />
                        <p>Verifying scan...</p>
                    </div>
                )}

                {result && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-sm bg-card border border-border rounded-xl p-8 flex flex-col items-center text-center gap-6"
                    >
                        {result.success ? (
                            <>
                                <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-neon-green" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-neon-green">Success!</h2>
                                    <p className="text-muted-foreground mt-2">{result.message}</p>
                                </div>
                                <div className="text-4xl font-black bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                                    {result.newTotal} Pts
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center">
                                    <XCircle className="w-10 h-10 text-destructive" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-destructive">Oops!</h2>
                                    <p className="text-muted-foreground mt-2">{result.message}</p>
                                </div>
                            </>
                        )}

                        <div className="flex flex-col gap-3 w-full">
                            <Button onClick={resetScan} className="w-full" variant="secondary">
                                Scan Another
                            </Button>
                            <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
                                Back to Dashboard
                            </Button>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    )
}
