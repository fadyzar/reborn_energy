import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, TrendingUp, Users, Clock, Target } from "lucide-react";

export default function AutomatedInsights({ trainees, logs, metrics }) {
  const insights = [
    { id: 1, type: 'pattern', title: 'דפוס זמני מעניין', content: 'רוב המתאמנים שלך פעילים בין 18:00-20:00. שקול להעביר תוכן חדש בזמן הזה.', icon: Clock, classes: 'bg-blue-50 border-blue-200 text-blue-800' },
    { id: 2, type: 'performance', title: 'ביצועים מעולים', content: `${trainees.filter(t => t.overallScore > 80).length} מתאמנים מציגים ביצועים מעל הממוצע השבוע.`, icon: TrendingUp, classes: 'bg-green-50 border-green-200 text-green-800' },
    { id: 3, type: 'recommendation', title: 'המלצה חכמה', content: 'מתאמנים שמעלים תמונות של ארוחות מראים עמידה טובה יותר ב-34%.', icon: Lightbulb, classes: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
    { id: 4, type: 'alert', title: 'התראה חכמה', content: '3 מתאמנים לא רשמו ארוחות מזה יומיים. שקול ליצור איתם קשר.', icon: Target, classes: 'bg-red-50 border-red-200 text-red-800' },
  ];

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          תובנות AI אוטומטיות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight) => {
            const IconComponent = insight.icon;
            return (
              <div key={insight.id} className={`p-4 rounded-lg border ${insight.classes}`}>
                <div className="flex items-start gap-3">
                  <IconComponent className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <p className="text-sm mt-1">{insight.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}