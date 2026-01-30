"use client"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Cpu, Users, Clock, MapPin, Sparkles, Brain } from "lucide-react"

interface HackAIthonModalProps {
    isOpen: boolean
    onClose: () => void
}

export function HackAIthonModal({ isOpen, onClose }: HackAIthonModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="💡 Hack-AI-thon">
            <div className="space-y-6 text-white pb-6">
                <section className="bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-lg font-bold text-neon-blue flex items-center gap-2 mb-2 uppercase tracking-tighter">
                        <Cpu className="w-5 h-5" /> Powered by All Star Code
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed font-medium">
                        Join a fast-paced, 30-minute team challenge where attendees work in small groups to use AI tools like ChatGPT to design solutions to real Queens civic challenges.
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <MapPin className="w-5 h-5 text-neon-purple" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Location</p>
                            <p className="text-sm font-bold text-white">Lab 5 (Inside City Works Exhibit)</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                            <Clock className="w-5 h-5 text-neon-green" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Session Times</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                <p className="text-xs font-bold text-white">11:00 – 11:30 AM</p>
                                <p className="text-xs font-bold text-white">11:35 – 12:05 PM</p>
                                <p className="text-xs font-bold text-white">12:10 – 12:40 PM</p>
                                <p className="text-xs font-bold text-white">12:45 – 1:15 PM</p>
                            </div>
                            <p className="text-[11px] font-black text-neon-purple mt-2 uppercase tracking-tight italic">
                                1:35 PM – Finalist demos / presentations (In Auditorium)
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-neon-yellow" /> Why Join?
                    </h4>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-xs text-gray-400 font-medium">
                            <div className="w-1 h-1 rounded-full bg-neon-blue mt-1.5" />
                            Win a chance to have your solution used by Queens government.
                        </li>
                        <li className="flex items-start gap-2 text-xs text-gray-400 font-medium">
                            <div className="w-1 h-1 rounded-full bg-neon-blue mt-1.5" />
                            Collaborate, brainstorm, and build a quick proposal with mentors.
                        </li>
                        <li className="flex items-start gap-2 text-xs text-gray-400 font-medium">
                            <div className="w-1 h-1 rounded-full bg-neon-blue mt-1.5" />
                            No prior coding experience required—just curiosity!
                        </li>
                    </ul>
                </section>

                <Button onClick={onClose} className="w-full h-12 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-neon-blue/20">
                    Got it!
                </Button>
            </div>
        </Modal>
    )
}
