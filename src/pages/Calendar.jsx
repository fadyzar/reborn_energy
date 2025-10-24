import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { NutritionLog } from "@/api/entities";
import { BodyMetrics } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { he } from "date-fns/locale";

import MonthlyChart from "../components/calendar/MonthlyChart";
import DayDetails from "../components/calendar/DayDetails";

export default function Calendar() {
  const [user, setUser] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyLogs, setMonthlyLogs] = useState([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadMonthlyData();
    }
  }, [user, currentMonth]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const loadMonthlyData = async () => {
    if (!user) return;

    try {
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      // Load nutrition logs for the month
      const logs = await NutritionLog.filter({ user_id: user.id }, '-date', 100);
      const filteredLogs = logs.filter(log => log.date >= monthStart && log.date <= monthEnd);
      setMonthlyLogs(filteredLogs);

      // Load body metrics for the month
      const metrics = await BodyMetrics.filter({ user_id: user.id }, '-date', 50);
      const filteredMetrics = metrics.filter(metric => metric.date >= monthStart && metric.date <= monthEnd);
      setMonthlyMetrics(filteredMetrics);

    } catch (error) {
      console.error("Error loading monthly data:", error);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getDayData = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayLogs = monthlyLogs.filter(log => log.date === dateString);
    const dayMetric = monthlyMetrics.find(metric => metric.date === dateString);

    const totals = dayLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return { logs: dayLogs, metric: dayMetric, totals };
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const selectedDayData = getDayData(selectedDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">יש להתחבר למערכת</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">לוח שנה</h1>
            <p className="text-gray-600">מעקב חודשי אחר התזונה והמדדים</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={goToPreviousMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {format(currentMonth, "MMMM yyyy", { locale: he })}
            </h2>
            <Button variant="outline" onClick={goToNextMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  לוח חודשי
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day) => (
                    <div key={day} className="text-center font-semibold text-gray-600 p-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((date) => {
                    const dayData = getDayData(date);
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    const hasData = dayData.logs.length > 0 || dayData.metric;

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          relative p-2 h-16 text-sm border rounded-lg transition-all duration-200
                          ${isSelected ? 'bg-blue-100 border-blue-500 shadow-md' : 'hover:bg-gray-50'}
                          ${isToday ? 'border-green-500 bg-green-50' : 'border-gray-200'}
                        `}
                      >
                        <div className="font-medium">
                          {format(date, 'd')}
                        </div>
                        
                        {hasData && (
                          <div className="absolute bottom-1 right-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                        
                        {dayData.totals.calories > 0 && (
                          <div className="text-xs text-gray-600 mt-1">
                            {dayData.totals.calories.toFixed(0)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Chart */}
            <div className="mt-6">
              <MonthlyChart logs={monthlyLogs} metrics={monthlyMetrics} />
            </div>
          </div>

          {/* Day Details */}
          <div>
            <DayDetails 
              date={selectedDate}
              data={selectedDayData}
              goals={{
                calories: user.daily_calories_goal || 2000,
                protein: user.daily_protein_goal || 150,
                carbs: user.daily_carbs_goal || 200,
                fat: user.daily_fat_goal || 65
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}