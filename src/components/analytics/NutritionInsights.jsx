import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";

export default function NutritionInsights({ logs, user }) {
  if (logs.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-300">אין מספיק נתונים לניתוח תזונתי</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate averages
  const totalCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalProtein = logs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const avgCalories = totalCalories / 7; // Week average
  const avgProtein = totalProtein / 7;

  const caloriesGoal = user.daily_calories_goal || 2000;
  const proteinGoal = user.daily_protein_goal || 150;

  const caloriesProgress = (avgCalories / caloriesGoal) * 100;
  const proteinProgress = (avgProtein / proteinGoal) * 100;

  // Analyze patterns
  const mealTypes = logs.reduce((acc, log) => {
    acc[log.meal_type] = (acc[log.meal_type] || 0) + 1;
    return acc;
  }, {});

  const mostCommonMeal = Object.entries(mealTypes).sort(([,a], [,b]) => b - a)[0];

  const insights = [
    {
      type: caloriesProgress > 100 ? 'warning' : caloriesProgress < 80 ? 'danger' : 'success',
      title: 'יעד קלוריות יומי',
      value: `${avgCalories.toFixed(0)}/${caloriesGoal}`,
      percentage: Math.min(caloriesProgress, 100),
      icon: caloriesProgress > 90 && caloriesProgress < 110 ? Target : caloriesProgress > 100 ? TrendingUp : TrendingDown
    },
    {
      type: proteinProgress > 100 ? 'success' : proteinProgress < 80 ? 'warning' : 'normal',
      title: 'יעד חלבון יומי',
      value: `${avgProtein.toFixed(1)}ג/${proteinGoal}ג`,
      percentage: Math.min(proteinProgress, 100),
      icon: proteinProgress > 90 ? Target : TrendingUp
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400 border-green-400 bg-green-400/10';
      case 'warning': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'danger': return 'text-red-400 border-red-400 bg-red-400/10';
      default: return 'text-blue-400 border-blue-400 bg-blue-400/10';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          ביצועי השבוע
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className={`p-4 rounded-lg border ${getTypeColor(insight.type)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{insight.title}</span>
                </div>
                <Badge variant="outline" className="border-current text-current">
                  {insight.value}
                </Badge>
              </div>
              <Progress 
                value={insight.percentage} 
                className="h-2"
              />
              <p className="text-sm mt-2 opacity-80">
                {insight.percentage.toFixed(0)}% מהיעד היומי
              </p>
            </div>
          );
        })}

        {mostCommonMeal && (
          <div className="p-4 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <h4 className="font-medium mb-2 text-purple-300">דפוס אכילה</h4>
            <p className="text-sm text-gray-300">
              השבוע רשמת הכי הרבה <strong>{mostCommonMeal[0]}</strong> ({mostCommonMeal[1]} פעמים)
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{logs.length}</div>
            <div className="text-sm text-gray-400">רישומים</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Object.keys(mealTypes).length}</div>
            <div className="text-sm text-gray-400">סוגי ארוחות</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{(logs.length / 7).toFixed(1)}</div>
            <div className="text-sm text-gray-400">ממוצע יומי</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}