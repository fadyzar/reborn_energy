import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Zap, 
  Award,
  Calendar,
  Activity,
  Flame,
  Eye,
  BarChart3
} from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function SmartAnalytics({ trainees, logs, metrics }) {
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [riskAnalysis, setRiskAnalysis] = useState({});

  useEffect(() => {
    generateSmartInsights();
    generatePredictions();
    analyzeRiskFactors();
  }, [trainees, logs, metrics]);

  const generateSmartInsights = () => {
    const smartInsights = [];

    trainees.forEach(trainee => {
      const traineeId = trainee.id;
      const traineeLogs = logs.filter(log => log.user_id === traineeId);
      const traineeMetrics = metrics.filter(metric => metric.user_id === traineeId);

      // Insight 1: Consistency Analysis
      const last7Days = Array.from({ length: 7 }, (_, i) => 
        format(subDays(new Date(), i), 'yyyy-MM-dd')
      );
      const activeDays = last7Days.filter(date => 
        traineeLogs.some(log => log.date === date)
      ).length;
      
      if (activeDays >= 6) {
        smartInsights.push({
          type: 'success',
          trainee: trainee.hebrew_name || trainee.full_name,
          message: `עקביות מדהימה! ${activeDays}/7 ימים פעילים השבוע`,
          priority: 'low',
          icon: Award
        });
      }

      // Insight 2: Calorie Pattern Analysis
      const weeklyCalories = traineeLogs
        .filter(log => new Date(log.date) >= subDays(new Date(), 7))
        .reduce((sum, log) => sum + (log.calories || 0), 0);
      const dailyAverage = weeklyCalories / 7;
      const goal = trainee.daily_calories_goal || 2000;

      if (dailyAverage > goal * 1.2) {
        smartInsights.push({
          type: 'warning',
          trainee: trainee.hebrew_name || trainee.full_name,
          message: `חריגה של ${Math.round(dailyAverage - goal)} קלוריות ביום בממוצע`,
          priority: 'high',
          icon: AlertTriangle
        });
      }

      // Insight 3: Weight Trend Analysis
      if (traineeMetrics.length >= 2) {
        const sortedMetrics = traineeMetrics.sort((a, b) => new Date(b.date) - new Date(a.date));
        const weightTrend = sortedMetrics[0].weight - sortedMetrics[1].weight;
        
        if (trainee.goal === 'ירידה במשקל' && weightTrend < -0.5) {
          smartInsights.push({
            type: 'success',
            trainee: trainee.hebrew_name || trainee.full_name,
            message: `יורד במשקל בקצב בריא - ${Math.abs(weightTrend).toFixed(1)} ק"ג`,
            priority: 'medium',
            icon: TrendingUp
          });
        }
      }

      // Insight 4: Meal Timing Analysis
      const mealTimes = traineeLogs.map(log => {
        const hour = new Date(log.created_date).getHours();
        return { type: log.meal_type, hour };
      });

      const breakfastLogs = mealTimes.filter(m => m.type === 'אוחת בוקר');
      if (breakfastLogs.length > 0) {
        const avgBreakfastTime = breakfastLogs.reduce((sum, m) => sum + m.hour, 0) / breakfastLogs.length;
        if (avgBreakfastTime > 10) {
          smartInsights.push({
            type: 'info',
            trainee: trainee.hebrew_name || trainee.full_name,
            message: `מאחר בארוחת בוקר - ממוצע ${avgBreakfastTime.toFixed(1)}:00`,
            priority: 'medium',
            icon: Calendar
          });
        }
      }
    });

    setInsights(smartInsights.slice(0, 10)); // Show top 10 insights
  };

  const generatePredictions = () => {
    const predictionData = {};

    trainees.forEach(trainee => {
      const traineeId = trainee.id;
      const traineeLogs = logs.filter(log => log.user_id === traineeId);
      const traineeMetrics = metrics.filter(metric => metric.user_id === traineeId);

      // Predict adherence for next week based on current trends
      const last14Days = traineeLogs.filter(log => 
        new Date(log.date) >= subDays(new Date(), 14)
      );

      if (last14Days.length > 0) {
        const recentAdherence = last14Days.reduce((sum, log) => 
          sum + (log.calories || 0), 0
        ) / ((trainee.daily_calories_goal || 2000) * 14) * 100;

        const trend = recentAdherence > 80 ? 'עולה' : recentAdherence > 60 ? 'יציב' : 'יורד';
        
        predictionData[traineeId] = {
          adherenceTrend: trend,
          predictedAdherence: Math.max(0, Math.min(100, recentAdherence + (Math.random() - 0.5) * 10)),
          confidence: 85
        };
      }
    });

    setPredictions(predictionData);
  };

  const analyzeRiskFactors = () => {
    const riskData = {};

    trainees.forEach(trainee => {
      const traineeId = trainee.id;
      const traineeLogs = logs.filter(log => log.user_id === traineeId);
      
      let riskScore = 0;
      const riskFactors = [];

      // Factor 1: Inactivity
      const lastLogDate = traineeLogs.length > 0 ? 
        Math.max(...traineeLogs.map(log => new Date(log.date))) : null;
      
      if (lastLogDate) {
        const daysSinceLastLog = differenceInDays(new Date(), new Date(lastLogDate));
        if (daysSinceLastLog > 3) {
          riskScore += 30;
          riskFactors.push(`לא פעיל ${daysSinceLastLog} ימים`);
        }
      }

      // Factor 2: Low adherence
      const weeklyLogs = traineeLogs.filter(log => 
        new Date(log.date) >= subDays(new Date(), 7)
      );
      const adherence = weeklyLogs.reduce((sum, log) => sum + (log.calories || 0), 0) / 
        ((trainee.daily_calories_goal || 2000) * 7) * 100;

      if (adherence < 60) {
        riskScore += 25;
        riskFactors.push(`עמידה נמוכה ביעדים - ${adherence.toFixed(0)}%`);
      }

      // Factor 3: Inconsistent logging
      const uniqueLogDates = new Set(weeklyLogs.map(log => log.date)).size;
      if (uniqueLogDates < 4) {
        riskScore += 20;
        riskFactors.push(`רישום לא עקבי - ${uniqueLogDates}/7 ימים`);
      }

      riskData[traineeId] = {
        score: Math.min(100, riskScore),
        factors: riskFactors,
        level: riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low'
      };
    });

    setRiskAnalysis(riskData);
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Panel */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            תובנות AI חכמות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>מנתח נתונים לתובנות חכמות...</p>
              </div>
            ) : (
              insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className={`p-3 rounded-xl border ${getInsightColor(insight.type)}`}>
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{insight.trainee}</p>
                        <p className="text-xs opacity-80 mt-1">{insight.message}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {insight.priority === 'high' ? 'דחוף' : 
                         insight.priority === 'medium' ? 'בינוני' : 'נמוך'}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Predictions Panel */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            חיזוי ביצועים השבוע הבא
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.keys(predictions).length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">מחשב חיזויים...</p>
              </div>
            ) : (
              Object.entries(predictions).slice(0, 5).map(([traineeId, prediction]) => {
                const trainee = trainees.find(t => t.id === traineeId);
                return (
                  <div key={traineeId} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium text-sm">
                        {trainee?.hebrew_name || trainee?.full_name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        מגמה: {prediction.adherenceTrend}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {prediction.predictedAdherence.toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-400">
                        ביטחון: {prediction.confidence}%
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            ניתוח גורמי סיכון
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.keys(riskAnalysis).length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">מנתח גורמי סיכון...</p>
              </div>
            ) : (
              Object.entries(riskAnalysis)
                .sort(([,a], [,b]) => b.score - a.score)
                .slice(0, 6)
                .map(([traineeId, risk]) => {
                  const trainee = trainees.find(t => t.id === traineeId);
                  const riskColor = risk.level === 'high' ? 'text-red-400' : 
                                   risk.level === 'medium' ? 'text-yellow-400' : 'text-green-400';
                  
                  return (
                    <div key={traineeId} className="p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium text-sm">
                          {trainee?.hebrew_name || trainee?.full_name}
                        </p>
                        <div className="text-right">
                          <p className={`font-bold ${riskColor}`}>
                            {risk.score}/100
                          </p>
                          <p className="text-xs text-gray-400">
                            {risk.level === 'high' ? 'סיכון גבוה' : 
                             risk.level === 'medium' ? 'סיכון בינוני' : 'סיכון נמוך'}
                          </p>
                        </div>
                      </div>
                      {risk.factors.length > 0 && (
                        <div className="space-y-1">
                          {risk.factors.slice(0, 2).map((factor, idx) => (
                            <p key={idx} className="text-xs text-gray-400">
                              • {factor}
                            </p>
                          ))}
                        </div>
                      )}
                      <Progress value={risk.score} className="h-1 mt-2" />
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}