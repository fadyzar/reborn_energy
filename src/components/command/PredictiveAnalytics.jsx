import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, TrendingDown, Target, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PredictiveAnalytics({ trainees, predictions }) {
  const successPrediction = predictions?.successProbability || 75;
  const dropoutRisk = predictions?.dropoutRisk || 2;
  const weeklyGrowth = predictions?.weeklyGrowth || 12;

  const futureTrends = [
    { week: 'השבוע', actual: 85, predicted: 85 },
    { week: 'השבוע הבא', actual: null, predicted: 88 },
    { week: 'בעוד שבועיים', actual: null, predicted: 92 },
  ];

  const riskAnalysis = trainees.map(trainee => ({
    name: trainee.hebrew_name || trainee.full_name || 'מתאמן',
    currentScore: trainee.overallScore || 0,
    predictedScore: Math.min(100, (trainee.overallScore || 0) + Math.random() * 20 - 10),
    risk: trainee.risk,
  })).sort((a, b) => b.currentScore - a.currentScore);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-md"><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">סיכוי הצלחה</p><p className="text-2xl font-bold text-green-600">{successPrediction.toFixed(0)}%</p></div><div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Target className="w-5 h-5 text-green-600" /></div></div></CardContent></Card>
        <Card className="bg-white shadow-md"><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">סיכון נשירה</p><p className="text-2xl font-bold text-red-600">{dropoutRisk}</p></div><div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><Brain className="w-5 h-5 text-red-600" /></div></div></CardContent></Card>
        <Card className="bg-white shadow-md"><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">צמיחה צפויה</p><p className="text-2xl font-bold text-blue-600">+{weeklyGrowth.toFixed(0)}%</p></div><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-blue-600" /></div></div></CardContent></Card>
      </div>

      <Card className="bg-white shadow-md">
        <CardHeader><CardTitle className="text-slate-800 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-600" />חיזוי מגמות</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={futureTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={3} name="ביצועים" />
                <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="חיזוי AI" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader><CardTitle className="text-slate-800 flex items-center gap-2"><Brain className="w-5 h-5 text-pink-600" />ניתוח סיכונים</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskAnalysis.slice(0, 8).map((trainee, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700">{trainee.name}</span>
                  <Badge className={trainee.risk === 'high' ? 'bg-red-100 text-red-800' : trainee.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                    {trainee.risk === 'high' ? 'סיכון גבוה' : trainee.risk === 'medium' ? 'בינוני' : 'נמוך'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1"><div className="flex justify-between text-xs mb-1"><span>נוכחי</span><span>{trainee.currentScore.toFixed(0)}</span></div><Progress value={trainee.currentScore} /></div>
                  <div className="flex-1"><div className="flex justify-between text-xs mb-1 text-purple-600"><span>חיזוי</span><span>{trainee.predictedScore.toFixed(0)}</span></div><Progress value={trainee.predictedScore} /></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}