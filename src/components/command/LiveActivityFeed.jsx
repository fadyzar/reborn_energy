import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Utensils } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

export default function LiveActivityFeed({ logs, trainees }) {
  const getTraineeName = (userId) => {
    const trainee = trainees.find(t => t.id === userId);
    return trainee?.hebrew_name || trainee?.full_name || 'מתאמן';
  };

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'ארוחת בוקר': return 'bg-yellow-100 text-yellow-800';
      case 'ארוחת צהריים': return 'bg-orange-100 text-orange-800';
      case 'ארוחת ערב': return 'bg-purple-100 text-purple-800';
      case 'חטיף': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const recentLogs = logs
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 15);

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-600" />
          פיד פעילות חי
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-ping"></div>
            חי
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-2">
          {recentLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>אין פעילות אחרונה</p>
            </div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Utensils className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 truncate">
                    <span className="font-semibold">{getTraineeName(log.user_id)}</span> אכל/ה {log.food_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                     <Badge className={`${getMealTypeColor(log.meal_type)} font-medium`}>{log.meal_type}</Badge>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(log.created_date), { addSuffix: true, locale: he })}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-slate-700">
                    {log.calories || 0}
                  </div>
                  <div className="text-xs text-slate-500">קלוריות</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}