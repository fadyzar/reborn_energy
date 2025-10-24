import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Trophy, Target, Zap } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format, subDays } from "date-fns";

export default function TraineeComparison({ trainees, logs, metrics }) {
  const [selectedTrainee1, setSelectedTrainee1] = useState('');
  const [selectedTrainee2, setSelectedTrainee2] = useState('');
  const [comparisonMode, setComparisonMode] = useState('performance');

  const calculateTraineeStats = (traineeId) => {
    if (!traineeId) return null;

    const trainee = trainees.find(t => t.id === traineeId);
    const traineeLogs = logs.filter(log => log.user_id === traineeId);
    const traineeMetrics = metrics.filter(metric => metric.user_id === traineeId);

    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const monthAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

    const weeklyLogs = traineeLogs.filter(log => log.date >= weekAgo);
    const monthlyLogs = traineeLogs.filter(log => log.date >= monthAgo);

    const weeklyCalories = weeklyLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const monthlyCalories = monthlyLogs.reduce((sum, log) => sum + (log.calories || 0), 0);

    const dailyGoal = trainee?.daily_calories_goal || 2000;
    const weeklyAdherence = (weeklyCalories / (dailyGoal * 7)) * 100;
    const monthlyAdherence = (monthlyCalories / (dailyGoal * 30)) * 100;

    // Consistency score (unique days with logs)
    const weeklyConsistency = (new Set(weeklyLogs.map(log => log.date)).size / 7) * 100;
    const monthlyConsistency = (new Set(monthlyLogs.map(log => log.date)).size / 30) * 100;

    // Weight progress
    const sortedMetrics = traineeMetrics.sort((a, b) => new Date(b.date) - new Date(a.date));
    const weightProgress = sortedMetrics.length >= 2 ? 
      Math.abs(sortedMetrics[0].weight - sortedMetrics[1].weight) * 10 : 50; // Scale for radar

    // Meal variety score
    const uniqueFoods = new Set(weeklyLogs.map(log => log.food_name)).size;
    const varietyScore = Math.min(100, (uniqueFoods / 10) * 100);

    return {
      name: trainee?.hebrew_name || trainee?.full_name || 'משתמש',
      adherence: Math.min(100, weeklyAdherence),
      consistency: weeklyConsistency,
      variety: varietyScore,
      progress: weightProgress,
      engagement: Math.min(100, (weeklyLogs.length / 14) * 100), // Based on log frequency
      monthlyAdherence,
      monthlyConsistency,
      totalLogs: traineeLogs.length,
      avgCalories: weeklyCalories / 7,
      goal: trainee?.goal || 'לא הוגדר'
    };
  };

  const trainee1Stats = calculateTraineeStats(selectedTrainee1);
  const trainee2Stats = calculateTraineeStats(selectedTrainee2);

  const getRadarData = () => {
    if (!trainee1Stats || !trainee2Stats) return [];

    return [
      {
        metric: 'עמידה ביעדים',
        trainee1: trainee1Stats.adherence,
        trainee2: trainee2Stats.adherence
      },
      {
        metric: 'עקביות',
        trainee1: trainee1Stats.consistency,
        trainee2: trainee2Stats.consistency
      },
      {
        metric: 'מגוון מזונות',
        trainee1: trainee1Stats.variety,
        trainee2: trainee2Stats.variety
      },
      {
        metric: 'התקדמות',
        trainee1: trainee1Stats.progress,
        trainee2: trainee2Stats.progress
      },
      {
        metric: 'מעורבות',
        trainee1: trainee1Stats.engagement,
        trainee2: trainee2Stats.engagement
      }
    ];
  };

  const getComparisonData = () => {
    if (!trainee1Stats || !trainee2Stats) return [];

    return [
      {
        name: 'קלוריות ממוצע יומי',
        trainee1: trainee1Stats.avgCalories,
        trainee2: trainee2Stats.avgCalories
      },
      {
        name: 'רישומים השבוע',
        trainee1: trainee1Stats.totalLogs,
        trainee2: trainee2Stats.totalLogs
      },
      {
        name: 'עמידה ביעדים (%)',
        trainee1: trainee1Stats.adherence,
        trainee2: trainee2Stats.adherence
      },
      {
        name: 'עקביות (%)',
        trainee1: trainee1Stats.consistency,
        trainee2: trainee2Stats.consistency
      }
    ];
  };

  const getWinner = (metric) => {
    if (!trainee1Stats || !trainee2Stats) return null;
    
    const diff = trainee1Stats[metric] - trainee2Stats[metric];
    if (Math.abs(diff) < 5) return 'tie';
    return diff > 0 ? 'trainee1' : 'trainee2';
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          השוואת מתאמנים מתקדמת
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={selectedTrainee1} onValueChange={setSelectedTrainee1}>
            <SelectTrigger>
              <SelectValue placeholder="בחר מתאמן ראשון" />
            </SelectTrigger>
            <SelectContent>
              {trainees.map((trainee) => (
                <SelectItem key={trainee.id} value={trainee.id}>
                  {trainee.hebrew_name || trainee.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTrainee2} onValueChange={setSelectedTrainee2}>
            <SelectTrigger>
              <SelectValue placeholder="בחר מתאמן שני" />
            </SelectTrigger>
            <SelectContent>
              {trainees.filter(t => t.id !== selectedTrainee1).map((trainee) => (
                <SelectItem key={trainee.id} value={trainee.id}>
                  {trainee.hebrew_name || trainee.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={comparisonMode} onValueChange={setComparisonMode}>
            <SelectTrigger>
              <SelectValue placeholder="סוג השוואה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">ביצועים כלליים</SelectItem>
              <SelectItem value="detailed">פירוט מספרי</SelectItem>
              <SelectItem value="trends">מגמות</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {trainee1Stats && trainee2Stats ? (
          <>
            {/* Comparison Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-500/20 rounded-xl">
                <h3 className="text-blue-300 font-bold text-lg">{trainee1Stats.name}</h3>
                <div className="mt-2 space-y-1">
                  <Badge className="bg-blue-600 text-white">
                    {trainee1Stats.goal}
                  </Badge>
                  <p className="text-blue-200 text-sm">
                    {trainee1Stats.totalLogs} רישומים כולל
                  </p>
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-500/20 rounded-xl">
                <h3 className="text-purple-300 font-bold text-lg">{trainee2Stats.name}</h3>
                <div className="mt-2 space-y-1">
                  <Badge className="bg-purple-600 text-white">
                    {trainee2Stats.goal}
                  </Badge>
                  <p className="text-purple-200 text-sm">
                    {trainee2Stats.totalLogs} רישומים כולל
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Radar Chart */}
            {comparisonMode === 'performance' && (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData()}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                    />
                    <Radar
                      name={trainee1Stats.name}
                      dataKey="trainee1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name={trainee2Stats.name}
                      dataKey="trainee2"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Detailed Comparison */}
            {comparisonMode === 'detailed' && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="trainee1" fill="#3b82f6" name={trainee1Stats.name} />
                    <Bar dataKey="trainee2" fill="#8b5cf6" name={trainee2Stats.name} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Winner Analysis */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'adherence', label: 'עמידה ביעדים', icon: Target },
                { key: 'consistency', label: 'עקביות', icon: Trophy },
                { key: 'variety', label: 'מגוון', icon: Zap },
                { key: 'engagement', label: 'מעורבות', icon: TrendingUp }
              ].map(({ key, label, icon: Icon }) => {
                const winner = getWinner(key);
                const winnerColor = winner === 'trainee1' ? 'text-blue-400' : 
                                  winner === 'trainee2' ? 'text-purple-400' : 'text-yellow-400';
                const winnerText = winner === 'trainee1' ? trainee1Stats.name :
                                 winner === 'trainee2' ? trainee2Stats.name : 'תיקו';
                
                return (
                  <div key={key} className="text-center p-3 bg-white/5 rounded-lg">
                    <Icon className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className={`font-bold text-sm ${winnerColor}`}>
                      {winnerText}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              בחר שני מתאמנים להשוואה
            </h3>
            <p className="text-gray-400">
              קבל תובנות מפורטות על הביצועים היחסיים
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}