"use client"

import { Modal } from "@/components/ui/modal"
import { User, ShieldCheck, Briefcase } from "lucide-react"

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
    attendee: {
        first_name: string
        last_name: string
        attendee_number: string
        attendee_type: string[]
        organization?: string
    } | null
}

export function ProfileModal({ isOpen, onClose, attendee }: ProfileModalProps) {
    if (!attendee) return null

    const fullName = `${attendee.first_name} ${attendee.last_name}`
    const titles = Array.isArray(attendee.attendee_type) ? attendee.attendee_type.join(", ") : attendee.attendee_type

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Participant Profile">
            <div className="flex flex-col items-center gap-6 pb-4">
                {/* Profile Icon */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center border-2 border-neon-purple/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                    <User className="w-12 h-12 text-neon-purple" />
                </div>

                <div className="w-full space-y-4">
                    {/* Full Name */}
                    <div className="glass-card p-4 flex flex-col items-center gap-1 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Full Name</span>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{fullName}</h3>
                    </div>

                    {/* Unique ID */}
                    <div className="glass-card p-4 flex flex-col items-center gap-1 text-center border-neon-blue/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-neon-blue" /> Verified Unique ID
                        </span>
                        <div className="text-3xl font-mono font-black text-neon-blue tracking-wider">
                            {attendee.attendee_number}
                        </div>
                    </div>

                    {/* Title / Organization */}
                    <div className="glass-card p-4 flex flex-col items-center gap-1 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-neon-purple" /> Professional Title
                        </span>
                        <p className="text-lg font-bold text-white leading-tight">
                            {titles}
                        </p>
                        {attendee.organization && (
                            <p className="text-[11px] text-muted-foreground italic font-medium mt-1">
                                {attendee.organization}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 mt-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-all"
                >
                    Close Profile
                </button>
            </div>
        </Modal>
    )
}
