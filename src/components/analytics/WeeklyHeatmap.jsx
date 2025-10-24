import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format, startOfWeek, addDays, isToday } from "date-fns";
import { he } from "date-fns/locale";

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export default function WeeklyHeatmap({ logs }) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => log.date === dateString);
    const totalCalories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    
    // Calculate intensity based on calories (0-4 levels)
    let intensity = 0;
    if (totalCalories > 0) {
      intensity = Math.min(4, Math.ceil(totalCalories / 500));
    }
    
    return {
      date,
      day: DAYS[i],
      calories: totalCalories,
      meals: dayLogs.length,
      intensity,
      isToday: isToday(date)
    };
  });

  const getIntensityClass = (intensity) => {
    switch (intensity) {
      case 0: return 'bg-gray-700';
      case 1: return 'bg-purple-800';
      case 2: return 'bg-purple-600';
      case 3: return 'bg-purple-500';
      case 4: return 'bg-purple-400';
      default: return 'bg-gray-700';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          מפת פעילות שבועית
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-gray-400 mb-2">{day.day}</div>
              <div 
                className={`
                  w-full h-20 rounded-lg flex flex-col items-center justify-center
                  transition-all duration-300 hover:scale-105 cursor-pointer
                  ${getIntensityClass(day.intensity)}
                  ${day.isToday ? 'ring-2 ring-yellow-400' : ''}
                `}
              >
                <div className="text-lg font-bold">
                  {format(day.date, 'd')}
                </div>
                <div className="text-xs">
                  {day.calories > 0 ? `${day.calories}` : '-'}
                </div>
                <div className="text-xs opacity-75">
                  {day.meals > 0 ? `${day.meals} ארוחות` : 'ללא נתונים'}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-sm text-gray-400">פחות</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div 
              key={level}
              className={`w-4 h-4 rounded-sm ${getIntensityClass(level)}`}
            ></div>
          ))}
          <span className="text-sm text-gray-400">יותר</span>
        </div>
      </CardContent>
    </Card>
  );
}