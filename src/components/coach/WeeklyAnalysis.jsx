
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export default function WeeklyAnalysis({ logs, trainees }) {
  // Generate last 7 days data
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const chartData = last7Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => log.date === dateStr);
    
    const totalCalories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const activeTrainees = new Set(dayLogs.map(log => log.user_id)).size;
    const totalLogs = dayLogs.length;
    
    return {
      date: format(date, 'dd/MM'),
      fullDate: dateStr,
      calories: totalCalories,
      activeTrainees,
      totalLogs,
      avgCalories: activeTrainees > 0 ? totalCalories / activeTrainees : 0
    };
  });

  const totalWeeklyCalories = chartData.reduce((sum, day) => sum + day.calories, 0);
  const avgDailyActive = chartData.reduce((sum, day) => sum + day.activeTrainees, 0) / 7;

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          ניתוח שבועי מתקדם
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-blue-200 text-sm">סה"כ קלוריות</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalWeeklyCalories.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-green-200 text-sm">ממוצע פעילים</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{avgDailyActive.toFixed(1)}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-purple-200 text-sm">סה"כ רישומים</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{chartData.reduce((sum, day) => sum + day.totalLogs, 0)}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Calories Chart */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              מעקב קלוריות שבועי
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value, name) => [
                    name === 'calories' ? `${value.toLocaleString()} קלוריות` : value,
                    name === 'calories' ? 'קלוריות' : 'מתאמנים פעילים'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorCalories)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Active Trainees Chart */}
          <div>
            <h4 className="text-white font-semibold mb-3">מתאמנים פעילים יומיים</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="activeTrainees" 
                  stroke="#00ff88" 
                  strokeWidth={3}
                  dot={{ fill: '#00ff88', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
