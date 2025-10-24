
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function PerformanceHeatmap({ trainees, logs }) {
  const calculateTraineePerformance = (trainee) => {
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const traineeLogs = logs.filter(log => 
      log.user_id === trainee.id && log.date >= weekAgo
    );
    
    const weeklyCalories = traineeLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const expectedCalories = (trainee.daily_calories_goal || 2000) * 7;
    const adherence = expectedCalories > 0 ? (weeklyCalories / expectedCalories) * 100 : 0;
    const consistency = (new Set(traineeLogs.map(log => log.date)).size / 7) * 100;
    
    return {
      ...trainee,
      adherence: Math.min(adherence, 100),
      consistency,
      weeklyLogs: traineeLogs.length,
      score: (adherence * 0.7 + consistency * 0.3)
    };
  };

  const performanceData = trainees
    .map(calculateTraineePerformance)
    .sort((a, b) => b.score - a.score);

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'from-green-400 to-green-600';
    if (score >= 80) return 'from-blue-400 to-blue-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    if (score >= 40) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getPerformanceIcon = (score) => {
    if (score >= 90) return <Flame className="w-4 h-4 text-yellow-400" />;
    if (score >= 80) return <Target className="w-4 h-4 text-blue-400" />;
    return <TrendingUp className="w-4 h-4 text-gray-400" />;
  };

  const getPerformanceLabel = (score) => {
    if (score >= 90) return 'מצטיין';
    if (score >= 80) return 'מעולה';
    if (score >= 60) return 'טוב';
    if (score >= 40) return 'בינוני';
    return 'צריך שיפור'; // Changed from 'זקוק לשיפור'
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white text-lg md:text-xl flex items-center gap-2">
          <Flame className="w-5 h-5" />
          מפת ביצועים חיה
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {performanceData.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">אין נתוני ביצועים</p>
            </div>
          ) : (
            performanceData.slice(0, 8).map((trainee, index) => (
              <div 
                key={trainee.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-gray-400 font-bold text-sm w-6 flex-shrink-0">
                    #{index + 1}
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">
                      {(trainee.hebrew_name || trainee.full_name || 'U')[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium group-hover:text-purple-200 transition-colors truncate text-sm sm:text-base">
                      {trainee.hebrew_name || trainee.full_name}
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {trainee.weeklyLogs} רישומים השבוע
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 justify-end">
                      {getPerformanceIcon(trainee.score)}
                      <span className="text-white font-bold text-sm sm:text-base">
                        {trainee.score.toFixed(0)}
                      </span>
                    </div>
                    <Badge className={`bg-gradient-to-r ${getPerformanceColor(trainee.score)} text-white border-0 text-xs px-2 py-1`}>
                      {getPerformanceLabel(trainee.score)}
                    </Badge>
                  </div>
                  
                  <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-700"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-purple-400"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${trainee.score}, 100`}
                        strokeLinecap="round"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {trainee.score.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {performanceData.length > 8 && (
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              ועוד {performanceData.length - 8} מתאמנים...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
