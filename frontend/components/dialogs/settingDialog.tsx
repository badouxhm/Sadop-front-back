"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SettingsDialogProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  t: any;
}

export function SettingsDialog({ open, setOpen, t }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{t.settings}</DialogTitle>
          <DialogDescription className="text-white/40">
            Configure your neural link parameters.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Neural Adaptation</Label>
              <p className="text-xs text-white/40">
                Optimize response speed for your typing style.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Voice Synthesis</Label>
              <p className="text-xs text-white/40">
                Enable high-fidelity holographic audio.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
        </div>
        <DialogFooter>
          <Button
            onClick={() => setOpen(false)}
            className="bg-primary hover:bg-primary/80"
          >
            Update Core Config
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
