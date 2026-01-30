"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("expo_attendee_id");
    if (id) {
      router.push("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center text-foreground relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/assets/queens.jpg")' }}
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-md space-y-8 z-10">
        <div className="space-y-4">
          <h1 className="text-4xl xs:text-5xl sm:text-6xl font-extrabold tracking-in-expand leading-tight">
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Queens
            </span>
            {" "}Expo
          </h1>
          <p className="text-xl font-bold text-white leading-tight">
            Welcome to the 4th Annual Queens Tech & Career Expo
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <Link href="/register" className="w-full">
            <button className="w-full py-4 text-xl font-black uppercase tracking-widest bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2">
              Check-In <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
          <Link href="/login" className="text-neon-purple hover:text-neon-blue transition-colors text-sm font-bold uppercase tracking-wider">
            Already registered? Log in →
          </Link>
          <p className="text-xs text-muted-foreground font-medium">No app download required.</p>
        </div>

        {/* Powered By Section */}
        <div className="pt-12 flex flex-col items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Powered By</p>
          <img
            src="/assets/gamr-logo.png"
            alt="Gamr Logo"
            className="h-20 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </main>
  );
}
