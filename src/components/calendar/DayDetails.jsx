import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Scale, Target } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function DayDetails({ date, data, goals }) {
  const { logs, metric, totals } = data;

  const macroData = [
    {
      name: "קלוריות",
      current: totals.calories,
      goal: goals.calories,
      color: "bg-blue-500"
    },
    {
      name: "חלבון",
      current: totals.protein,
      goal: goals.protein,
      color: "bg-green-500",
      unit: "ג"
    },
    {
      name: "פחמימות",
      current: totals.carbs,  
      goal: goals.carbs,
      color: "bg-yellow-500",
      unit: "ג"
    },
    {
      name: "שומן",
      current: totals.fat,
      goal: goals.fat,
      color: "bg-red-500",
      unit: "ג"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Date Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            פרטי היום
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-1">
              {format(date, "dd MMMM", { locale: he })}
            </h3>
            <p className="text-gray-600">
              {format(date, "EEEE", { locale: he })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Progress */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            התקדמות תזונתית
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {macroData.map((macro) => {
            const percentage = Math.min((macro.current / macro.goal) * 100, 100);
            return (
              <div key={macro.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{macro.name}</span>
                  <span className="text-sm text-gray-500">
                    {macro.current.toFixed(0)}/{macro.goal} {macro.unit || ''}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-gray-500">
                  {percentage.toFixed(0)}% מהיעד
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Body Metrics */}
      {metric && (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              מדדי גוף
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>משקל</span>
              <Badge variant="secondary">{metric.weight} ק"ג</Badge>
            </div>
            
            {metric.body_fat_percentage && (
              <div className="flex justify-between items-center">
                <span>אחוז שומן</span>
                <Badge variant="secondary">{metric.body_fat_percentage}%</Badge>
              </div>
            )}
            
            {metric.waist_circumference && (
              <div className="flex justify-between items-center">
                <span>היקף מותניים</span>
                <Badge variant="secondary">{metric.waist_circumference} ס"מ</Badge>
              </div>
            )}
            
            {metric.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{metric.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meals Summary */}
      {logs.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle>ארוחות היום</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{log.food_name}</p>
                  <p className="text-xs text-gray-500">{log.meal_type}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {log.calories} קל'
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}