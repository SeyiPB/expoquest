"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, QrCode, ClipboardCheck, Map as MapIcon } from "lucide-react"

export function MobileNav() {
    const pathname = usePathname()

    // Don't show on auth pages or home
    if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/check-in") {
        return null
    }

    const navItems = [
        { label: "Home", icon: Home, href: "/dashboard" },
        { label: "Quests", icon: MapIcon, href: "/bingo" },
        { label: "Scan", icon: QrCode, href: "/scan", primary: true },
        { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
        { label: "Review", icon: ClipboardCheck, href: "/reflection" },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-white/10 px-6 pb-safe pt-2 z-50">
            <div className="flex justify-between items-center max-w-lg mx-auto h-16 relative">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    if (item.primary) {
                        return (
                            <Link key={item.href} href={item.href} className="relative -top-6">
                                <div className="bg-gradient-to-br from-neon-blue to-neon-purple p-4 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95 transition-all">
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-neon-blue uppercase tracking-tighter">
                                    {item.label}
                                </span>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1 active:scale-90 transition-all"
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'text-neon-blue' : 'text-muted-foreground'}`} />
                            <span className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute top-0 w-1 h-1 bg-neon-blue rounded-full" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
