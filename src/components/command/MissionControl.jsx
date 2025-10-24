import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Rocket, Target, CheckCircle, Clock } from "lucide-react";

export default function MissionControl({ trainees, logs, realTimeData }) {
  const missions = [
    { id: 1, title: 'משימה יומית - רישום ארוחות', progress: ((realTimeData.activeToday || 0) / Math.max(trainees.length, 1)) * 100, target: trainees.length, current: realTimeData.activeToday || 0, status: 'active', priority: 'high', deadline: 'עד סוף היום' },
    { id: 2, title: 'משימה שבועית - יעדי חלבון', progress: 68, status: 'active', priority: 'medium', deadline: 'עד יום ראשון' },
    { id: 3, title: 'משימה חודשית - מדידות גוף', progress: 45, status: 'active', priority: 'low', deadline: 'עד סוף החודש' },
    { id: 4, title: 'משימה מושלמת - רישום רציף', progress: 100, status: 'completed', priority: 'high', deadline: 'הושלמה' }
  ];

  const getStatusClasses = (status) => {
    switch (status) {
      case 'completed': return { border: 'border-green-200', bg: 'bg-green-50', icon: 'text-green-600' };
      case 'active': return { border: 'border-blue-200', bg: 'bg-blue-50', icon: 'text-blue-600' };
      default: return { border: 'border-slate-200', bg: 'bg-slate-50', icon: 'text-slate-600' };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-100 text-red-800">גבוהה</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">בינונית</Badge>;
      case 'low': return <Badge className="bg-green-100 text-green-800">נמוכה</Badge>;
      default: return <Badge variant="secondary">רגילה</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-md">
        <CardHeader><CardTitle className="text-slate-800 flex items-center gap-2"><Rocket className="w-6 h-6 text-blue-600" />מרכז בקרת משימות</CardTitle></CardHeader>
        <CardContent>
          <p className="text-slate-600">ניהול יעדים ומשימות קבוצתיות לכל המתאמנים.</p>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {missions.map((mission) => {
          const classes = getStatusClasses(mission.status);
          const Icon = mission.status === 'completed' ? CheckCircle : Clock;
          
          return (
            <Card key={mission.id} className={`${classes.bg} border ${classes.border} shadow-sm`}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${classes.icon}`} />
                    <h3 className="font-semibold text-slate-800">{mission.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(mission.priority)}
                    <Badge variant="outline">{mission.deadline}</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>התקדמות</span>
                    <span>{mission.progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={mission.progress} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}