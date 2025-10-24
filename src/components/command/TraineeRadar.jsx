import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Radar, Target, AlertTriangle, Trophy, User, TrendingUp } from "lucide-react";

export default function TraineeRadar({ trainees }) {
  const getRiskClasses = (risk) => {
    switch (risk) {
      case 'high': return {
        badge: 'bg-red-100 text-red-800 border-red-200',
        iconContainer: 'bg-red-100',
        icon: 'text-red-600',
        border: 'border-red-200 hover:border-red-300 hover:bg-red-50'
      };
      case 'medium': return {
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        iconContainer: 'bg-yellow-100',
        icon: 'text-yellow-600',
        border: 'border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50'
      };
      default: return {
        badge: 'bg-green-100 text-green-800 border-green-200',
        iconContainer: 'bg-green-100',
        icon: 'text-green-600',
        border: 'border-green-200 hover:border-green-300 hover:bg-green-50'
      };
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'high': return AlertTriangle;
      case 'medium': return Target;
      default: return Trophy;
    }
  };

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <Radar className="w-6 h-6 text-blue-600" />
          מכ"ם מתאמנים - מעקב בזמן אמת
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trainees.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Radar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>אין מתאמנים במעקב</p>
            </div>
          ) : (
            trainees.slice(0, 10).map((trainee) => {
              const RiskIcon = getRiskIcon(trainee.risk);
              const classes = getRiskClasses(trainee.risk);
              
              return (
                <div key={trainee.id} className={`flex items-center gap-4 p-3 border rounded-xl transition-all ${classes.border}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${classes.iconContainer}`}>
                            <RiskIcon className={`w-5 h-5 ${classes.icon}`} />
                        </div>
                        <h4 className="text-slate-800 font-semibold truncate">
                          {trainee.hebrew_name || trainee.full_name}
                        </h4>
                      </div>
                      <Badge className={classes.badge}>
                        {trainee.risk === 'high' ? 'סיכון גבוה' : trainee.risk === 'medium' ? 'סיכון בינוני' : 'ביצועים טובים'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-500 mb-2">
                       <div>עמידה</div>
                       <div>עקביות</div>
                       <div>מעורבות</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Progress value={trainee.adherence || 0} />
                      <Progress value={trainee.consistency || 0} />
                      <Progress value={trainee.engagement || 0} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}