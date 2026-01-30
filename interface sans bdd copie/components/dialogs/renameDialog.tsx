"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RenameDialogProps {
  isRenaming: string | number | null
  renameValue: string
  setRenameValue: (val: string) => void
  setIsRenaming: (val: string | number | null) => void
  handleRename: () => void
}

export function RenameDialog({ isRenaming, renameValue, setRenameValue, setIsRenaming, handleRename }: RenameDialogProps) {
  return (
    <Dialog open={!!isRenaming} onOpenChange={(open) => !open && setIsRenaming(null)}>
      <DialogContent className="glass border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Rename Session</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-primary/50"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsRenaming(null)} className="text-white/60 hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleRename} className="bg-primary hover:bg-primary/80">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
