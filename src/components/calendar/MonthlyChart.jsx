import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from "date-fns";

export default function MonthlyChart({ logs, metrics }) {
  // Group logs by date for calories chart
  const caloriesData = {};
  logs.forEach(log => {
    if (!caloriesData[log.date]) {
      caloriesData[log.date] = 0;
    }
    caloriesData[log.date] += log.calories || 0;
  });

  const chartData = Object.entries(caloriesData)
    .map(([date, calories]) => ({
      date: format(new Date(date), 'dd/MM'),
      calories,
      weight: metrics.find(m => m.date === date)?.weight || null
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calories Chart */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">קלוריות יומיות</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
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
                  formatter={(value) => [`${value} קלוריות`, 'קלוריות']}
                />
                <Bar 
                  dataKey="calories" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>אין נתונים להצגה</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weight Chart */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">מעקב משקל</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metrics.map(m => ({
                date: format(new Date(m.date), 'dd/MM'),
                weight: m.weight
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    direction: 'rtl'
                  }}
                  formatter={(value) => [`${value} ק"ג`, 'משקל']}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#16a34a" 
                  strokeWidth={3}
                  dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>אין נתוני משקל</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}