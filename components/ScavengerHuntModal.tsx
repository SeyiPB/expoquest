"use client"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Trophy, Target, Gift, Star, Zap, Crown } from "lucide-react"

interface ScavengerHuntModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ScavengerHuntModal({ isOpen, onClose }: ScavengerHuntModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="🎯 Scavenger Hunt">
            <div className="space-y-6 text-white">
                {/* How It Works */}
                <section>
                    <h3 className="text-lg font-semibold text-neon-blue flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5" /> How It Works
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                            <span className="text-neon-purple font-bold">1.</span>
                            Visit vendor booths and scan their QR codes
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-neon-purple font-bold">2.</span>
                            Earn points for each booth you visit
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-neon-purple font-bold">3.</span>
                            Complete activities for bonus points
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-neon-purple font-bold">4.</span>
                            Track your progress on the dashboard
                        </li>
                    </ul>
                </section>

                {/* Qualification Criteria */}
                <section className="bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 rounded-xl p-4 border border-neon-purple/30">
                    <h3 className="text-lg font-semibold text-neon-green flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5" /> Qualification Criteria
                    </h3>
                    <div className="text-sm text-gray-300">
                        <p className="mb-2">To qualify for the prize drawing, you must:</p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-neon-yellow" />
                                Visit at least <span className="text-neon-green font-bold">5 vendor booths</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-neon-yellow" />
                                Complete your <span className="text-neon-green font-bold">event reflection</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Prizes */}
                <section>
                    <h3 className="text-lg font-semibold text-neon-yellow flex items-center gap-2 mb-3">
                        <Gift className="w-5 h-5" /> Prizes
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 rounded-lg p-3 border border-yellow-500/30">
                            <Crown className="w-8 h-8 text-yellow-400" />
                            <div>
                                <p className="font-semibold text-yellow-400">🥇 Grand Prize</p>
                                <p className="text-sm text-gray-300">$500 Tech Gift Card</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gradient-to-r from-gray-400/20 to-gray-500/20 rounded-lg p-3 border border-gray-400/30">
                            <Trophy className="w-7 h-7 text-gray-300" />
                            <div>
                                <p className="font-semibold text-gray-300">🥈 2nd Place</p>
                                <p className="text-sm text-gray-400">$250 Tech Gift Card</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-700/20 to-orange-700/20 rounded-lg p-3 border border-amber-700/30">
                            <Trophy className="w-6 h-6 text-amber-600" />
                            <div>
                                <p className="font-semibold text-amber-600">🥉 3rd Place</p>
                                <p className="text-sm text-gray-400">$100 Tech Gift Card</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        * Winners will be drawn from qualified participants at the end of the event
                    </p>
                </section>

                {/* Points Guide */}
                <section className="bg-card/50 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-white mb-2">Points Guide</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Vendor Visit</span>
                            <span className="text-neon-blue font-semibold">+10 pts</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Activity Station</span>
                            <span className="text-neon-purple font-semibold">+25 pts</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Workshop</span>
                            <span className="text-neon-green font-semibold">+50 pts</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Reflection</span>
                            <span className="text-neon-yellow font-semibold">+30 pts</span>
                        </div>
                    </div>
                </section>

                <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white font-semibold"
                >
                    Let's Go! 🚀
                </Button>
            </div>
        </Modal>
    )
}
