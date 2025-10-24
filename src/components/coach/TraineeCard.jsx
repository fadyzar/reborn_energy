
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  User, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Calendar,
  Eye,
  AlertTriangle,
  Award,
  Zap,
  Scale,
  Minus,
  MessageSquare
} from "lucide-react";
import { format, subDays } from "date-fns";

export default function TraineeCard({ trainee, logs, metrics, timeframe, onSendMessage }) {
  const getTimeframeLogs = () => {
    const now = new Date();
    let cutoffDate;
    
    switch(timeframe) {
      case 'today':
        cutoffDate = format(now, 'yyyy-MM-dd');
        return logs.filter(log => log.date === cutoffDate);
      case 'week':
        cutoffDate = format(subDays(now, 7), 'yyyy-MM-dd');
        return logs.filter(log => log.date >= cutoffDate);
      case 'month':
        cutoffDate = format(subDays(now, 30), 'yyyy-MM-dd');
        return logs.filter(log => log.date >= cutoffDate);
      default:
        return logs;
    }
  };

  const timeframeLogs = getTimeframeLogs();
  const totalCalories = timeframeLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const avgDaily = timeframe === 'today' ? totalCalories : totalCalories / (timeframe === 'week' ? 7 : 30);
  const adherence = Math.min((avgDaily / (trainee.daily_calories_goal || 2000)) * 100, 100);
  
  // Weight calculations
  const sortedMetrics = metrics.sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestMetric = sortedMetrics[0];
  const previousMetric = sortedMetrics[1];
  const weightTrend = (latestMetric && previousMetric) ? latestMetric.weight - previousMetric.weight : 0;
  
  // BMI calculation
  const bmi = (latestMetric && trainee.height) ? 
    (latestMetric.weight / Math.pow(trainee.height / 100, 2)).toFixed(1) : null;

  const getBMICategory = (bmiValue) => {
    if (!bmiValue) return null;
    if (bmiValue < 18.5) return { text: 'תת משקל', color: 'text-blue-600' };
    if (bmiValue < 25) return { text: 'תקין', color: 'text-green-600' };
    if (bmiValue < 30) return { text: 'עודף משקל', color: 'text-yellow-600' };
    return { text: 'השמנה', color: 'text-red-600' };
  };

  const bmiCategory = getBMICategory(parseFloat(bmi));

  const getAdherenceColor = (adherence) => {
    if (adherence >= 80) return 'from-green-100 to-green-200 border-green-300';
    if (adherence >= 60) return 'from-yellow-100 to-yellow-200 border-yellow-300';
    return 'from-red-100 to-red-200 border-red-300';
  };

  const getStatusBadge = () => {
    const recentLogs = logs.filter(log => 
      new Date(log.created_date) > subDays(new Date(), 2)
    );
    
    if (recentLogs.length === 0) {
      return <Badge className="bg-red-100 text-red-700 border-red-300">לא פעיל</Badge>;
    }
    if (adherence >= 80) {
      return <Badge className="bg-green-100 text-green-700 border-green-300">מצטיין</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-700 border-blue-300">פעיל</Badge>;
  };

  const getWeightTrendIcon = (trend) => {
    if (trend > 0.1) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend < -0.1) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Card className={`bg-gradient-to-br ${getAdherenceColor(adherence)} border shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(trainee.hebrew_name || trainee.full_name || 'U')[0]}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                {trainee.hebrew_name || trainee.full_name}
              </h3>
              <p className="text-gray-600 text-sm">{trainee.goal || 'ללא מטרה'}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Weight & BMI Section */}
        {latestMetric && (
          <div className="bg-white/70 rounded-lg p-4 mb-4 border border-white/40">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-gray-700">מדדי גוף</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Current Weight */}
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{latestMetric.weight}</p>
                <p className="text-xs text-gray-600">ק"ג נוכחי</p>
              </div>
              
              {/* Weight Change */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {getWeightTrendIcon(weightTrend)}
                  <span className={`font-bold text-lg ${
                    weightTrend > 0.1 ? 'text-red-600' : 
                    weightTrend < -0.1 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {weightTrend !== 0 ? `${Math.abs(weightTrend).toFixed(1)}` : '0.0'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">שינוי ק"ג</p>
              </div>
              
              {/* BMI */}
              {bmi && (
                <div className="text-center col-span-2">
                  <p className="text-xl font-bold text-gray-800">{bmi}</p>
                  <p className="text-xs text-gray-600">BMI</p>
                  {bmiCategory && (
                    <p className={`text-xs font-medium ${bmiCategory.color}`}>
                      {bmiCategory.text}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Adherence Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 text-sm font-medium">עמידה ביעדים</span>
            <span className="text-gray-800 font-bold">{adherence.toFixed(0)}%</span>
          </div>
          <Progress value={adherence} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/50 rounded-lg p-3 text-center border border-white/30">
            <p className="text-gray-600 text-xs">ממוצע יומי</p>
            <p className="text-gray-800 font-bold">{avgDaily.toFixed(0)}</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3 text-center border border-white/30">
            <p className="text-gray-600 text-xs">רישומים</p>
            <p className="text-gray-800 font-bold">{timeframeLogs.length}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-white/60 hover:bg-white/80 border-white/40"
          >
            <Eye className="w-4 h-4 mr-2" />
            צפה בפרטים
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 px-3"
            onClick={() => onSendMessage(trainee)}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          {adherence < 70 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-red-100 hover:bg-red-200 border-red-300 text-red-700 px-3"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
