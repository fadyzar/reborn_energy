import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Target, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

export default function TraineesOverview({ trainees, logs, metrics }) {
  const getTraineeStats = (trainee) => {
    const traineeId = trainee.id;
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    
    const recentLogs = logs.filter(log => 
      log.user_id === traineeId && log.date >= weekAgo
    );
    
    const recentMetrics = metrics.filter(metric => 
      metric.user_id === traineeId
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    const weeklyCalories = recentLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const dailyAverage = recentLogs.length > 0 ? weeklyCalories / 7 : 0;
    const goal = trainee.daily_calories_goal || 2000;
    const adherence = Math.min((dailyAverage / goal) * 100, 100);

    return {
      weeklyLogs: recentLogs.length,
      weeklyCalories,
      dailyAverage,
      adherence,
      latestWeight: recentMetrics[0]?.weight || null,
      weightTrend: recentMetrics.length >= 2 ? 
        recentMetrics[0].weight - recentMetrics[1].weight : 0
    };
  };

  const getStatusColor = (adherence) => {
    if (adherence >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (adherence >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusText = (adherence) => {
    if (adherence >= 80) return "מצוין";
    if (adherence >= 60) return "טוב";
    return "זקוק לשיפור";
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          סקירת מתאמנים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trainees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>אין מתאמנים רשומים</p>
          </div>
        ) : (
          trainees.map((trainee) => {
            const stats = getTraineeStats(trainee);
            
            return (
              <div key={trainee.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">
                      {trainee.hebrew_name || trainee.full_name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      יעד: {trainee.goal || "לא הוגדר"}
                    </p>
                  </div>
                  <Badge className={getStatusColor(stats.adherence)}>
                    {getStatusText(stats.adherence)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">רישומים השבוע</p>
                    <p className="font-semibold">{stats.weeklyLogs}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500">ממוצע יומי</p>
                    <p className="font-semibold">{stats.dailyAverage.toFixed(0)}</p>
                  </div>
                  
                  {stats.latestWeight && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">משקל נוכחי</p>
                      <p className="font-semibold">{stats.latestWeight} ק"ג</p>
                    </div>
                  )}
                  
                  {stats.weightTrend !== 0 && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">שינוי משקל</p>
                      <p className={`font-semibold ${stats.weightTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {stats.weightTrend > 0 ? '+' : ''}{stats.weightTrend.toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>עמידה ביעדים</span>
                    <span>{stats.adherence.toFixed(0)}%</span>
                  </div>
                  <Progress value={stats.adherence} className="h-2" />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}