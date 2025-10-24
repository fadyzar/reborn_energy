import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, User, MessageSquare } from "lucide-react";

export default function RealTimeAlerts({ trainees, predictions }) {
  const highRiskTrainees = trainees.filter(t => t.risk === 'high');
  const mediumRiskTrainees = trainees.filter(t => t.risk === 'medium');

  const alerts = [
    ...highRiskTrainees.map(trainee => ({
      id: trainee.id,
      title: `${trainee.hebrew_name || trainee.full_name}`,
      message: `עמידה נמוכה ביעדים, דורש התערבות`,
      priority: 'high',
    })),
    ...mediumRiskTrainees.slice(0, 2).map(trainee => ({
      id: trainee.id + '_medium',
      title: `${trainee.hebrew_name || trainee.full_name}`,
      message: `ביצועים מתחת לממוצע השבוע`,
      priority: 'medium',
    }))
  ];

  const getPriorityClasses = (priority) => {
    switch (priority) {
      case 'high': return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600' };
      case 'medium': return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' };
      default: return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' };
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return AlertTriangle;
      case 'medium': return TrendingDown;
      default: return User;
    }
  };

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          התראות חכמות
          {alerts.length > 0 && (
            <Badge className="bg-red-100 text-red-800">{alerts.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>אין התראות פעילות. הכל תחת שליטה! 🎉</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const PriorityIcon = getPriorityIcon(alert.priority);
              const classes = getPriorityClasses(alert.priority);
              
              return (
                <div key={alert.id} className={`p-3 rounded-lg border ${classes.bg} ${classes.border}`}>
                  <div className="flex items-center gap-3">
                    <PriorityIcon className={`w-5 h-5 flex-shrink-0 ${classes.icon}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 truncate">{alert.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-slate-500 hover:bg-slate-200">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
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