import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Utensils, Coffee, Sun, Moon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

const mealIcons = {
  "ארוחת בוקר": Coffee,
  "ארוחת צהריים": Sun,
  "ארוחת ערב": Moon,
  "חטיף": Utensils
};

const MacroProgressBar = ({ name, current, goal, color, unit, index }) => {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const status = percentage < 80 ? 'low' : percentage > 110 ? 'high' : 'good';

  const StatusIcon = percentage < 80 ? TrendingDown : percentage > 110 ? TrendingUp : Minus;
  const statusColor = status === 'low' ? 'text-orange-600' : status === 'high' ? 'text-red-600' : 'text-green-600';
  const statusBg = status === 'low' ? 'bg-orange-50' : status === 'high' ? 'bg-red-50' : 'bg-green-50';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="space-y-3"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <span className="font-bold text-gray-900 dark:text-white text-base">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {current.toFixed(0)}/{goal} {unit}
          </span>
          <div className={`p-1.5 rounded-lg ${statusBg}`}>
            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
          </div>
        </div>
      </div>
      <div className="relative">
        <Progress
          value={percentage}
          className="h-3 bg-gray-200 dark:bg-slate-700"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 h-3 rounded-full"
          style={{ backgroundColor: color.replace('bg-', '') }}
        />
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className={`font-semibold ${statusColor}`}>
          {percentage.toFixed(0)}% מהיעד
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          נותרו {Math.max(0, goal - current).toFixed(0)} {unit}
        </span>
      </div>
    </motion.div>
  );
};

export default function TodayProgress({ todayTotals, goals, logs }) {
  const macroData = [
    {
      name: "קלוריות",
      current: todayTotals.calories,
      goal: goals.calories,
      color: "bg-orange-500",
      unit: ""
    },
    {
      name: "חלבון",
      current: todayTotals.protein,
      goal: goals.protein,
      color: "bg-green-500",
      unit: "גרם"
    },
    {
      name: "פחמימות",
      current: todayTotals.carbs,
      goal: goals.carbs,
      color: "bg-yellow-500",
      unit: "גרם"
    },
    {
      name: "שומן",
      current: todayTotals.fat,
      goal: goals.fat,
      color: "bg-red-500",
      unit: "גרם"
    }
  ];

  const mealGroups = logs.reduce((acc, log) => {
    if (!acc[log.meal_type]) {
      acc[log.meal_type] = [];
    }
    acc[log.meal_type].push(log);
    return acc;
  }, {});

  const overallProgress = macroData.reduce((acc, macro) => {
    const percentage = macro.goal > 0 ? Math.min((macro.current / macro.goal) * 100, 100) : 0;
    return acc + percentage;
  }, 0) / macroData.length;

  return (
    <Card className="bg-gradient-to-br from-white/95 to-blue-50/50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-xl border-0 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <CardHeader className="relative z-10 border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              התקדמות היום
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              מעקב אחר יעדי התזונה היומיים
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {overallProgress.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
              ממוצע
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 p-6 space-y-8">
        <div className="grid grid-cols-1 gap-6">
          {macroData.map((macro, index) => (
            <MacroProgressBar key={macro.name} {...macro} index={index} />
          ))}
        </div>

        <div className="pt-6 border-t border-gray-200/50 dark:border-slate-700/50">
          <h3 className="font-black text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-blue-600" />
            ארוחות היום
          </h3>
          {Object.entries(mealGroups).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(mealGroups).map(([mealType, mealLogs], index) => {
                const Icon = mealIcons[mealType] || Utensils;
                const totalCalories = mealLogs.reduce((sum, log) => sum + (log.calories || 0), 0);

                return (
                  <motion.div
                    key={mealType}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-gray-200/50 dark:border-slate-600/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{mealType}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {mealLogs.length} פריטים
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 px-4 py-2 text-sm font-bold shadow-lg">
                      {totalCalories} קלוריות
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600"
            >
              <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">
                לא נרשמו ארוחות היום
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                התחל לרשום את הארוחות שלך כדי לעקוב אחר ההתקדמות
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
