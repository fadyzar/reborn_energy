import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Brain, Trophy, Zap } from 'lucide-react';

const proFeaturesLost = [
    { name: 'תובנות AI חכמות', icon: Brain },
    { name: 'השוואת מתאמנים מתקדמת', icon: Trophy },
    { name: 'חיזוי ביצועים עתידיים', icon: Zap },
    { name: 'זיהוי גורמי סיכון אוטומטי', icon: AlertTriangle },
];

export default function DowngradeDialog({ open, onOpenChange, onConfirm, isDowngrading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            אישור חזרה למסלול החינמי
          </DialogTitle>
          <DialogDescription className="text-slate-400 pt-2">
            האם אתה בטוח? המנוי שלך יישאר פעיל עד סוף תקופת החיוב הנוכחית. לאחר מכן, תאבד גישה לפיצ'רים הבאים:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="space-y-3">
            {proFeaturesLost.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-slate-300">
                <feature.icon className="w-5 h-5 text-red-500" />
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-400">
            תוכל לשדרג חזרה ל-Pro בכל עת.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="hover:bg-slate-700 hover:text-white">ביטול</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm} disabled={isDowngrading}>
            {isDowngrading ? "מעבד..." : "אני מבין, בטל את המנוי"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}