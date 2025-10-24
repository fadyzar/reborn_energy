import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  Edit, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";

export default function GoalTracking({ trainees, logs, metrics, onGoalUpdate }) {
  const [goals, setGoals] = useState({});
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState('');
  const [newGoal, setNewGoal] = useState({
    type: '',
    target: '',
    deadline: '',
    description: ''
  });

  useEffect(() => {
    generateTraineeGoals();
  }, [trainees, logs, metrics]);

  const generateTraineeGoals = () => {
    const generatedGoals = {};

    trainees.forEach(trainee => {
      const traineeId = trainee.id;
      const traineeMetrics = metrics.filter(m => m.user_id === traineeId);
      const traineeLogs = logs.filter(l => l.user_id === traineeId);

      const traineeGoals = [];

      // Weight goal based on trainee's main goal
      if (trainee.goal && traineeMetrics.length > 0) {
        const currentWeight = traineeMetrics[0]?.weight;
        let targetWeight;
        let goalType;

        if (trainee.goal === 'ירידה במשקל') {
          targetWeight = currentWeight - 5; // Target 5kg loss
          goalType = 'weight_loss';
        } else if (trainee.goal === 'עלייה במשקל') {
          targetWeight = currentWeight + 3; // Target 3kg gain
          goalType = 'weight_gain';
        } else {
          targetWeight = currentWeight; // Maintain weight
          goalType = 'weight_maintain';
        }

        traineeGoals.push({
          id: `${traineeId}_weight`,
          type: 'weight',
          title: trainee.goal,
          current: currentWeight,
          target: targetWeight,
          unit: 'ק"ג',
          deadline: format(addDays(new Date(), 90), 'yyyy-MM-dd'), // 3 months
          progress: goalType === 'weight_maintain' ? 85 : 
                   Math.max(0, Math.min(100, ((currentWeight - targetWeight) / Math.abs(currentWeight - targetWeight)) * 100)),
          status: 'active'
        });
      }

      // Consistency goal
      const last30Days = logs.filter(log => 
        log.user_id === traineeId && 
        differenceInDays(new Date(), new Date(log.date)) <= 30
      );
      const uniqueDays = new Set(last30Days.map(log => log.date)).size;
      const consistencyRate = (uniqueDays / 30) * 100;

      traineeGoals.push({
        id: `${traineeId}_consistency`,
        type: 'consistency',
        title: 'עקביות ברישום',
        current: consistencyRate,
        target: 85,
        unit: '%',
        deadline: format(addDays(new Date(), 30), 'yyyy-MM-dd'), // 1 month
        progress: consistencyRate,
        status: consistencyRate >= 85 ? 'completed' : 'active'
      });

      // Calorie adherence goal
      const weeklyLogs = traineeLogs.filter(log => 
        differenceInDays(new Date(), new Date(log.date)) <= 7
      );
      const weeklyCalories = weeklyLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const targetWeeklyCalories = (trainee.daily_calories_goal || 2000) * 7;
      const adherenceRate = targetWeeklyCalories > 0 ? (weeklyCalories / targetWeeklyCalories) * 100 : 0;

      traineeGoals.push({
        id: `${traineeId}_calories`,
        type: 'calories',
        title: 'עמידה ביעד קלוריות',
        current: adherenceRate,
        target: 90,
        unit: '%',
        deadline: format(addDays(new Date(), 7), 'yyyy-MM-dd'), // Weekly goal
        progress: adherenceRate,
        status: adherenceRate >= 90 ? 'completed' : adherenceRate >= 70 ? 'active' : 'at_risk'
      });

      generatedGoals[traineeId] = traineeGoals;
    });

    setGoals(generatedGoals);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'active': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'at_risk': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'active': return <Clock className="w-4 h-4" />;
      case 'at_risk': return <AlertCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'הושג';
      case 'active': return 'פעיל';
      case 'at_risk': return 'בסיכון';
      case 'paused': return 'מושהה';
      default: return 'לא פעיל';
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            מעקב יעדים חכם
          </CardTitle>
          <Button
            onClick={() => setShowAddGoal(!showAddGoal)}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            יעד חדש
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Add New Goal Form */}
        {showAddGoal && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedTrainee} onValueChange={setSelectedTrainee}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מתאמן" />
                </SelectTrigger>
                <SelectContent>
                  {trainees.map((trainee) => (
                    <SelectItem key={trainee.id} value={trainee.id}>
                      {trainee.hebrew_name || trainee.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={newGoal.type} onValueChange={(value) => setNewGoal({...newGoal, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="סוג יעד" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">משקל</SelectItem>
                  <SelectItem value="calories">קלוריות</SelectItem>
                  <SelectItem value="consistency">עקביות</SelectItem>
                  <SelectItem value="custom">מותאם אישית</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="יעד מספרי"
                value={newGoal.target}
                onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
              />

              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setShowAddGoal(false)}>
                ביטול
              </Button>
              <Button size="sm" className="bg-green-600">
                הוסף יעד
              </Button>
            </div>
          </div>
        )}

        {/* Goals Overview */}
        <div className="space-y-6">
          {Object.keys(goals).length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">מחשב יעדים אוטומטיים...</p>
            </div>
          ) : (
            Object.entries(goals).map(([traineeId, traineeGoals]) => {
              const trainee = trainees.find(t => t.id === traineeId);
              return (
                <div key={traineeId} className="space-y-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    {trainee?.hebrew_name || trainee?.full_name}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {traineeGoals.map((goal) => (
                      <div key={goal.id} className={`p-4 rounded-xl border ${getStatusColor(goal.status)}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(goal.status)}
                            <h4 className="font-medium text-sm">{goal.title}</h4>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {getStatusText(goal.status)}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>נוכחי: {goal.current.toFixed(1)}{goal.unit}</span>
                            <span>יעד: {goal.target}{goal.unit}</span>
                          </div>
                          
                          <Progress 
                            value={Math.min(100, Math.max(0, goal.progress))} 
                            className="h-2" 
                          />

                          <div className="flex items-center justify-between text-xs opacity-70">
                            <span>עד: {format(new Date(goal.deadline), 'dd/MM')}</span>
                            <span>{Math.round(goal.progress)}%</span>
                          </div>
                        </div>

                        {goal.status === 'completed' && (
                          <div className="mt-2 text-center">
                            <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                            <p className="text-xs text-green-400 mt-1">יעד הושג!</p>
                          </div>
                        )}
                      </div>
                    ))}
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