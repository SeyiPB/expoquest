"use client"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Users, Clock, MessageSquare, AppWindow, Calendar, ShieldCheck } from "lucide-react"

interface MentoringLoungeModalProps {
    isOpen: boolean
    onClose: () => void
}

export function MentoringLoungeModal({ isOpen, onClose }: MentoringLoungeModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="🤝 Mentoring Lounge">
            <div className="space-y-6 text-white pb-6">
                <section className="bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-lg font-bold text-neon-purple flex items-center gap-2 mb-2 uppercase tracking-tighter">
                        <Users className="w-5 h-5" /> Powered by WERULE
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed font-medium">
                        Join WERULE for 3 inspiring panels and learn from real life industry experts who will share their experience on mentorship and career pathways.
                    </p>
                </section>

                <section className="space-y-4">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-neon-blue" /> Panel Schedule
                    </h4>

                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <span className="text-xs font-black text-neon-blue min-w-[50px]">11 AM</span>
                            <p className="text-sm font-bold text-white">What is a mentor and why does it matter?</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-xs font-black text-neon-blue min-w-[50px]">12 PM</span>
                            <p className="text-sm font-bold text-white">Building confidence and belonging</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-xs font-black text-neon-blue min-w-[50px]">1 PM</span>
                            <p className="text-sm font-bold text-white">From school to tech: How to navigate your career journey</p>
                        </div>
                    </div>
                </section>

                <section className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <AppWindow className="w-4 h-4 text-neon-green" /> Beyond the Panels
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        Between 11am-2pm, engage in group mentorship sessions in person and access a virtual mentor for the month of February through the <span className="text-white font-bold">WERULE mentorship app</span>.
                    </p>
                </section>

                <Button onClick={onClose} className="w-full h-12 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-neon-purple/20">
                    Join the Session
                </Button>
            </div>
        </Modal>
    )
}
