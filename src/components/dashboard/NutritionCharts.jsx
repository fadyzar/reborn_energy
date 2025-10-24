import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Target, Activity } from "lucide-react";

export default function NutritionCharts({ weeklyData, user }) {
  const chartData = useMemo(() => {
    return weeklyData.map(day => ({
      ...day,
      caloriesGoal: user?.daily_calories_goal || 2000,
      proteinGoal: user?.daily_protein_goal || 150,
      carbsGoal: user?.daily_carbs_goal || 200,
      fatGoal: user?.daily_fat_goal || 60,
    }));
  }, [weeklyData, user]);

  const hasData = weeklyData.some(day => day.calories > 0);

  if (!hasData) {
    return (
      <Card className="bg-gradient-to-br from-white/90 to-blue-50/50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-xl border-0 shadow-2xl">
        <CardContent className="p-12 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            אין נתונים להצגה
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            התחל לרשום ארוחות כדי לראות את הגרפים שלך
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xl">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-semibold">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(0) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 lg:gap-8">
      <Card className="bg-gradient-to-br from-white/90 to-blue-50/50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-xl border-0 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-gray-900 dark:text-white">
                קלוריות יומיות
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">מעקב אחר צריכה מול יעד</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 13, fontWeight: 600 }}
                stroke="#6b7280"
                className="dark:stroke-slate-400"
              />
              <YAxis
                tick={{ fontSize: 13, fontWeight: 600 }}
                stroke="#6b7280"
                className="dark:stroke-slate-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
                iconType="circle"
              />
              <ReferenceLine
                y={user?.daily_calories_goal || 2000}
                stroke="#16a34a"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: 'יעד', position: 'right', fill: '#16a34a', fontWeight: 'bold' }}
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="#f97316"
                strokeWidth={3}
                fill="url(#colorCalories)"
                name="קלוריות"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        <Card className="bg-gradient-to-br from-white/90 to-green-50/50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-xl border-0 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-xl font-black text-gray-900 dark:text-white">
                חלבון יומי
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  stroke="#6b7280"
                  className="dark:stroke-slate-400"
                />
                <YAxis
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  stroke="#6b7280"
                  className="dark:stroke-slate-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={user?.daily_protein_goal || 150}
                  stroke="#16a34a"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
                <Bar
                  dataKey="protein"
                  fill="#10b981"
                  name="חלבון (גרם)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white/90 to-purple-50/50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-xl border-0 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-xl font-black text-gray-900 dark:text-white">
                מאקרו נוספים
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  stroke="#6b7280"
                  className="dark:stroke-slate-400"
                />
                <YAxis
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  stroke="#6b7280"
                  className="dark:stroke-slate-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '13px', fontWeight: 600 }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="carbs"
                  stroke="#eab308"
                  strokeWidth={3}
                  dot={{ fill: '#eab308', strokeWidth: 2, r: 5 }}
                  name="פחמימות (גרם)"
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="fat"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                  name="שומן (גרם)"
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
