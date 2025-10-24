
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from "date-fns";
import { he } from "date-fns/locale";

export default function WorkoutCalendar({ logs, selectedDate, onDateChange, currentMonth, onMonthChange }) {
  
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const goToPreviousMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const getTotalXpForDate = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => log.date === dateString);
    return dayLogs.reduce((total, log) => total + (log.xp_awarded || 0), 0);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 md:p-6 backdrop-blur-sm">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="text-gray-300 hover:text-white hover:bg-gray-700">
          <ChevronRight className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold text-purple-300">
          {format(currentMonth, "MMMM yyyy", { locale: he })}
        </h2>
        <Button variant="ghost" size="icon" onClick={goToNextMonth} className="text-gray-300 hover:text-white hover:bg-gray-700">
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-gray-400">
        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => <div key={day}>{day}</div>)}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const totalXp = getTotalXpForDate(date);
          const inCurrentMonth = isSameMonth(date, currentMonth);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateChange(date)}
              className={`
                p-2 h-16 text-sm rounded-lg transition-all duration-200 flex flex-col items-center justify-center relative
                ${inCurrentMonth ? 'text-gray-200' : 'text-gray-600 pointer-events-none'}
                ${isSelected ? 'bg-purple-600/50 border border-purple-400 scale-105 shadow-lg' : (inCurrentMonth ? 'hover:bg-gray-700/50' : '')}
                ${isToday ? 'border border-green-500/50' : 'border-transparent'}
              `}
              disabled={!inCurrentMonth}
            >
              <span className="font-medium">{format(date, 'd')}</span>
              {totalXp > 0 && (
                <Badge variant="outline" className="mt-1 px-1 py-0 text-[10px] font-bold border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
                  +{totalXp}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
