
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from "@/api/entities";
import { NutritionLog } from "@/api/entities";
import { BodyMetrics } from "@/api/entities";
import { BusinessSettings } from "@/api/entities"; // Import new entity
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Calendar, Scale, Zap, Activity, Users, Award, ChevronRight, BarChart3, UserPlus, AlertTriangle, Bell, Timer, Utensils, Star, Brush } from "lucide-react";
import { format, subDays } from "date-fns";
import { he } from "date-fns/locale";

import StatsCards from "../components/dashboard/StatsCards";
import TodayProgress from "../components/dashboard/TodayProgress";
import WeeklyChart from "../components/dashboard/WeeklyChart";
import QuickActions from "../components/dashboard/QuickActions";
import TrialTimer from "../components/trial/TrialTimer";
import { createPageUrl } from "@/utils";
// PlanRequestFlow component import is removed

// Define WelcomeAvatar and InviteQuickAction components within this file
// as per the requirement to return a full functioning single file.
// This means they won't be lazy-loaded or imported from external files.
const WelcomeAvatar = ({ onGetStarted, onNavigate, user }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={onGetStarted}
        className="rounded-full p-3 shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <span className="sr-only">Get Started</span>
        {user ? '🚀' : '👋'}
      </Button>
    </div>
  );
};

// Assuming useClipboard and useRef are available or mocked
// For this example, I'll mock useClipboard and useRef simply
const useClipboard = () => {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return { copied, copy };
};

