"use client"
import { Database, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
interface HeaderProps {
  t: any
  dbName: string
}

export function Header({ t, dbName }: HeaderProps) {
  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md sticky top-0 z-10">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-white/60">{t.syncing}</span>
        </div>
        {dbName && (
          <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
            <Database className="w-3 h-3 text-primary" />
            <span>
              Database: <span className="text-primary font-medium">{dbName}</span>
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
