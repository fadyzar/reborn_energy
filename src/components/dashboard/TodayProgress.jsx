import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Utensils, Coffee, Sun, Moon } from "lucide-react";

const mealIcons = {
  "ארוחת בוקר": Coffee,
  "ארוחת צהריים": Sun,
  "ארוחת ערב": Moon,
  "חטיף": Utensils
};

export default function TodayProgress({ todayTotals, goals, logs }) {
  const macroData = [
    {
      name: "קלוריות",
      current: todayTotals.calories,
      goal: goals.calories,
      color: "bg-blue-500",
      unit: ""
    },
    {
      name: "חלבון",
      current: todayTotals.protein,
      goal: goals.protein,
      color: "bg-green-500",
      unit: "גרם"
    },
    {
      name: "פחמימות",
      current: todayTotals.carbs,
      goal: goals.carbs,
      color: "bg-yellow-500",
      unit: "גרם"
    },
    {
      name: "שומן",
      current: todayTotals.fat,
      goal: goals.fat,
      color: "bg-red-500",
      unit: "גרם"
    }
  ];

  const mealGroups = logs.reduce((acc, log) => {
    if (!acc[log.meal_type]) {
      acc[log.meal_type] = [];
    }
    acc[log.meal_type].push(log);
    return acc;
  }, {});

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">התקדמות היום</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Macro Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {macroData.map((macro) => {
            const percentage = Math.min((macro.current / macro.goal) * 100, 100);
            return (
              <div key={macro.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{macro.name}</span>
                  <span className="text-sm text-gray-500">
                    {macro.current.toFixed(0)}/{macro.goal} {macro.unit}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {percentage.toFixed(0)}% מהיעד
                </p>
              </div>
            );
          })}
        </div>

        {/* Today's Meals */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">ארוחות היום</h3>
          {Object.entries(mealGroups).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(mealGroups).map(([mealType, mealLogs]) => {
                const Icon = mealIcons[mealType] || Utensils;
                const totalCalories = mealLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
                
                return (
                  <div key={mealType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{mealType}</p>
                        <p className="text-sm text-gray-500">
                          {mealLogs.length} פריטים
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {totalCalories} קלוריות
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>לא נרשמו ארוחות היום</p>
              <p className="text-sm">התחל לרשום את הארוחות שלך</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}