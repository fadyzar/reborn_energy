import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Clock } from "lucide-react";
import { format, subDays } from "date-fns";

export default function AlertsPanel({ trainees, logs, metrics }) {
  const generateAlerts = () => {
    const alerts = [];
    const threeDaysAgo = format(subDays(new Date(), 3), 'yyyy-MM-dd');
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    trainees.forEach(trainee => {
      // Check for inactive users (no logs in 3 days)
      const recentLogs = logs.filter(log => 
        log.user_id === trainee.id && log.date >= threeDaysAgo
      );

      if (recentLogs.length === 0) {
        alerts.push({
          type: 'inactive',
          severity: 'high',
          trainee: trainee.hebrew_name || trainee.full_name,
          message: 'לא רשם ארוחות ב-3 הימים האחרונים',
          icon: Clock
        });
      }

      // Check for weight gain when goal is weight loss
      if (trainee.goal === 'ירידה במשקל') {
        const traineeMetrics = metrics
          .filter(m => m.user_id === trainee.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (traineeMetrics.length >= 2) {
          const weightChange = traineeMetrics[0].weight - traineeMetrics[1].weight;
          if (weightChange > 0.5) {
            alerts.push({
              type: 'weight_gain',
              severity: 'medium',
              trainee: trainee.hebrew_name || trainee.full_name,
              message: `עלייה במשקל של ${weightChange.toFixed(1)} ק"ג`,
              icon: TrendingDown
            });
          }
        }
      }

      // Check for low calorie intake
      const weeklyLogs = logs.filter(log => 
        log.user_id === trainee.id && log.date >= weekAgo
      );

      if (weeklyLogs.length > 0) {
        const weeklyCalories = weeklyLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
        const dailyAverage = weeklyCalories / 7;
        const goal = trainee.daily_calories_goal || 2000;

        if (dailyAverage < goal * 0.7) {
          alerts.push({
            type: 'low_calories',
            severity: 'medium',
            trainee: trainee.hebrew_name || trainee.full_name,
            message: `צריכת קלוריות נמוכה - ${dailyAverage.toFixed(0)} ממוצע יומי`,
            icon: AlertTriangle
          });
        }
      }
    });

    return alerts.slice(0, 5); // Show only top 5 alerts
  };

  const alerts = generateAlerts();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'high': return 'דחוף';
      case 'medium': return 'בינוני';
      default: return 'נמוך';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          התראות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">אין התראות פעילות</p>
          </div>
        ) : (
          alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{alert.trainee}</p>
                      <Badge 
                        variant="secondary" 
                        className={getSeverityColor(alert.severity)}
                      >
                        {getSeverityText(alert.severity)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}