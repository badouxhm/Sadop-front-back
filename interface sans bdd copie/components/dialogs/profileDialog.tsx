"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

interface ProfileDialogProps {
  open: boolean
  setOpen: (val: boolean) => void
}

export function ProfileDialog({ open, setOpen }: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>User Clearance: Level 5</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <Avatar className="w-24 h-24 ring-4 ring-primary/20">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-bold">Commander Shepard</h3>
            <p className="text-primary font-mono text-sm uppercase tracking-widest">Neural Key: 0x7E2...A1</p>
          </div>
          <div className="w-full grid grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/5 p-3 text-center">
              <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Syncs</div>
              <div className="text-xl font-bold">1,284</div>
            </Card>
            <Card className="bg-white/5 border-white/5 p-3 text-center">
              <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Rank</div>
              <div className="text-xl font-bold text-primary">Elite</div>
            </Card>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="w-full text-white/60">
            Return to Interface
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
