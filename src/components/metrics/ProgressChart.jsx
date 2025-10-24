import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";

export default function ProgressChart({ metrics }) {
  const chartData = metrics
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(metric => ({
      date: format(new Date(metric.date), 'dd/MM'),
      weight: metric.weight,
      bodyFat: metric.body_fat_percentage,
      waist: metric.waist_circumference
    }));

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle>גרף התקדמות</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
                  if (name === 'weight') return [`${value} ק"ג`, 'משקל'];
                  if (name === 'bodyFat') return [`${value}%`, 'אחוז שומן'];
                  if (name === 'waist') return [`${value} ס"מ`, 'היקף מותניים'];
                  return [value, name];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="weight"
              />
              {chartData.some(d => d.bodyFat) && (
                <Line 
                  type="monotone" 
                  dataKey="bodyFat" 
                  stroke="#16a34a" 
                  strokeWidth={2}
                  dot={{ fill: '#16a34a', strokeWidth: 2, r: 3 }}
                  name="bodyFat"
                />
              )}
              {chartData.some(d => d.waist) && (
                <Line 
                  type="monotone" 
                  dataKey="waist" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 3 }}
                  name="waist"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>נדרשות לפחות 2 מדידות כדי להציג גרף התקדמות</p>
            <p className="text-sm mt-2">המשך לרשום מדידות לעקוב אחר ההתקדמות</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}