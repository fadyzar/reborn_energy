import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function SendNotificationDialog({ open, onClose, trainee, onSend }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      alert("יש למלא כותרת ותוכן להודעה.");
      return;
    }
    setIsSending(true);
    await onSend(title, content);
    setIsSending(false);
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>שליחת התראה ל{trainee?.hebrew_name || trainee?.full_name}</DialogTitle>
          <DialogDescription>
            ההתראה תופיע למתאמן בפעמון ההתראות.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              כותרת
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="לדוגמה: כל הכבוד על האימון!"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              תוכן
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3"
              placeholder="כתוב כאן את תוכן ההודעה..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            {isSending ? 'שולח...' : 'שלח התראה'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}