"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { QRCodeSVG } from "qrcode.react"
import {
    Users, Store, Trophy, BarChart3, Plus, Download, Search,
    Mail, Phone, Building, Tag, ChevronDown, ChevronUp, RefreshCw,
    Medal, Star, Zap, CheckCircle, AlertCircle, User
} from "lucide-react"

// Types
type Tab = 'users' | 'vendors' | 'leaderboard' | 'reports'

interface Attendee {
    id: string
    first_name: string
    last_name: string
    email: string
    zip_code: string
    age_range: string
    attendee_type: string[]
    organization: string | null
    interests: string[]
    tech_access: string
    digital_skill_level: string
    reason_for_attending: string | null
    opt_in_communications: boolean
    confidence_tech_access_pre: number | null
    clarity_tech_pathways_pre: number | null
    confidence_tech_access_post: number | null
    clarity_tech_pathways_post: number | null
    valuable_activity: string | null
    future_action: string | null
    wristband_id: string | null
    wristband_linked_at: string | null
    attendee_number: string | null
    total_points: number
    created_at: string
}

interface Vendor {
    id: string
    name: string
    primary_contact: string | null
    email: string | null
    industry_category: string | null
    description: string | null
    station_id: string | null
    station?: {
        id: string
        name: string
        points_base: number
    }
}

interface LeaderboardEntry {
    id: string
    first_name: string
    last_name: string
    total_points: number
    vendor_visits: number
}

