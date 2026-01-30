"use client"

import { Modal } from "@/components/ui/modal"
import { Calendar, Clock, MapPin } from "lucide-react"

interface AgendaModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AgendaModal({ isOpen, onClose }: AgendaModalProps) {
    const schedule = [
        {
            time: "9:30 - 10:20 AM",
            title: "Check-in (Entrance) and General Breakfast (Cafe)",
            location: "Entrance / Cafe"
        },
        {
            time: "10:20 – 11:00 AM",
            title: "Welcome Session",
            location: "Auditorium"
        },
        {
            time: "11:00 AM – 2:00 PM",
            title: "Expo & Activations Open",
            location: "Main Hall"
        },
        {
            time: "1:00 – 2:00 PM",
            title: "Featured Program Moments",
            location: "Auditorium"
        }
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Event Agenda">
            <div className="space-y-4">
                {schedule.map((item, index) => (
                    <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-neon-teal/30 transition-colors"
                    >
                        <div className="flex items-center gap-2 sm:w-48 shrink-0 text-neon-teal font-mono text-sm">
                            <Clock className="w-4 h-4" />
                            {item.time}
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-white">{item.title}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                {item.location}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                >
                    Close
                </button>
            </div>
        </Modal>
    )
}
