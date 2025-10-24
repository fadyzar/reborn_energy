import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from "date-fns";

export default function PerformanceChart({ logs, selectedTrainee, trainees }) {
  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'yyyy-MM-dd');
    });

    return last7Days.map(date => {
      const dayLogs = logs.filter(log => log.date === date);
      const totalCalories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const totalProtein = dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);

      return {
        date: format(new Date(date), 'dd/MM'),
        calories: totalCalories,
        protein: totalProtein
      };
    });
  };

  const chartData = generateChartData();
  const selectedTraineeName = selectedTrainee === "all" 
    ? "כל המתאמנים" 
    : trainees.find(t => t.id === selectedTrainee)?.hebrew_name || "לא ידוע";

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">
          ביצועים - {selectedTraineeName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.some(d => d.calories > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  direction: 'rtl'
                }}
                formatter={(value, name) => {
                  if (name === 'calories') return [`${value} קלוריות`, 'קלוריות'];
                  if (name === 'protein') return [`${value} גרם`, 'חלבון'];
                  return [value, name];
                }}
              />
              <Area 
                type="monotone" 
                dataKey="calories" 
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.3}
                name="calories"
              />
              <Area 
                type="monotone" 
                dataKey="protein" 
                stroke="#16a34a" 
                fill="#16a34a"
                fillOpacity={0.2}
                name="protein"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">אין נתונים להצגה</p>
            <p className="text-xs mt-1">השבוע האחרון</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}