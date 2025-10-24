import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadFile } from "@/api/integrations";
import { Upload, Save, X, Loader2 } from "lucide-react";

const MEAL_TYPES = [
  "ארוחת בוקר",
  "ארוחת צהריים", 
  "ארוחת ערב",
  "חטיף"
];

export default function NutritionForm({ log, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(log || {
    meal_type: "ארוחת בוקר",
    food_name: "",
    quantity: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    notes: "",
    photo_url: ""
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        photo_url: file_url
      }));
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const dataToSubmit = {
      ...formData,
      quantity: parseFloat(formData.quantity) || 0,
      calories: parseFloat(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fat: parseFloat(formData.fat) || 0,
    };

    await onSubmit(dataToSubmit);
    setSaving(false);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {log ? "עריכת רישום" : "הוספת ארוחה חדשה"}
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal_type">סוג ארוחה</Label>
              <Select
                value={formData.meal_type}
                onValueChange={(value) => handleInputChange('meal_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג ארוחה" />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="food_name">שם המזון</Label>
              <Input
                id="food_name"
                value={formData.food_name}
                onChange={(e) => handleInputChange('food_name', e.target.value)}
                placeholder="לדוגמה: עוף בגריל"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">כמות (גרם)</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">קלוריות</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                step="0.1"
                value={formData.calories}
                onChange={(e) => handleInputChange('calories', e.target.value)}
                placeholder="200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein">חלבון (גרם)</Label>
              <Input
                id="protein"
                type="number"
                min="0"
                step="0.1"
                value={formData.protein}
                onChange={(e) => handleInputChange('protein', e.target.value)}
                placeholder="20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs">פחמימות (גרם)</Label>
              <Input
                id="carbs"
                type="number"
                min="0"
                step="0.1"
                value={formData.carbs}
                onChange={(e) => handleInputChange('carbs', e.target.value)}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat">שומן (גרם)</Label>
              <Input
                id="fat"
                type="number"
                min="0"
                step="0.1"
                value={formData.fat}
                onChange={(e) => handleInputChange('fat', e.target.value)}
                placeholder="5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>תמונת הארוחה (אופציונלי)</Label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handlePhotoUpload(file);
                }}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    {uploading ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 ml-2" />
                    )}
                    {uploading ? "מעלה..." : "העלה תמונה"}
                  </span>
                </Button>
              </label>
            </div>
            
            {formData.photo_url && (
              <div className="mt-2">
                <img 
                  src={formData.photo_url} 
                  alt="תמונת הארוחה" 
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות (אופציונלי)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="הערות נוספות על הארוחה..."
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
            disabled={saving || !formData.food_name}
            className="bg-gradient-to-r from-blue-500 to-green-500"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
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