"use client"
import { Button } from "@/components/ui/button"
import { X, StopCircle } from "lucide-react"
import { AssistantBot3D } from "@/components/assistant-bot-3d"

interface VoiceOverlayProps {
  t: any
  setIsVoiceActive: (val: boolean) => void
}

export function VoiceOverlay({ t, setIsVoiceActive }: VoiceOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 glass flex flex-col items-center justify-center animate-in fade-in duration-500">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsVoiceActive(false)}
        className="absolute top-8 right-8 text-white/40 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 z-10"
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="w-full h-full flex flex-col items-center justify-center gap-12 max-w-5xl mx-auto relative">
        <div className="relative w-full aspect-square max-h-[500px]">
          <AssistantBot3D isListening={true} />
        </div>

        <div className="text-center space-y-6 z-10 -mt-20">
          <div className="space-y-2">
            <h2 className="text-5xl font-bold tracking-tight text-white animate-pulse">{t.listening}</h2>
            <p className="text-primary font-mono tracking-widest text-sm uppercase">{t.neuralLink}</p>
          </div>
          
          {/* Bouton pour arrêter et envoyer l'audio */}
          <Button
            onClick={() => setIsVoiceActive(false)}
            className="mt-8 bg-red-500 hover:bg-red-600 text-white px-8 py-6 rounded-full text-lg font-semibold shadow-lg shadow-red-500/50 animate-pulse"
            size="lg"
          >
            <StopCircle className="w-6 h-6 mr-2" />
            Arrêter et envoyer
          </Button>
        </div>

        <div className="max-w-lg text-center px-8">
          <p className="text-white/60 text-lg leading-relaxed italic">
            "Show me the performance metrics for the last quarter..."
          </p>
        </div>
      </div>
    </div>
  )
}
