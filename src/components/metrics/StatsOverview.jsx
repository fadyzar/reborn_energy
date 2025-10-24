import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Scale, Activity, Award } from "lucide-react";

export default function StatsOverview({ metrics }) {
  // Filter out any metrics that don't have a valid date before processing
  const validMetrics = metrics.filter(m => m && m.date && !isNaN(new Date(m.date)));

  if (validMetrics.length < 2) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle>סטטיסטיקות</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>נדרשות לפחות 2 מדידות להצגת סטטיסטיקה</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedByDate = [...validMetrics].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstMetric = sortedByDate[0];
  const latestMetric = sortedByDate[sortedByDate.length - 1];
  const previousMetric = sortedByDate.length > 1 ? sortedByDate[sortedByDate.length - 2] : null;

  // Change from previous measurement
  const weightChangeSinceLast = previousMetric ? latestMetric.weight - previousMetric.weight : 0;
  
  // Total progress
  const totalWeightChange = latestMetric.weight - firstMetric.weight;

  const getTrendIcon = (change) => {
    if (change > 0.1) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (change < -0.1) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (change) => {
    if (change > 0.1) return 'text-red-600';
    if (change < -0.1) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Current Stats */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            מצב נוכחי
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-blue-600 mb-1">
              {latestMetric.weight} ק"ג
            </h3>
            <p className="text-gray-500">משקל עדכני</p>
          </div>
          {latestMetric.body_fat_percentage && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>אחוז שומן</span>
              <Badge variant="secondary">{latestMetric.body_fat_percentage}%</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trends from last measurement */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-base font-semibold">שינוי ממדידה קודמת</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center gap-4">
            {getTrendIcon(weightChangeSinceLast)}
            <span className={`text-2xl font-bold ${getTrendColor(weightChangeSinceLast)}`}>
              {weightChangeSinceLast > 0 ? '+' : ''}{weightChangeSinceLast.toFixed(1)} ק"ג
            </span>
        </CardContent>
      </Card>
      
      {/* Total Progress */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Award className="w-5 h-5" />
            התקדמות כוללת
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2">
            {getTrendIcon(totalWeightChange)}
            <span className={`text-3xl font-bold ${getTrendColor(totalWeightChange)}`}>
              {totalWeightChange > 0 ? '+' : ''}{totalWeightChange.toFixed(1)} ק"ג
            </span>
          </div>
          <p className="text-sm text-green-700 mt-2">סה"כ שינוי מההתחלה</p>
        </CardContent>
      </Card>
    </div>
  );
}