import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Droplets, Plus, Target, TrendingUp, Clock, Settings, Trash2 } from 'lucide-react';
import { WaterLog, WaterGoal } from '@/api/entities';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function WaterTracker({ userId }) {
  const [todayTotal, setTodayTotal] = useState(0);
  const [goal, setGoal] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickAmount, setQuickAmount] = useState(250);
  const [customAmount, setCustomAmount] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [newGoal, setNewGoal] = useState(2000);

  const quickAmounts = [150, 250, 350, 500];

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [total, goalData, todayLogs] = await Promise.all([
        WaterLog.getTodayTotal(userId),
        WaterGoal.getOrCreate(userId),
        WaterLog.filter({ user_id: userId, date: format(new Date(), 'yyyy-MM-dd') }, '-time', 50)
      ]);

      setTodayTotal(total);
      setGoal(goalData);
      setNewGoal(goalData.daily_goal_ml);
      setLogs(todayLogs);
    } catch (error) {
      console.error('Error loading water data:', error);
      toast.error('שגיאה בטעינת נתוני מים');
    } finally {
      setLoading(false);
    }
  };

  const addWater = async (amount) => {
    try {
      await WaterLog.create({
        user_id: userId,
        amount_ml: amount,
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm:ss')
      });

      await loadData();
      toast.success(`נוספו ${amount} מ"ל!`, {
        icon: '💧',
      });
    } catch (error) {
      console.error('Error adding water:', error);
      toast.error('שגיאה בהוספת מים');
    }
  };

  const deleteLog = async (logId) => {
    try {
      await WaterLog.delete(logId);
      await loadData();
      toast.success('הרשומה נמחקה');
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('שגיאה במחיקת רשומה');
    }
  };

  const updateGoal = async () => {
    try {
      await WaterGoal.update(goal.id, { daily_goal_ml: newGoal });
      await loadData();
      setShowSettings(false);
      toast.success('היעד עודכן בהצלחה!');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('שגיאה בעדכון יעד');
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  const percentage = goal ? (todayTotal / goal.daily_goal_ml) * 100 : 0;
  const remaining = goal ? Math.max(0, goal.daily_goal_ml - todayTotal) : 0;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              מעקב צריכת מים
            </CardTitle>
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-blue-100 dark:hover:bg-blue-900/50">
                  <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>הגדרות יעד יומי</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>יעד יומי (מ"ל)</Label>
                    <Input
                      type="number"
                      value={newGoal}
                      onChange={(e) => setNewGoal(parseInt(e.target.value))}
                      min={500}
                      max={10000}
                      step={100}
                    />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="font-medium mb-1">💡 טיפ:</p>
                    <p>המלצה כללית היא 8-10 כוסות ליום (2000-2500 מ"ל), אך זה משתנה לפי משקל, גיל ורמת פעילות.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSettings(false)}>
                    ביטול
                  </Button>
                  <Button onClick={updateGoal} className="bg-blue-600 hover:bg-blue-700">
                    שמור
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <div className="text-5xl font-black text-blue-600 dark:text-blue-400">
              {todayTotal} <span className="text-2xl">מ"ל</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              מתוך {goal?.daily_goal_ml || 2000} מ"ל יומי
            </div>
            <Progress value={percentage} className="h-4" />
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                <Target className="w-4 h-4" />
                {percentage.toFixed(0)}% מהיעד
              </div>
              {remaining > 0 && (
                <div className="text-gray-600 dark:text-gray-400">
                  נותרו {remaining} מ"ל
                </div>
              )}
              {percentage >= 100 && (
                <div className="text-green-600 dark:text-green-400 font-bold">
                  🎉 יעד הושג!
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Plus className="w-4 h-4" />
              הוסף צריכה מהירה
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  onClick={() => addWater(amount)}
                  variant="outline"
                  className="bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 transition-all duration-300 hover:scale-105 font-bold"
                >
                  <div className="text-center">
                    <div className="text-lg">{amount}</div>
                    <div className="text-xs text-gray-500">מ"ל</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="כמות במ&quot;ל"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => {
                if (customAmount && parseInt(customAmount) > 0) {
                  addWater(parseInt(customAmount));
                  setCustomAmount('');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 ml-1" />
              הוסף
            </Button>
          </div>

          {logs.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Clock className="w-4 h-4" />
                היסטוריית היום ({logs.length} רשומות)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-semibold">{log.amount_ml} מ"ל</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(`2000-01-01T${log.time}`), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLog(log.id)}
                      className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {percentage >= 100 && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">מעולה! 🎉</h3>
                <p className="text-green-100">הגעת ליעד היומי שלך! כל הכבוד על ההתמדה!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