export default function AdminPage() {
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState<Tab>('users')
    const [eventId, setEventId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Data states
    const [attendees, setAttendees] = useState<Attendee[]>([])
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVendors: 0,
        totalScans: 0,
        totalPoints: 0
    })

    // Search/filter
    const [userSearch, setUserSearch] = useState("")
    const [vendorSearch, setVendorSearch] = useState("")

    // Add vendor form
    const [showAddVendor, setShowAddVendor] = useState(false)
    const [newVendor, setNewVendor] = useState({
        name: "",
        primary_contact: "",
        email: "",
        industry_category: "",
        description: ""
    })
    const [addingVendor, setAddingVendor] = useState(false)

    // Expanded user details
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            // Get event
            const { data: events } = await supabase.from('events').select('id').limit(1)
            if (events && events.length > 0) {
                setEventId(events[0].id)

                // Load all data in parallel
                const [attendeesRes, vendorsRes, leaderboardRes, scansRes] = await Promise.all([
                    supabase.from('attendees').select('*').order('created_at', { ascending: false }),
                    supabase.from('vendors').select('*, station:stations(id, name, points_base)').order('name'),
                    supabase.from('leaderboard').select('*').order('total_points', { ascending: false }).limit(50),
                    supabase.from('scans').select('id', { count: 'exact', head: true })
                ])

                if (attendeesRes.data) setAttendees(attendeesRes.data)
                if (vendorsRes.data) setVendors(vendorsRes.data)
                if (leaderboardRes.data) setLeaderboard(leaderboardRes.data)

                // Calculate stats
                const totalPoints = attendeesRes.data?.reduce((sum, a) => sum + (a.total_points || 0), 0) || 0
                setStats({
                    totalUsers: attendeesRes.data?.length || 0,
                    totalVendors: vendorsRes.data?.length || 0,
                    totalScans: scansRes.count || 0,
                    totalPoints
                })
            }
        } catch (err) {
            console.error("Error loading data:", err)
        }
        setLoading(false)
    }

    const createEvent = async () => {
        const { data, error } = await supabase.from('events').insert({
            name: "Queens Tech & Career Expo 2026",
            config: {}
        }).select().single()

        if (data) {
            setEventId(data.id)
            loadData()
        } else if (error) {
            alert(`Failed to create event: ${error.message}`)
        }
    }

    const addVendor = async () => {
        if (!newVendor.name.trim()) return alert("Please enter a vendor name")
        if (!eventId) return alert("No active event")

        setAddingVendor(true)
        try {
            // First create the station
            const { data: station, error: stationError } = await supabase.from('stations').insert({
                event_id: eventId,
                name: newVendor.name,
                type: 'vendor',
                points_base: 10,
                description: newVendor.description
            }).select().single()

            if (stationError) throw stationError

            // Then create the vendor linked to the station
            const { error: vendorError } = await supabase.from('vendors').insert({
                station_id: station.id,
                name: newVendor.name,
                primary_contact: newVendor.primary_contact || null,
                email: newVendor.email || null,
                industry_category: newVendor.industry_category || null,
                description: newVendor.description || null
            })

            if (vendorError) throw vendorError

            // Reset form and reload
            setNewVendor({ name: "", primary_contact: "", email: "", industry_category: "", description: "" })
            setShowAddVendor(false)
            loadData()
        } catch (err: any) {
            console.error("Error adding vendor:", err)
            alert(`Failed to add vendor: ${err.message}`)
        }
        setAddingVendor(false)
    }

    const downloadQRCode = (vendorName: string, stationId: string) => {
        const svg = document.getElementById(`qr-${stationId}`)
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
            canvas.width = 2048
            canvas.height = 2048
            ctx!.fillStyle = "white"
            ctx!.fillRect(0, 0, canvas.width, canvas.height)
            ctx!.drawImage(img, 100, 100, 1848, 1848)

            const pngUrl = canvas.toDataURL("image/png")
            const downloadLink = document.createElement("a")
            downloadLink.href = pngUrl
            downloadLink.download = `${vendorName.replace(/\s+/g, '_')}_QR.png`
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
        }

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    }

    // Filter functions
    const filteredAttendees = attendees.filter(a =>
        `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase().includes(userSearch.toLowerCase())
    )

    const filteredVendors = vendors.filter(v =>
        `${v.name} ${v.industry_category || ''} ${v.email || ''}`.toLowerCase().includes(vendorSearch.toLowerCase())
    )

    // Tab navigation
    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
        { id: 'vendors', label: 'Vendors', icon: <Store className="w-4 h-4" /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
        { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> }
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <RefreshCw className="w-8 h-8 animate-spin text-neon-purple" />
            </div>
        )
    }

    if (!eventId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <CardTitle>No Event Found</CardTitle>
                        <CardDescription>Initialize an event to get started</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={createEvent} className="w-full">
                            Create "Queens Tech & Career Expo 2026"
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-white/10 px-4 py-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">Queens Tech & Career Expo</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadData} className="self-start">
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="sticky top-[73px] z-30 bg-card/90 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex overflow-x-auto gap-1 py-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                                    : 'text-muted-foreground hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <h2 className="text-xl font-semibold">Registered Users ({stats.totalUsers})</h2>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Users List with Expandable Details */}
                        <div className="space-y-2">
                            {filteredAttendees.map(a => {
                                const isExpanded = expandedUserId === a.id
                                return (
                                    <div key={a.id} className="border border-white/10 rounded-lg overflow-hidden">
                                        {/* User Row Header */}
                                        <div
                                            className="flex items-center justify-between p-4 bg-card/50 hover:bg-card/70 cursor-pointer transition-colors"
                                            onClick={() => setExpandedUserId(isExpanded ? null : a.id)}
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                {/* Avatar placeholder */}
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {a.first_name?.[0]}{a.last_name?.[0]}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-semibold">{a.first_name} {a.last_name}</p>
                                                        {a.wristband_id && (
                                                            <span className="flex items-center gap-1 text-neon-green text-xs">
                                                                <CheckCircle className="w-3 h-3" /> Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">{a.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xl font-bold text-neon-blue">{a.total_points}</p>
                                                    <p className="text-xs text-muted-foreground">points</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground hidden md:inline">
                                                        {isExpanded ? 'Less' : 'More'}
                                                    </span>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="border-t border-white/10 bg-card/30 p-4 space-y-4">
                                                {/* Quick Stats Row */}
                                                <div className="flex flex-wrap gap-2">
                                                    {(a.attendee_type || []).map((t: string, i: number) => (
                                                        <span key={i} className="px-3 py-1 bg-neon-purple/20 text-neon-purple text-sm rounded-full">
                                                            {t}
                                                        </span>
                                                    ))}
                                                    <span className="px-3 py-1 bg-neon-blue/20 text-neon-blue text-sm rounded-full">
                                                        {a.age_range}
                                                    </span>
                                                    <span className="px-3 py-1 bg-white/10 text-white text-sm rounded-full">
                                                        {a.digital_skill_level}
                                                    </span>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {/* Contact & Basic Info */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-neon-blue border-b border-neon-blue/30 pb-1">Contact Info</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                                <span>{a.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Building className="w-4 h-4 text-muted-foreground" />
                                                                <span>{a.organization || 'No organization'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Tag className="w-4 h-4 text-muted-foreground" />
                                                                <span>ZIP: {a.zip_code}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Registered: {new Date(a.created_at).toLocaleDateString()}
                                                        </p>
                                                        {a.opt_in_communications && (
                                                            <span className="inline-flex items-center gap-1 text-xs text-neon-green">
                                                                <CheckCircle className="w-3 h-3" /> Opted in for communications
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Tech Profile */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-neon-purple border-b border-neon-purple/30 pb-1">Tech Profile</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div>
                                                                <span className="text-muted-foreground">Tech Access:</span>
                                                                <span className="ml-2">{a.tech_access}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Skill Level:</span>
                                                                <span className="ml-2">{a.digital_skill_level}</span>
                                                            </div>
                                                            {a.reason_for_attending && (
                                                                <div>
                                                                    <span className="text-muted-foreground">Reason:</span>
                                                                    <p className="text-sm mt-1">{a.reason_for_attending}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {(a.interests || []).length > 0 && (
                                                            <div>
                                                                <span className="text-xs text-muted-foreground">Interests:</span>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {(a.interests || []).map((interest: string, i: number) => (
                                                                        <span key={i} className="px-2 py-0.5 bg-white/10 text-xs rounded">
                                                                            {interest}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Impact Data */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-neon-green border-b border-neon-green/30 pb-1">Impact Data</h4>
                                                        <div className="space-y-3 text-sm">
                                                            {/* Confidence Score */}
                                                            <div>
                                                                <span className="text-muted-foreground">Tech Confidence:</span>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs">Pre: {a.confidence_tech_access_pre ?? '-'}</span>
                                                                    <span className="text-muted-foreground">→</span>
                                                                    <span className="text-xs">Post: {a.confidence_tech_access_post ?? '-'}</span>
                                                                    {a.confidence_tech_access_pre && a.confidence_tech_access_post && (
                                                                        <span className={`text-xs font-semibold ${a.confidence_tech_access_post > a.confidence_tech_access_pre ? 'text-neon-green' : 'text-muted-foreground'}`}>
                                                                            {a.confidence_tech_access_post > a.confidence_tech_access_pre ? `+${a.confidence_tech_access_post - a.confidence_tech_access_pre}` : ''}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* Clarity Score */}
                                                            <div>
                                                                <span className="text-muted-foreground">Pathway Clarity:</span>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs">Pre: {a.clarity_tech_pathways_pre ?? '-'}</span>
                                                                    <span className="text-muted-foreground">→</span>
                                                                    <span className="text-xs">Post: {a.clarity_tech_pathways_post ?? '-'}</span>
                                                                    {a.clarity_tech_pathways_pre && a.clarity_tech_pathways_post && (
                                                                        <span className={`text-xs font-semibold ${a.clarity_tech_pathways_post > a.clarity_tech_pathways_pre ? 'text-neon-green' : 'text-muted-foreground'}`}>
                                                                            {a.clarity_tech_pathways_post > a.clarity_tech_pathways_pre ? `+${a.clarity_tech_pathways_post - a.clarity_tech_pathways_pre}` : ''}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {a.valuable_activity && (
                                                                <div>
                                                                    <span className="text-muted-foreground">Most Valuable:</span>
                                                                    <p className="text-xs mt-1">{a.valuable_activity}</p>
                                                                </div>
                                                            )}
                                                            {a.future_action && (
                                                                <div>
                                                                    <span className="text-muted-foreground">Next Step:</span>
                                                                    <p className="text-xs mt-1">{a.future_action}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Attendee ID / Wristband Info */}
                                                <div className="pt-3 border-t border-white/10 text-sm flex gap-6">
                                                    {a.attendee_number && (
                                                        <div>
                                                            <span className="text-muted-foreground">Attendee #:</span>
                                                            <span className="ml-2 font-mono text-neon-purple font-bold">{a.attendee_number}</span>
                                                        </div>
                                                    )}
                                                    {a.wristband_id && (
                                                        <div>
                                                            <span className="text-muted-foreground">Wristband ID:</span>
                                                            <span className="ml-2 font-mono">{a.wristband_id}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {filteredAttendees.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No users found</p>
                        )}
                    </div>
                )}

                {/* VENDORS TAB */}
                {activeTab === 'vendors' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <h2 className="text-xl font-semibold">Vendors ({stats.totalVendors})</h2>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search vendors..."
                                        value={vendorSearch}
                                        onChange={e => setVendorSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button onClick={() => setShowAddVendor(!showAddVendor)} className="bg-neon-purple hover:bg-neon-purple/80">
                                    <Plus className="w-4 h-4 mr-2" /> Add Vendor
                                </Button>
                            </div>
                        </div>

                        {/* Add Vendor Form */}
                        {showAddVendor && (
                            <Card className="bg-gradient-to-br from-neon-purple/10 to-neon-blue/10 border-neon-purple/30">
                                <CardHeader>
                                    <CardTitle className="text-lg">Add New Vendor</CardTitle>
                                    <CardDescription>Fill in the details to add a vendor. A QR code will be automatically generated.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="vendor-name">Vendor Name *</Label>
                                            <Input
                                                id="vendor-name"
                                                placeholder="Company Name"
                                                value={newVendor.name}
                                                onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="vendor-contact">Primary Contact</Label>
                                            <Input
                                                id="vendor-contact"
                                                placeholder="Contact Name"
                                                value={newVendor.primary_contact}
                                                onChange={e => setNewVendor({ ...newVendor, primary_contact: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="vendor-email">Email</Label>
                                            <Input
                                                id="vendor-email"
                                                type="email"
                                                placeholder="contact@company.com"
                                                value={newVendor.email}
                                                onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="vendor-industry">Industry Category</Label>
                                            <Input
                                                id="vendor-industry"
                                                placeholder="e.g., Tech, Education, Healthcare"
                                                value={newVendor.industry_category}
                                                onChange={e => setNewVendor({ ...newVendor, industry_category: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="vendor-desc">Description</Label>
                                            <Input
                                                id="vendor-desc"
                                                placeholder="Brief description of the vendor"
                                                value={newVendor.description}
                                                onChange={e => setNewVendor({ ...newVendor, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button onClick={addVendor} disabled={addingVendor} className="bg-neon-green hover:bg-neon-green/80 text-black">
                                            {addingVendor ? "Adding..." : "Add Vendor"}
                                        </Button>
                                        <Button variant="ghost" onClick={() => setShowAddVendor(false)}>Cancel</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Vendors Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredVendors.map(vendor => (
                                <Card key={vendor.id} className="bg-card/50 hover:bg-card/70 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            {/* QR Code */}
                                            {vendor.station_id && (
                                                <div className="flex-shrink-0">
                                                    <div className="bg-white p-2 rounded-lg">
                                                        <QRCodeSVG
                                                            id={`qr-${vendor.station_id}`}
                                                            value={JSON.stringify({ s: vendor.station_id })}
                                                            size={80}
                                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="w-full mt-2 text-xs"
                                                        onClick={() => downloadQRCode(vendor.name, vendor.station_id!)}
                                                    >
                                                        <Download className="w-3 h-3 mr-1" /> Download
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{vendor.name}</h3>
                                                {vendor.industry_category && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-neon-blue/20 text-neon-blue rounded-full mt-1">
                                                        <Tag className="w-3 h-3" /> {vendor.industry_category}
                                                    </span>
                                                )}
                                                {vendor.primary_contact && (
                                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                                        <User className="w-3 h-3" /> {vendor.primary_contact}
                                                    </p>
                                                )}
                                                {vendor.email && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                                        <Mail className="w-3 h-3" /> {vendor.email}
                                                    </p>
                                                )}
                                                {vendor.description && (
                                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{vendor.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredVendors.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No vendors found</p>
                        )}
                    </div>
                )}

                {/* LEADERBOARD TAB */}
                {activeTab === 'leaderboard' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Leaderboard</h2>

                        {/* Top 3 Podium */}
                        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                            {[1, 0, 2].map((rank) => {
                                const entry = leaderboard[rank]
                                if (!entry) return <div key={rank} />
                                const isFirst = rank === 0
                                const colors = {
                                    0: 'from-yellow-500/30 to-amber-600/30 border-yellow-500/50',
                                    1: 'from-gray-400/20 to-gray-500/20 border-gray-400/50',
                                    2: 'from-amber-700/20 to-orange-700/20 border-amber-700/50'
                                }
                                const medals = { 0: '🥇', 1: '🥈', 2: '🥉' }

                                return (
                                    <Card key={entry.id} className={`bg-gradient-to-br ${colors[rank as keyof typeof colors]} border ${isFirst ? 'md:-mt-4' : ''}`}>
                                        <CardContent className="p-4 text-center">
                                            <div className="text-3xl mb-2">{medals[rank as keyof typeof medals]}</div>
                                            <p className="font-bold truncate">{entry.first_name}</p>
                                            <p className="text-2xl font-black text-neon-blue">{entry.total_points}</p>
                                            <p className="text-xs text-muted-foreground">{entry.vendor_visits} vendors</p>
                                            {entry.vendor_visits >= 5 && (
                                                <span className="inline-flex items-center gap-1 text-xs text-neon-green mt-1">
                                                    <CheckCircle className="w-3 h-3" /> Qualified
                                                </span>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                        {/* Full Leaderboard */}
                        <div className="space-y-2">
                            {leaderboard.slice(3).map((entry, i) => (
                                <div key={entry.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-muted-foreground font-mono w-8">#{i + 4}</span>
                                        <div>
                                            <p className="font-medium">{entry.first_name} {entry.last_name}</p>
                                            <p className="text-xs text-muted-foreground">{entry.vendor_visits} vendors visited</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-neon-blue">{entry.total_points}</p>
                                        {entry.vendor_visits >= 5 && (
                                            <span className="text-xs text-neon-green">Qualified</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* REPORTS TAB */}
                {activeTab === 'reports' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Reports & Analytics</h2>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 border-neon-blue/30">
                                <CardContent className="p-4 text-center">
                                    <Users className="w-8 h-8 mx-auto text-neon-blue mb-2" />
                                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                                    <p className="text-sm text-muted-foreground">Registered Users</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-neon-purple/20 to-neon-purple/5 border-neon-purple/30">
                                <CardContent className="p-4 text-center">
                                    <Store className="w-8 h-8 mx-auto text-neon-purple mb-2" />
                                    <p className="text-3xl font-bold">{stats.totalVendors}</p>
                                    <p className="text-sm text-muted-foreground">Vendors</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-neon-green/20 to-neon-green/5 border-neon-green/30">
                                <CardContent className="p-4 text-center">
                                    <Zap className="w-8 h-8 mx-auto text-neon-green mb-2" />
                                    <p className="text-3xl font-bold">{stats.totalScans}</p>
                                    <p className="text-sm text-muted-foreground">Total Scans</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-neon-yellow/20 to-neon-yellow/5 border-neon-yellow/30">
                                <CardContent className="p-4 text-center">
                                    <Star className="w-8 h-8 mx-auto text-neon-yellow mb-2" />
                                    <p className="text-3xl font-bold">{stats.totalPoints.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">Points Distributed</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Demographics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Attendee Demographics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Attendee Types */}
                                    <div>
                                        <h4 className="font-medium mb-3">By Type</h4>
                                        <div className="space-y-2">
                                            {(() => {
                                                const typeCounts: Record<string, number> = {}
                                                attendees.forEach(a => {
                                                    (a.attendee_type || []).forEach((t: string) => {
                                                        typeCounts[t] = (typeCounts[t] || 0) + 1
                                                    })
                                                })
                                                return Object.entries(typeCounts)
                                                    .sort((a, b) => b[1] - a[1])
                                                    .slice(0, 6)
                                                    .map(([type, count]) => (
                                                        <div key={type} className="flex justify-between items-center">
                                                            <span className="text-sm">{type}</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-neon-purple rounded-full"
                                                                        style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm text-muted-foreground w-8">{count}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                            })()}
                                        </div>
                                    </div>

                                    {/* Age Ranges */}
                                    <div>
                                        <h4 className="font-medium mb-3">By Age Range</h4>
                                        <div className="space-y-2">
                                            {(() => {
                                                const ageCounts: Record<string, number> = {}
                                                attendees.forEach(a => {
                                                    if (a.age_range) {
                                                        ageCounts[a.age_range] = (ageCounts[a.age_range] || 0) + 1
                                                    }
                                                })
                                                return Object.entries(ageCounts)
                                                    .sort((a, b) => a[0].localeCompare(b[0]))
                                                    .map(([range, count]) => (
                                                        <div key={range} className="flex justify-between items-center">
                                                            <span className="text-sm">{range}</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-neon-blue rounded-full"
                                                                        style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm text-muted-foreground w-8">{count}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Qualification Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Prize Qualification Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    const qualified = leaderboard.filter(e => e.vendor_visits >= 5).length
                                    const notQualified = leaderboard.length - qualified
                                    return (
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-neon-green" />
                                                <span className="text-sm">Qualified: <strong>{qualified}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-muted" />
                                                <span className="text-sm">In Progress: <strong>{notQualified}</strong></span>
                                            </div>
                                        </div>
                                    )
                                })()}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
