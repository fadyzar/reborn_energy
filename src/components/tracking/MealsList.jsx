import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Utensils, Coffee, Sun, Moon } from "lucide-react";

const mealIcons = {
  "ארוחת בוקר": Coffee,
  "ארוחת צהריים": Sun,
  "ארוחת ערב": Moon,
  "חטיף": Utensils
};

const mealColors = {
  "ארוחת בוקר": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "ארוחת צהריים": "bg-orange-100 text-orange-800 border-orange-200",
  "ארוחת ערב": "bg-blue-100 text-blue-800 border-blue-200",
  "חטיף": "bg-purple-100 text-purple-800 border-purple-200"
};

export default function MealsList({ logs, onEdit, onDelete }) {
  const groupedLogs = logs.reduce((acc, log) => {
    const mealType = log.meal_type || "חטיף";
    if (!acc[mealType]) {
      acc[mealType] = [];
    }
    acc[mealType].push(log);
    return acc;
  }, {});

  const mealTotals = Object.entries(groupedLogs).map(([mealType, mealLogs]) => {
    const totals = mealLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return { mealType, logs: mealLogs, totals };
  });

  if (logs.length === 0) {
    return null; // The parent component handles the empty state message
  }

  return (
    <div className="space-y-6">
      {mealTotals.map(({ mealType, logs: mealLogs, totals }) => {
        const Icon = mealIcons[mealType] || Utensils;
        
        return (
          <Card key={mealType} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-gray-600" />
                  {mealType}
                </CardTitle>
                <Badge className={mealColors[mealType]}>
                  {totals.calories.toFixed(0)} קלוריות
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-500">קלוריות</p>
                  <p className="font-semibold">{totals.calories.toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">חלבון</p>
                  <p className="font-semibold">{totals.protein.toFixed(1)}ג</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">פחמימות</p>
                  <p className="font-semibold">{totals.carbs.toFixed(1)}ג</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">שומן</p>
                  <p className="font-semibold">{totals.fat.toFixed(1)}ג</p>
                </div>
              </div>

              <div className="space-y-3">
                {mealLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {log.photo_url && (
                        <img 
                          src={log.photo_url} 
                          alt={log.food_name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{log.food_name}</h4>
                        <p className="text-sm text-gray-500">
                          {log.quantity ? `${log.quantity}ג • ` : ''}{log.calories} קלוריות
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(log)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(log.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}