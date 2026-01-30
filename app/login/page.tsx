"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Loader2, Mail, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        const trimmedEmail = email.trim().toLowerCase()

        if (!trimmedEmail) {
            setError("Please enter your email address")
            setLoading(false)
            return
        }

        try {
            // Look up attendee by email
            const { data: attendee, error: lookupError } = await supabase
                .from('attendees')
                .select('id, first_name, email')
                .eq('email', trimmedEmail)
                .single()

            if (lookupError || !attendee) {
                setError("No account found with this email address. Please register first.")
                setLoading(false)
                return
            }

            // Store attendee ID in localStorage to restore session
            localStorage.setItem("expo_attendee_id", attendee.id)

            setSuccess(true)

            // Redirect to dashboard after a brief success message
            setTimeout(() => {
                router.push("/dashboard")
            }, 1000)

        } catch (err) {
            console.error("Login error:", err)
            setError("Something went wrong. Please try again.")
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md space-y-6">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <Card className="bg-card/80 backdrop-blur-sm border-neon-blue/30">
                    <CardHeader className="text-center pb-2 p-4 sm:p-6">
                        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mb-4 border border-neon-purple/50">
                            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-neon-purple" />
                        </div>
                        <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                            Enter your email to resume your session
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        {success ? (
                            <div className="text-center py-8 space-y-4">
                                <div className="mx-auto w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-neon-green" />
                                </div>
                                <p className="text-neon-green font-semibold">Session restored!</p>
                                <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-background/50 border-white/20 focus:border-neon-blue"
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white font-semibold py-6"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Finding your session...
                                        </>
                                    ) : (
                                        "Resume Session"
                                    )}
                                </Button>

                                <div className="text-center pt-4 border-t border-white/10">
                                    <p className="text-sm text-muted-foreground">
                                        Don't have an account?{" "}
                                        <Link href="/register" className="text-neon-purple hover:underline font-medium">
                                            Register now
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    Your session will be restored using your registered email address.
                </p>
            </div>
        </main>
    )
}