const InviteQuickAction = ({ coachId }) => {
  const inviteLink = `${window.location.origin}/invite/${coachId}`; // Replace with actual invite link generation logic
  const { copied, copy } = useClipboard();

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        readOnly
        value={inviteLink}
        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
      />
      <Button
        onClick={() => copy(inviteLink)}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm transition-colors"
      >
        {copied ? 'הועתק!' : 'העתק קישור'}
      </Button>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null); // State for business settings
  const [todayStats, setTodayStats] = useState({ calories: 0, protein: 0, logs: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [latestMetrics, setLatestMetrics] = useState(null);
  const [traineesData, setTraineesData] = useState({ total: 0, active: 0, needsAttention: 0, topPerformers: [] });
  const [alerts, setAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState(0); // For trainee dashboard
  const [loading, setLoading] = useState(true);

  // The createPageUrl function is now imported from "@/utils", so it's removed from here.

  const loadTraineeData = useCallback(async (currentUser) => {
    // Fetch business settings based on coach_id
    if (currentUser.coach_id) {
        try {
            const settingsData = await BusinessSettings.filter({ coach_id: currentUser.coach_id });
            if (settingsData.length > 0) {
                setBusinessSettings(settingsData[0]);
            } else {
                setBusinessSettings(null); // No specific settings found
            }
        } catch (error) {
            console.error("Could not load business settings for trainee:", error);
            setBusinessSettings(null); // Ensure it's null on error
        }
    } else {
        setBusinessSettings(null); // No coach_id, no specific settings
    }
      
    const today = format(new Date(), 'yyyy-MM-dd');
    const logs = await NutritionLog.filter({
      user_id: currentUser.id,
      date: today
    });

    const totals = logs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    setTodayStats({
      calories: totals.calories,
      protein: totals.protein,
      logs: logs.length
    });

    const weeklyLogs = await NutritionLog.filter({
      user_id: currentUser.id
    }, '-date', 50); // Fetch more logs to ensure enough data for 7 days

    const groupedData = {};
    weeklyLogs.forEach(log => {
      const logDate = format(new Date(log.date), 'yyyy-MM-dd');
      if (!groupedData[logDate]) {
        groupedData[logDate] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      groupedData[logDate].calories += log.calories || 0;
      groupedData[logDate].protein += log.protein || 0;
      groupedData[logDate].carbs += log.carbs || 0;
      groupedData[logDate].fat += log.fat || 0;
    });

    // Generate last 7 days for the chart, including days with no logs
    const chartData = [];
    let currentDay = new Date();
    for (let i = 0; i < 7; i++) {
      const dateKey = format(currentDay, 'yyyy-MM-dd');
      chartData.unshift({ // Add to the beginning to get chronological order
        date: format(currentDay, 'dd/MM'),
        calories: groupedData[dateKey]?.calories || 0,
        protein: groupedData[dateKey]?.protein || 0,
        carbs: groupedData[dateKey]?.carbs || 0,
        fat: groupedData[dateKey]?.fat || 0,
      });
      currentDay = subDays(currentDay, 1);
    }
    setWeeklyData(chartData);

    // Calculate weekly progress (example: adherence to calorie goal)
    let totalAdherence = 0;
    let daysWithData = 0;
    chartData.forEach(day => {
      if (day.calories > 0 && currentUser.daily_calories_goal) {
        const adherence = (day.calories / currentUser.daily_calories_goal) * 100;
        totalAdherence += Math.min(adherence, 100); // Cap adherence at 100% for calculation
        daysWithData++;
      }
    });
    setWeeklyProgress(daysWithData > 0 ? (totalAdherence / daysWithData).toFixed(0) : 0);

    const metrics = await BodyMetrics.filter({
      user_id: currentUser.id
    }, '-date', 1);
    if (metrics.length > 0) {
      setLatestMetrics(metrics[0]);
    }
  }, []);

  const loadCoachData = useCallback(async (currentUser) => {
    // Fetch business settings for the coach themselves
    if (currentUser.id) { // Coach's own ID
        try {
            const settingsData = await BusinessSettings.filter({ coach_id: currentUser.id });
            if (settingsData.length > 0) {
                setBusinessSettings(settingsData[0]);
            } else {
                setBusinessSettings(null); // No specific settings found
            }
        } catch (error) {
            console.error("Could not load business settings for coach:", error);
            setBusinessSettings(null); // Ensure it's null on error
        }
    } else {
        setBusinessSettings(null); // No user ID, no settings
    }

    // Dummy data for coach dashboard
    setTraineesData({
      total: 15,
      active: 8,
      needsAttention: 3,
      topPerformers: [
        { name: 'דניאל כהן', adherence: 95 },
        { name: 'שרה לוי', adherence: 92 },
        { name: 'משה ישראלי', adherence: 88 },
      ],
    });
    setAlerts([
      { trainee: 'דניאל כהן', message: 'חריגה משמעותית ביעד קלורי', type: 'calorie_exceed' },
      { trainee: 'משה ישראלי', message: 'לא עדכן יומן תזונה יומיים', type: 'no_log' },
    ]);
    setRecentActivity([
      { id: 1, trainee_name: 'רבקה שלום', food_name: 'ארוחת צהריים', calories: 600, created_date: new Date().toISOString() },
      { id: 2, trainee_name: 'יוסי דויד', food_name: 'נשנוש ערב', calories: 250, created_date: subDays(new Date(), 0).toISOString() },
      { id: 3, trainee_name: 'שירה כהן', food_name: 'ארוחת בוקר', calories: 400, created_date: subDays(new Date(), 1).toISOString() },
    ]);
    // Coaches might also have their own personal data, but for this example, we'll keep weeklyData empty or load default
    setWeeklyData([]);
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Initialize trial period for new users if not already pro and not admin
      // This logic was in the outline but commented, so keeping it out unless explicitly asked.

      if (currentUser.is_coach || currentUser.role === 'admin') {
        await loadCoachData(currentUser);
      } else {
        await loadTraineeData(currentUser);
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // If User.me() fails, it means user is not logged in.
      setUser(null); // Explicitly clear user on error
    }
    setLoading(false);
  }, [loadCoachData, loadTraineeData]); // Depend on loadCoachData and loadTraineeData

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden transition-colors duration-300">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300/20 dark:bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <div className="mb-8 relative">
            <div className="w-32 h-32 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
              <Target className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <Zap className="w-4 h-4 text-yellow-800" />
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                ברוכים הבאים ל-
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                Reborn Energy
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              המערכת החכמה ביותר למעקב תזונה והשגת יעדים
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12 text-white/80">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                <span>מעקב חכם</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>ליווי מקצועי</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>תוצאות מוכחות</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => User.login()}
                className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white px-12 py-4 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-0"
              >
                <span className="flex items-center gap-3">
                  התחבר עם גוגל
                  <ChevronRight className="w-6 h-6" />
                </span>
              </Button>

              <Button
                onClick={() => {
                  setUser({
                    id: 'demo_coach_123',
                    full_name: 'מאמן דמו',
                    hebrew_name: 'מאמן דמו',
                    email: 'demo@coach.com',
                    is_coach: true,
                    role: 'coach',
                    daily_calories_goal: 2500,
                    daily_protein_goal: 180,
                  });
                  setLoading(false);
                }}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-12 py-4 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                <span className="flex items-center gap-3">
                  כניסה דמו - מאמן
                  <Users className="w-6 h-6" />
                </span>
              </Button>
            </div>

            <p className="text-sm text-blue-200 mt-6">
              אם ההתחברות עם גוגל לא עובדת, השתמש במצב הדמו לבדיקה
            </p>
          </div>
        </div>

        {/* Welcome Avatar for logged-out users */}
        <WelcomeAvatar
          onGetStarted={() => User.login()}
          onNavigate={(page) => navigate(createPageUrl(page))}
        />
      </div>
    );
  }

  const isCoach = user.is_coach || user.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden transition-colors duration-300">
      {businessSettings && businessSettings.primary_color && businessSettings.secondary_color && (
        <style>{`
          :root {
            --custom-primary: ${businessSettings.primary_color};
            --custom-secondary: ${businessSettings.secondary_color};
          }
        `}</style>
      )}

      <WelcomeAvatar
        user={user}
        onGetStarted={() => navigate(createPageUrl('Dashboard'))}
        onNavigate={(page) => navigate(createPageUrl(page))}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 dark:from-blue-500/10 via-blue-300/10 dark:via-blue-400/5 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-green-400/20 dark:from-green-500/10 via-green-300/10 dark:via-green-400/5 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/10 dark:from-blue-400/5 via-transparent to-green-200/10 dark:to-green-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Trial Timer */}
          {user && <TrialTimer user={user} />}

          <div className="text-center mb-8 sm:mb-12 relative">
            <div className="inline-block mb-6 relative">
              {businessSettings?.logo_url ? (
                <img src={businessSettings.logo_url} alt="Business Logo" className="h-20 sm:h-24 mx-auto drop-shadow-2xl" />
              ) : (
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-3xl shadow-2xl animate-float relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-400 rounded-3xl blur-xl opacity-50"></div>
                  <Target className="w-10 h-10 sm:w-12 sm:h-12 text-white relative z-10" />
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 px-2 leading-tight">
              <span className="bg-gradient-to-l from-blue-600 via-blue-700 to-green-600 bg-clip-text text-transparent block drop-shadow-sm">
                {`שלום, ${user.hebrew_name || user.full_name || 'משתמש'}!`}
              </span>
              {businessSettings?.welcome_title && (
                <span className="bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent block text-2xl sm:text-3xl mt-2 font-bold">
                  {businessSettings.welcome_title}
                </span>
              )}
            </h1>

            {businessSettings?.welcome_subtitle && (
              <p className="text-gray-600 text-lg sm:text-xl font-medium mt-3">{businessSettings.welcome_subtitle}</p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Badge className={`${isCoach ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600' : 'bg-gradient-to-r from-blue-500 via-blue-600 to-green-500'} text-white border-0 px-5 py-3 text-base sm:text-lg font-bold shadow-lg hover:scale-105 transition-transform duration-300 rounded-full`}>
                {isCoach ? '🏆 מאמן מוסמך' : '💪 מתאמן פעיל'}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm sm:text-base px-4 mt-4 font-medium">
              {format(new Date(), "EEEE, dd MMMM yyyy", { locale: he })}
            </p>
          </div>

          {isCoach ? (
            /* Coach Dashboard - Mobile First */
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-0 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-4 sm:p-6 text-white relative z-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-black mb-1">{traineesData.total}</div>
                        <div className="text-blue-100 text-xs sm:text-sm font-semibold">סה"כ מתאמנים</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 border-0 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-4 sm:p-6 text-white relative z-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Activity className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-black mb-1">{traineesData.active}</div>
                        <div className="text-green-100 text-xs sm:text-sm font-semibold">פעילים היום</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 border-0 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-4 sm:p-6 text-white relative z-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <AlertTriangle className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-black mb-1">{traineesData.needsAttention}</div>
                        <div className="text-orange-100 text-xs sm:text-sm font-semibold">זקוקים לתשומת לב</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 border-0 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-4 sm:p-6 text-white relative z-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Award className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-black mb-1">{traineesData.topPerformers?.length || 0}</div>
                        <div className="text-purple-100 text-xs sm:text-sm font-semibold">מתאמנים מצטיינים</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 sm:gap-6">
                <Card
                  onClick={() => navigate(createPageUrl('Analytics'))}
                  className="group glass-morphism border-2 border-blue-100 shadow-xl hover:shadow-3xl transition-all duration-500 cursor-pointer hover:scale-[1.02] active:scale-[0.98] overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-blue-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>
                  <CardContent className="p-5 sm:p-8 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <div className="flex-1 text-center sm:text-right">
                        <h3 className="text-xl sm:text-3xl font-black text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">אנליטיקס מתקדם</h3>
                        <p className="text-gray-600 text-sm sm:text-base mb-4 font-medium">מעקב מפורט אחר התקדמות המתאמנים שלך</p>
                        <div className="flex items-center justify-center sm:justify-end text-blue-600 font-bold group-hover:gap-2 transition-all">
                          <span className="text-base">צפה בנתונים</span>
                          <ChevronRight className="w-5 h-5 mr-2 group-hover:-translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  onClick={() => navigate(createPageUrl('UserManagement'))}
                  className="group glass-morphism border-2 border-green-100 shadow-xl hover:shadow-3xl transition-all duration-500 cursor-pointer hover:scale-[1.02] active:scale-[0.98] overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-500 to-emerald-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>
                  <CardContent className="p-5 sm:p-8 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <div className="flex-1 text-center sm:text-right">
                        <h3 className="text-xl sm:text-3xl font-black text-gray-800 mb-2 group-hover:text-green-700 transition-colors">ניהול מתאמנים</h3>
                        <p className="text-gray-600 text-sm sm:text-base mb-4 font-medium">הזמן מתאמנים חדשים וערוך פרופילים</p>
                        <div className="flex items-center justify-center sm:justify-end text-green-600 font-bold group-hover:gap-2 transition-all">
                          <span className="text-base">נהל משתמשים</span>
                          <ChevronRight className="w-5 h-5 mr-2 group-hover:-translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions for Coaches - Mobile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card
                  onClick={() => navigate(createPageUrl('Community'))}
                  className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105"
                >
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">הקהילה שלך</h3>
                    <p className="text-gray-600 text-sm">צפה בפעילות המתאמנים וחבר את הקהילה</p>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">הזמן מתאמן חדש</h3>
                    <p className="text-gray-600 text-sm mb-4">צור קישור הזמנה ושלח למתאמן חדש</p>
                    {user?.id && <InviteQuickAction coachId={user.id} />}
                  </CardContent>
                </Card>

                <Card
                  onClick={() => navigate(createPageUrl('CoachDashboard'))}
                  className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 sm:col-span-2 lg:col-span-1"
                >
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">לוח מאמן מתקדם</h3>
                    <p className="text-gray-600 text-sm">ניתוח מתקדם וכלי AI לניהול המתאמנים</p>
                  </CardContent>
                </Card>
              </div>

              {/* Coach Insights - Mobile Optimized */}
              <div className="grid gap-4 sm:gap-6">
                {/* Top Performers */}
                {traineesData.topPerformers && traineesData.topPerformers.length > 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardContent className="p-4 sm:p-8">
                      <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                        מתאמנים מצטיינים
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        {traineesData.topPerformers.slice(0, 3).map((performer, index) => (
                          <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-yellow-50 rounded-xl">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{performer.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={performer.adherence} className="h-2 flex-1" />
                                <span className="text-sm text-gray-600 whitespace-nowrap">{performer.adherence.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Alerts and Recent Activity - Mobile Stacked */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  {alerts.length > 0 && (
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                      <CardContent className="p-4 sm:p-8">
                        <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
                          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                          התראות
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                          {alerts.slice(0, 3).map((alert, index) => (
                            <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 rounded-xl">
                              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 text-sm sm:text-base">{alert.trainee}</p>
                                <p className="text-xs sm:text-sm text-gray-600">{alert.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {recentActivity.length > 0 && (
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                      <CardContent className="p-4 sm:p-8">
                        <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
                          <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                          פעילות אחרונה
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                          {recentActivity.slice(0, 3).map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                  {activity.trainee_name} רשם ארוחה: {activity.food_name}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500">
                                  {activity.calories} קלוריות • {format(new Date(activity.created_date), 'HH:mm', { locale: he })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Trainee Dashboard - Mobile Optimized */
            <div className="space-y-6 sm:space-y-8">
                
              {/* PlanRequestFlow component is removed from here */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Card className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 border-0 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-5 sm:p-7 text-white relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Target className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl sm:text-4xl font-black mb-1">{todayStats.calories}</div>
                        <div className="text-orange-100 text-sm sm:text-base font-semibold">קלוריות היום</div>
                      </div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 shadow-inner overflow-hidden">
                      <div
                        className="bg-gradient-to-l from-white to-yellow-100 rounded-full h-3 transition-all duration-500 shadow-lg"
                        style={{ width: `${Math.min((todayStats.calories / (user.daily_calories_goal || 2000)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 border-0 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-5 sm:p-7 text-white relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl sm:text-4xl font-black mb-1">{todayStats.protein.toFixed(0)}</div>
                        <div className="text-green-100 text-sm sm:text-base font-semibold">גרם חלבון</div>
                      </div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 shadow-inner overflow-hidden">
                      <div
                        className="bg-gradient-to-l from-white to-green-100 rounded-full h-3 transition-all duration-500 shadow-lg"
                        style={{ width: `${Math.min((todayStats.protein / (user.daily_protein_goal || 150)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 border-0 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group relative overflow-hidden sm:col-span-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-5 sm:p-7 text-white relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Star className="w-7 h-7 sm:w-9 sm:h-9 text-white animate-pulse" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl sm:text-4xl font-black mb-1">{weeklyProgress}%</div>
                        <div className="text-purple-100 text-sm sm:text-base font-semibold">השבוע</div>
                      </div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 shadow-inner overflow-hidden">
                      <div
                        className="bg-gradient-to-l from-white to-purple-100 rounded-full h-3 transition-all duration-500 shadow-lg"
                        style={{ width: `${weeklyProgress}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Cards - Mobile Optimized */}
              <div className="grid gap-4 sm:gap-8">
                {(!businessSettings || businessSettings.show_quick_actions) && (
                    <Card
                      onClick={() => navigate(createPageUrl('DailyTracking'))}
                      className="group bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <CardContent className="p-4 sm:p-8 relative z-10">
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <div className="flex-1 text-center sm:text-right">
                            <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">מעקב יומי</h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-4">רשום ארוחות ועקוב אחר הקלוריות</p>
                            <div className="flex items-center justify-center sm:justify-end text-green-600 font-medium">
                              <span>הוסף ארוחה</span>
                              <ChevronRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                )}

                {(!businessSettings || businessSettings.show_weekly_chart) && (
                  <Card
                    onClick={() => navigate(createPageUrl('Dashboard'))}
                    className="group bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--custom-primary,theme(colors.blue.500))]/5 to-[var(--custom-secondary,theme(colors.cyan.500))]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-4 sm:p-8 relative z-10">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--custom-primary,theme(colors.blue.500))] to-[var(--custom-secondary,theme(colors.cyan.500))] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div className="flex-1 text-center sm:text-right">
                          <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">הדשבורד שלי</h3>
                          <p className="text-gray-600 text-sm sm:text-base mb-4">צפה בהתקדמות היומית והיעדים שלך</p>
                          <div className="flex items-center justify-center sm:justify-end text-[var(--custom-primary,theme(colors.blue.600))] font-medium">
                            <span>פתח דשבורד</span>
                            <ChevronRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Quick Actions Grid - Mobile */}
              {(!businessSettings || businessSettings.show_latest_metrics) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                  <Link to={createPageUrl('Calendar')}>
                    <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <CardContent className="p-4 sm:p-8 relative z-10">
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">לוח שנה</h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-4">מעקב חודשי אחר התזונה</p>
                            <div className="flex items-center text-purple-600 font-medium">
                              <span>צפה בלוח שנה</span>
                              <ChevronRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link to={createPageUrl('BodyMetrics')}>
                    <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <CardContent className="p-4 sm:p-8 relative z-10">
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Scale className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">מדדי גוף</h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-4">מעקב אחר משקל ומידות</p>
                            <div className="flex items-center text-indigo-600 font-medium">
                              <span>עדכן מדידות</span>
                              <ChevronRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )}
              {/* Daily Achievement */}
              {todayStats.logs > 0 && (
                <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-0 shadow-xl">
                  <CardContent className="p-4 sm:p-8 text-white">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-center sm:text-right">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                          <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-1">כל הכבוד!</h3>
                          <p className="text-yellow-100">רשמת כבר {todayStats.logs} ארוחות היום</p>
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl">🎉</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
