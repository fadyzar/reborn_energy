
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { NutritionLog } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Target, TrendingUp, Plus, Utensils, Lock, Zap } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { createCoachNotification } from '@/components/lib/notifications'; // ייבוא הפונקציה

import NutritionForm from "../components/tracking/NutritionForm";
import MealsList from "../components/tracking/MealsList";
import DaySelector from "../components/tracking/DaySelector";
import AiMealSuggester from "../components/tracking/AiMealSuggester";
import useTrialStatus from "../components/trial/useTrialStatus";
import TrialTimer from "../components/trial/TrialTimer";

export default function DailyTracking() {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayLogs, setDayLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const trialStatus = useTrialStatus(user);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      let currentUser = await User.me();
      
      // Initialize trial period for new users
      if (currentUser && !currentUser.trial_started_date && currentUser.subscription_plan !== 'pro') {
        await User.updateMyUserData({ 
          trial_started_date: new Date().toISOString()
        });
        currentUser = await User.me(); // Re-fetch to get the updated user object
      }
      
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
    }
    setLoading(false);
  };

  const loadDayLogs = useCallback(async () => {
    if (!user) return;
    
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const logs = await NutritionLog.filter({
        user_id: user.id,
        date: dateString
      }, '-created_date');
      setDayLogs(logs);
    } catch (error) {
      console.error("Error loading day logs:", error);
      setDayLogs([]);
    }
  }, [user, selectedDate]);

  useEffect(() => {
    if (user) {
      loadDayLogs();
    }
  }, [user, loadDayLogs]);

  const handleLogSubmit = useCallback(async (logData) => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const dataToSave = {
        ...logData,
        user_id: user.id,
        date: dateString
      };

      let savedLog;
      if (editingLog) {
        savedLog = await NutritionLog.update(editingLog.id, dataToSave);
      } else {
        savedLog = await NutritionLog.create(dataToSave);
        // שליחת התראה למאמן רק על יצירת ארוחה חדשה
        await createCoachNotification(
          user,
          "רישום ארוחה חדשה",
          `${user.hebrew_name || user.full_name} רשם ארוחה: ${savedLog.food_name}`,
          "new_log"
        );
      }

      setShowForm(false);
      setEditingLog(null);
      loadDayLogs();
    } catch (error) {
      console.error("Error saving log:", error);
    }
  }, [selectedDate, user, editingLog, loadDayLogs]);

  const handleLogEdit = (log) => {
    setEditingLog(log);
    setShowForm(true);
  };

  const handleLogDelete = useCallback(async (logId) => {
    try {
      await NutritionLog.delete(logId);
      loadDayLogs();
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  }, [loadDayLogs]);

  const dayTotals = dayLogs.reduce((acc, log) => ({
    calories: acc.calories + (log.calories || 0),
    protein: acc.protein + (log.protein || 0),
    carbs: acc.carbs + (log.carbs || 0),
    fat: acc.fat + (log.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const remainingMacros = user ? {
    calories: Math.max(0, (user.daily_calories_goal || 2000) - dayTotals.calories),
    protein: Math.max(0, (user.daily_protein_goal || 150) - dayTotals.protein),
    carbs: Math.max(0, (user.daily_carbs_goal || 250) - dayTotals.carbs),
    fat: Math.max(0, (user.daily_fat_goal || 65) - dayTotals.fat)
  } : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">יש להתחבר למערכת</h2>
        <Button onClick={() => User.login()}>התחבר</Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Trial Timer */}
        {user && <TrialTimer user={user} />}

        {/* Header - Mobile Optimized */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">מעקב תזונה יומי</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {format(selectedDate, "EEEE, dd MMMM yyyy", { locale: he })}
          </p>
        </div>

        {/* Daily Stats - Mobile Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg border-0 card-hover">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">קלוריות</p>
                  <p className="text-base sm:text-2xl font-bold text-blue-600">{dayTotals.calories}</p>
                </div>
                <Target className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500" />
              </div>
              <Progress 
                value={user.daily_calories_goal ? (dayTotals.calories / user.daily_calories_goal) * 100 : 0} 
                className="mt-2 h-1 sm:h-2" 
              />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">חלבון</p>
                  <p className="text-base sm:text-2xl font-bold text-green-600">{dayTotals.protein.toFixed(0)}ג</p>
                </div>
                <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8 text-green-500" />
              </div>
              <Progress 
                value={user.daily_protein_goal ? (dayTotals.protein / user.daily_protein_goal) * 100 : 0} 
                className="mt-2 h-1 sm:h-2" 
              />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">פחמימות</p>
                  <p className="text-base sm:text-2xl font-bold text-orange-600">{dayTotals.carbs.toFixed(0)}ג</p>
                </div>
                <Utensils className="w-5 h-5 sm:w-8 sm:h-8 text-orange-500" />
              </div>
              <Progress 
                value={user.daily_carbs_goal ? (dayTotals.carbs / user.daily_carbs_goal) * 100 : 0} 
                className="mt-2 h-1 sm:h-2" 
              />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">שומן</p>
                  <p className="text-base sm:text-2xl font-bold text-purple-600">{dayTotals.fat.toFixed(0)}ג</p>
                </div>
                <Calendar className="w-5 h-5 sm:w-8 sm:h-8 text-purple-500" />
              </div>
              <Progress 
                value={user.daily_fat_goal ? (dayTotals.fat / user.daily_fat_goal) * 100 : 0} 
                className="mt-2 h-1 sm:h-2" 
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar - Mobile Stacked */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <DaySelector 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            
            {/* AI Meal Suggester - Pro Feature */}
            {trialStatus.hasAccess ? (
              <AiMealSuggester remainingMacros={remainingMacros} />
            ) : (
              <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-purple-400 text-center">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 justify-center text-base sm:text-lg">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    שדרג ל-Pro
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="mb-4 text-xs sm:text-sm">קבל הצעות ארוחה חכמות מ-AI ועוד פיצ'רים מתקדמים!</p>
                  <Button 
                    onClick={() => navigate(createPageUrl('UpgradePlan'))}
                    className="bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-500 w-full text-sm"
                  >
                    שדרג עכשיו
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Add Meal Button - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">הארוחות שלי</h2>
              <Button
                onClick={() => {
                  setEditingLog(null);
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                הוסף ארוחה
              </Button>
            </div>

            {/* Nutrition Form */}
            {showForm && (
              <NutritionForm
                log={editingLog}
                onSubmit={handleLogSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingLog(null);
                }}
              />
            )}

            {/* Meals List */}
            <MealsList
              logs={dayLogs}
              onEdit={handleLogEdit}
              onDelete={handleLogDelete}
            />

            {dayLogs.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent className="py-8 sm:py-12 text-center">
                  <Utensils className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                    עדיין לא נרשמו ארוחות היום
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4">
                    התחל לרשום את הארוחות שלך כדי לעקוב אחר התקדמותך
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    רשום ארוחה ראשונה
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
