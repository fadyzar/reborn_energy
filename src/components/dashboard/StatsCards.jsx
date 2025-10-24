import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function StatsCards({ title, value, icon: Icon, bgColor, progress }) {
  return (
    <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className={`absolute top-0 left-0 w-32 h-32 transform -translate-x-8 -translate-y-8 ${bgColor} rounded-full opacity-10`} />
      <CardHeader className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-2 sm:mb-4">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{title}</p>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {value}
            </CardTitle>
          </div>
          <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${bgColor} bg-opacity-20`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${bgColor.replace('bg-', 'text-')}`} />
          </div>
        </div>
        {progress !== undefined && (
          <div className="space-y-1 sm:space-y-2">
            <Progress value={Math.min(progress, 100)} className="h-1.5 sm:h-2" />
            <p className="text-xs text-gray-500">
              {progress.toFixed(0)}% מהיעד
            </p>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}