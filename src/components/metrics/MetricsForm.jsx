import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { format } from "date-fns";

export default function MetricsForm({ metric, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(metric || {
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: "",
    body_fat_percentage: "",
    waist_circumference: "",
    chest_circumference: "",
    thigh_circumference: "",
    arm_circumference: "",
    notes: ""
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const dataToSubmit = {
      ...formData,
      weight: parseFloat(formData.weight) || 0,
      body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
      waist_circumference: formData.waist_circumference ? parseFloat(formData.waist_circumference) : null,
      chest_circumference: formData.chest_circumference ? parseFloat(formData.chest_circumference) : null,
      thigh_circumference: formData.thigh_circumference ? parseFloat(formData.thigh_circumference) : null,
      arm_circumference: formData.arm_circumference ? parseFloat(formData.arm_circumference) : null,
    };

    await onSubmit(dataToSubmit);
    setSaving(false);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle>
          {metric ? "עריכת מדידה" : "הוספת מדידה חדשה"}
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">תאריך המדידה</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>

          {/* Weight - Required */}
          <div className="space-y-2">
            <Label htmlFor="weight">משקל (ק"ג) *</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              step="0.1"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              placeholder="70.5"
              required
            />
          </div>

          {/* Body Fat Percentage */}
          <div className="space-y-2">
            <Label htmlFor="body_fat_percentage">אחוז שומן בגוף (%)</Label>
            <Input
              id="body_fat_percentage"
              type="number"
              min="0"
              max="50"
              step="0.1"
              value={formData.body_fat_percentage}
              onChange={(e) => handleInputChange('body_fat_percentage', e.target.value)}
              placeholder="15.5"
            />
          </div>

          {/* Body Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waist_circumference">היקף מותניים (ס"מ)</Label>
              <Input
                id="waist_circumference"
                type="number"
                min="0"
                step="0.1"
                value={formData.waist_circumference}
                onChange={(e) => handleInputChange('waist_circumference', e.target.value)}
                placeholder="80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chest_circumference">היקף חזה (ס"מ)</Label>
              <Input
                id="chest_circumference"
                type="number"
                min="0"
                step="0.1"
                value={formData.chest_circumference}
                onChange={(e) => handleInputChange('chest_circumference', e.target.value)}
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thigh_circumference">היקף ירך (ס"מ)</Label>
              <Input
                id="thigh_circumference"
                type="number"
                min="0"
                step="0.1"
                value={formData.thigh_circumference}
                onChange={(e) => handleInputChange('thigh_circumference', e.target.value)}
                placeholder="60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arm_circumference">היקף זרוע (ס"מ)</Label>
              <Input
                id="arm_circumference"
                type="number"
                min="0"
                step="0.1"
                value={formData.arm_circumference}
                onChange={(e) => handleInputChange('arm_circumference', e.target.value)}
                placeholder="35"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="הערות על המדידה (זמן, תנאים וכו')"
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            <X className="w-4 h-4 ml-2" />
            ביטול
          </Button>
          <Button
            type="submit"
            disabled={saving || !formData.weight}
            className="bg-gradient-to-r from-blue-500 to-green-500"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            {saving ? "שומר..." : "שמור"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}