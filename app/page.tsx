import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md space-y-8 z-10">
        <h1 className="text-5xl font-extrabold tracking-in-expand">
          <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Expo
          </span>
          Quest
        </h1>
        <p className="text-lg text-muted-foreground">
          The ultimate event engagement companion. Scan, earn, and win.
        </p>

        <div className="flex flex-col gap-4 pt-8">
          <Link href="/check-in" className="w-full">
            <button className="w-full py-4 text-xl font-bold bg-primary text-primary-foreground rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
          <p className="text-xs text-muted-foreground">No download required.</p>
        </div>
      </div>
    </main>
  );
}
