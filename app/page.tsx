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
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md space-y-8 z-10">
        <h1 className="text-4xl xs:text-5xl sm:text-6xl font-extrabold tracking-in-expand leading-tight">
          <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Queens
          </span>
          {" "}Expo
        </h1>
        <p className="text-lg text-muted-foreground">
          The ultimate event engagement companion. Scan, earn, and win.
        </p>

        <div className="flex flex-col gap-4 pt-8">
          <Link href="/register" className="w-full">
            <button className="w-full py-4 text-xl font-bold bg-primary text-primary-foreground rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
          <Link href="/login" className="text-neon-purple hover:text-neon-blue transition-colors text-sm font-medium">
            Already registered? Log in →
          </Link>
          <p className="text-xs text-muted-foreground">No download required.</p>
        </div>
      </div>
    </main>
  );
}
