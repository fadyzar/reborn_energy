import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Award, Calendar } from "lucide-react";

export default function GoalProgress({ user, logs, metrics }) {
  const weekCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const weekProtein = logs.reduce((sum, log) => sum + (log.protein || 0), 0);
  
  const dailyCaloriesGoal = user.daily_calories_goal || 2000;
  const dailyProteinGoal = user.daily_protein_goal || 150;
  const weeklyCaloriesGoal = dailyCaloriesGoal * 7;
  const weeklyProteinGoal = dailyProteinGoal * 7;

  const caloriesProgress = Math.min((weekCalories / weeklyCaloriesGoal) * 100, 100);
  const proteinProgress = Math.min((weekProtein / weeklyProteinGoal) * 100, 100);

  const latestWeight = metrics.length > 0 ? metrics[0].weight : null;
  const previousWeight = metrics.length > 1 ? metrics[1].weight : null;
  const weightChange = latestWeight && previousWeight ? latestWeight - previousWeight : 0;

  const goals = [
    {
      title: 'קלוריות שבועי',
      current: weekCalories,
      target: weeklyCaloriesGoal,
      progress: caloriesProgress,
      unit: '',
      icon: Target,
      color: 'text-blue-400'
    },
    {
      title: 'חלבון שבועי',
      current: weekProtein,
      target: weeklyProteinGoal,
      progress: proteinProgress,
      unit: 'גרם',
      icon: TrendingUp,
      color: 'text-green-400'
    }
  ];

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (progress) => {
    if (progress >= 100) return { text: 'הושלם!', color: 'bg-green-500' };
    if (progress >= 90) return { text: 'כמעט שם', color: 'bg-yellow-500' };
    if (progress >= 50) return { text: 'בדרך', color: 'bg-blue-500' };
    return { text: 'התחלה', color: 'bg-gray-500' };
  };

  return (
    <div className="grid gap-6">
      {/* Weekly Goals */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            יעדים שבועיים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {goals.map((goal, index) => {
            const Icon = goal.icon;
            const status = getStatusBadge(goal.progress);
            
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${goal.color}`} />
                    <span className="font-medium">{goal.title}</span>
                  </div>
                  <Badge className={`${status.color} text-white`}>
                    {status.text}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{goal.current.toFixed(0)} {goal.unit}</span>
                    <span>{goal.target} {goal.unit}</span>
                  </div>
                  <Progress 
                    value={goal.progress} 
                    className="h-3"
                  />
                  <p className="text-sm text-gray-400">
                    {goal.progress.toFixed(0)}% מהיעד השבועי
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Body Metrics Progress */}
      {metrics.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              התקדמות מדדי גוף
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {latestWeight} ק"ג
                </div>
                <p className="text-sm text-gray-400">משקל נוכחי</p>
              </div>
              
              {weightChange !== 0 && (
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    weightChange > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} ק"ג
                  </div>
                  <p className="text-sm text-gray-400">שינוי מהמדידה הקודמת</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-purple-500/20 rounded-lg">
              <p className="text-sm text-center text-purple-200">
                יעד: <strong>{user.goal}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Summary */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-400/30">
        <CardContent className="p-6 text-center">
          <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">סיכום השבוע</h3>
          <p className="text-gray-300 mb-4">
            רשמת {logs.length} ארוחות השבוע - כל הכבוד על העקביות!
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {Math.round((caloriesProgress + proteinProgress) / 2)}%
              </div>
              <div className="text-sm text-gray-400">ממוצע השגת יעדים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(logs.length / 7 * 10) / 10}
              </div>
              <div className="text-sm text-gray-400">ארוחות ממוצע יומי</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}