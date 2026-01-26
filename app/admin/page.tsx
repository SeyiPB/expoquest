"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { QRCodeSVG } from "qrcode.react"

export default function AdminPage() {
    const supabase = createClient()
    const [stations, setStations] = useState<any[]>([])
    const [attendees, setAttendees] = useState<any[]>([])
    const [newStation, setNewStation] = useState("")
    const [eventId, setEventId] = useState<string | null>(null)

    useEffect(() => {
        // Basic auth check would go here (e.g., check for admin secret in localStorage or similar)
        // For prototype, we'll just load data
        loadData()
    }, [])

    const loadData = async () => {
        const { data: events } = await supabase.from('events').select('id').limit(1)
        if (events && events.length > 0) {
            setEventId(events[0].id)

            const { data: st } = await supabase.from('stations').select('*').order('created_at')
            if (st) setStations(st)

            const { data: at } = await supabase.from('attendees').select('*').order('total_points', { ascending: false }).limit(20)
            if (at) setAttendees(at)
        }
    }

    const createStation = async () => {
        if (!newStation || !eventId) return
        const { error } = await supabase.from('stations').insert({
            event_id: eventId,
            name: newStation,
            points_base: 100
        })
        if (error) alert("Error creating station")
        else {
            setNewStation("")
            loadData()
        }
    }

    return (
        <div className="min-h-screen p-8 bg-background text-foreground">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Station</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Station Name"
                                value={newStation}
                                onChange={(e) => setNewStation(e.target.value)}
                            />
                            <Button onClick={createStation}>Create</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Stations & QR Codes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {stations.map(station => (
                                <div key={station.id} className="p-4 border rounded flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">{station.name}</p>
                                        <p className="text-xs text-muted-foreground">{station.id}</p>
                                    </div>
                                    <div className="bg-white p-2">
                                        {/* QR Code encodes JSON for robustness */}
                                        <QRCodeSVG value={JSON.stringify({ s: station.id })} size={100} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Top Attendees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">Code</th>
                                    <th className="p-2">Role</th>
                                    <th className="p-2">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendees.map(a => (
                                    <tr key={a.id} className="border-b border-white/5">
                                        <td className="p-2 font-mono">{a.attendee_code}</td>
                                        <td className="p-2">{a.demographics?.role}</td>
                                        <td className="p-2 font-bold text-neon-blue">{a.total_points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
