"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

import dynamic from "next/dynamic"

const Scene3D = dynamic(
  () => import("@/components/scene-3d").then((mod) => mod.Scene3D),
  { ssr: false }
)

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "fr">("en")

  const content = {
    en: {
      tagline: "Optimize Your Databases with intelligence",
      description: "Step into a new dimension of productivity with AI, your premium 3D AI companion.",
      login: "Get Started",
      signup: "Join the Future",
    },
    fr: {
      tagline: "Vivez le futur de l'intelligence",
      description: "Entrez dans une nouvelle dimension de productivité avec AI, votre compagnon IA 3D premium.",
      login: "Commencer",
      signup: "Rejoindre le Futur",
    },
  }

  const t = content[lang]

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center">
      <Scene3D />

      {/* Navigation Overlay */}
      <nav className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-10">
        <div className="flex items-left">
            <img src="/logo.png" alt="AI Logo" className="h-10 w-auto" />
          </div>

        <div className="flex gap-4 items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
          >
            <Globe className="w-4 h-4 mr-2" />
            {lang.toUpperCase()}
          </Button>
          <Link href="/auth">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              {t.login}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="z-10 text-center max-w-3xl px-6 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white text-balance leading-none">
          {t.tagline}
        </h1>
        <p className="text-xl md:text-2xl text-white/60 text-pretty">{t.description}</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
          <Link href="/auth">
            <Button
              size="lg"
              className="h-14 px-10 text-lg rounded-full neon-glow font-semibold transition-all hover:scale-105 active:scale-95"
            >
              {t.signup}
            </Button>
          </Link>
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-20" />
      </div>
    </main>
  )
}
