"use client"

import * as React from "react"
import { X } from "lucide-react"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-card border border-neon-purple/50 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl shadow-neon-purple/20 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-neon-purple/30 p-4 flex items-center justify-between">
                    {title && (
                        <h2 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                            {title}
                        </h2>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors ml-auto"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
