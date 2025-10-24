import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Save, X } from "lucide-react";
import { format } from "date-fns";

export default function QuickWeightDialog({ trainee, isOpen, onClose, onSave }) {
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!weight || parseFloat(weight) <= 0) return;
    
    setSaving(true);
    try {
      const weightData = {
        weight: parseFloat(weight),
        date: format(new Date(), 'yyyy-MM-dd'),
        user_id: trainee.id
      };
      
      await onSave(weightData);
      setWeight('');
      onClose();
    } catch (error) {
      console.error('Error saving weight:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-500" />
            עדכון משקל - {trainee?.hebrew_name || trainee?.full_name}
          </DialogTitle>
          <DialogDescription>
            הכנס את המשקל החדש של המתאמן
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="weight">משקל (ק"ג)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70.5"
              className="text-lg"
              autoFocus
            />
          </div>
          
          <div className="text-sm text-gray-500">
            התאריך: {format(new Date(), 'dd/MM/yyyy')}
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            <X className="w-4 h-4 ml-2" />
            ביטול
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={!weight || saving}
            className="bg-gradient-to-r from-green-500 to-blue-500"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            {saving ? 'שומר...' : 'שמור'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}