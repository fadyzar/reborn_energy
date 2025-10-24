
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { NutritionLog } from "@/api/entities";
import { BodyMetrics } from "@/api/entities";
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Users,
  TrendingUp,
  Activity,
  Target,
  AlertTriangle,
  Award,
  Eye,
  Calendar as CalendarIcon,
  BarChart3,
  Zap,
  Crown,
  ChevronRight,
  Filter,
  Search,
  Brain,
  Trophy,
  Lock,
  Star
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { he } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import TraineeCard from "../components/coach/TraineeCard";
import PerformanceHeatmap from "../components/coach/PerformanceHeatmap";
import WeeklyAnalysis from "../components/coach/WeeklyAnalysis";
import SmartAnalytics from "../components/coach/SmartAnalytics";
import TraineeComparison from "../components/coach/TraineeComparison";
import GoalTracking from "../components/coach/GoalTracking";

import useTrialStatus from "../components/trial/useTrialStatus";
import TrialTimer from "../components/trial/TrialTimer";
import SendNotificationDialog from "../components/coach/SendNotificationDialog";

// New UpgradePrompt component עם צבעים בהירים
const UpgradePrompt = () => (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 text-center p-8 shadow-lg">
        <CardHeader>
            <Star className="w-12 h-12 mx-auto text-amber-500" />
            <CardTitle className="text-2xl font-bold mt-4 text-gray-800">זהו פיצ'ר Pro</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="mb-6 text-gray-600">שדרג את המנוי שלך כדי לקבל גישה לתובנות AI, השוואות מתאמנים ועוד כלים מתקדמים.</p>
            <Link to={createPageUrl("UpgradePlan")}>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:from-amber-600 hover:to-orange-600 shadow-md">
                    שדרג עכשיו
                </Button>
            </Link>
        </CardContent>
    </Card>
);


export default function CoachDashboard() {
  const [user, setUser] = useState(null);
  const [trainees, setTrainees] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [allLogs, setAllLogs] = useState([]);
  const [allMetrics, setAllMetrics] = useState([]);
  const [realTimeStats, setRealTimeStats] = useState({});
  const [loading, setLoading] = useState(true);

  // State for notification dialog
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [selectedTraineeForNotif, setSelectedTraineeForNotif] = useState(null);

  const trialStatus = useTrialStatus(user);

  const calculateRealTimeStats = useCallback((traineesList, logs, metrics) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const thisWeek = format(startOfWeek(new Date()), 'yyyy-MM-dd');

    const todayLogs = logs.filter(log => log.date === today);
    const weekLogs = logs.filter(log => log.date >= thisWeek);

    const activeToday = new Set(todayLogs.map(log => log.user_id)).size;
    const activeThisWeek = new Set(weekLogs.map(log => log.user_id)).size;

    const adherenceData = traineesList.map(trainee => {
      const traineeLogs = weekLogs.filter(log => log.user_id === trainee.id);
      const weeklyCalories = traineeLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const expectedCalories = (trainee.daily_calories_goal || 2000) * 7;
      const adherence = expectedCalories > 0 ? (weeklyCalories / expectedCalories) * 100 : 0;

      return { ...trainee, adherence, weeklyLogs: traineeLogs.length };
    });

    setRealTimeStats({
      totalTrainees: traineesList.length,
      activeToday,
      activeThisWeek,
      // Fix: Corrected the reduce callback syntax
      avgAdherence: adherenceData.reduce((acc, t) => acc + t.adherence, 0) / (traineesList.length || 1),
      topPerformers: adherenceData.sort((a, b) => b.adherence - a.adherence).slice(0, 3),
      needsAttention: adherenceData.filter(t => t.adherence < 70).length,
      totalLogs: todayLogs.length
    });
  }, [setRealTimeStats]);

  const loadCoachData = useCallback(async () => {
    setLoading(true);
    try {
      let currentUser = await User.me();

      // Initialize trial period for new users if not already pro
      if (!currentUser.trial_started_date && currentUser.subscription_plan !== 'pro') {
        await User.updateMyUserData({
          trial_started_date: new Date().toISOString()
        });
        currentUser = await User.me(); // Re-fetch to get the updated user data
      }

      setUser(currentUser);

      let coachTrainees = [];
      if (currentUser.role === 'admin') {
        // Admin user can see all non-coach users (who are not themselves)
        const allUsers = await User.list();
        coachTrainees = allUsers.filter(u => !u.is_coach && u.id !== currentUser.id);
      } else {
        // Coach user sees only their assigned trainees
        coachTrainees = await User.filter({ coach_id: currentUser.id });
      }
      setTrainees(coachTrainees);

      if (coachTrainees.length > 0) {
        const logPromises = coachTrainees.map(t => NutritionLog.filter({ user_id: t.id }, '-created_date', 200));
        const metricPromises = coachTrainees.map(t => BodyMetrics.filter({ user_id: t.id }, '-date', 50));
        
        const logsByTrainee = await Promise.all(logPromises);
        const metricsByTrainee = await Promise.all(metricPromises);

        const relevantLogs = logsByTrainee.flat();
        const relevantMetrics = metricsByTrainee.flat();

        setAllLogs(relevantLogs);
        setAllMetrics(relevantMetrics);
        calculateRealTimeStats(coachTrainees, relevantLogs, relevantMetrics);
      } else {
        setAllLogs([]);
        setAllMetrics([]);
        calculateRealTimeStats([], [], []); // Call with empty data if no trainees
      }
      
      // Fetch pending plan requests logic is removed - No longer fetching or setting pendingPlans

    } catch (error) {
      console.error("Error loading coach data:", error);
    }
    setLoading(false);
  }, [calculateRealTimeStats]);

  useEffect(() => {
    loadCoachData();
  }, [loadCoachData]);

  const handleOpenNotificationDialog = (trainee) => {
    setSelectedTraineeForNotif(trainee);
    setIsNotificationDialogOpen(true);
  };

  const handleSendNotification = async (title, content) => {
    if (!user || !selectedTraineeForNotif) {
      console.warn("Attempted to send notification without a user or selected trainee.");
      return;
    }
    try {
      await base44.entities.Notification.create({
        user_id: selectedTraineeForNotif.id,
        coach_id: user.id,
        title,
        content,
        type: 'general',
      });
      setIsNotificationDialogOpen(false);
      toast.success("הודעה נשלחה בהצלחה למתאמן.");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("שגיאה בשליחת ההודעה.");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 transition-colors duration-300">
      {/* Light Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-500/10 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 dark:opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 dark:bg-green-500/10 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 dark:opacity-50 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-cyan-200 dark:bg-cyan-500/10 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 dark:opacity-50 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Trial Timer */}
        {user && <TrialTimer user={user} />}

        {/* Hero Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl mb-4 shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-2">
            לוח מאמן מתקדם
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            שלום {user?.hebrew_name || user?.full_name} | מעקב חכם אחר {realTimeStats.totalTrainees || 0} מתאמנים
          </p>
        </div>
        
        {/* Pending Plans Section is removed */}

        {/* Real-Time Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-xs sm:text-sm font-medium">פעילים היום</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{realTimeStats.activeToday || 0}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-green-600 text-xs sm:text-sm font-medium">עדכון חי</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-xs sm:text-sm font-medium">פעילים השבוע</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{realTimeStats.activeThisWeek || 0}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
              </div>
              <Progress
                value={((realTimeStats.activeThisWeek || 0) / (realTimeStats.totalTrainees || 1)) * 100}
                className="h-1 sm:h-2 mt-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-xs sm:text-sm font-medium">עמידה ממוצעת</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{(realTimeStats.avgAdherence || 0).toFixed(0)}%</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 mr-1" />
                <span className="text-amber-600 text-xs sm:text-sm font-medium">חכם</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-xs sm:text-sm font-medium">זקוקים לתשומת לב</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{realTimeStats.needsAttention || 0}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                </div>
              </div>
              {(realTimeStats.needsAttention || 0) > 0 && (
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-red-600 text-xs sm:text-sm font-medium">דרוש מעקב</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Advanced Tabs System */}
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
                <TabsTrigger value="overview" className="text-gray-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">סקירה</span>
                </TabsTrigger>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <TabsTrigger value="analytics" className="text-gray-700 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 disabled:opacity-50" disabled={!trialStatus.hasAccess}>
                                <Brain className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">AI חכם</span>
                                {!trialStatus.hasAccess && <Lock className="w-3 h-3 ml-2 text-amber-500" />}
                            </TabsTrigger>
                        </TooltipTrigger>
                        {!trialStatus.hasAccess && <TooltipContent><p>שדרג ל-Pro כדי לפתוח</p></TooltipContent>}
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <TabsTrigger value="comparison" className="text-gray-700 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 disabled:opacity-50" disabled={!trialStatus.hasAccess}>
                                <Trophy className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">השוואה</span>
                                {!trialStatus.hasAccess && <Lock className="w-3 h-3 ml-2 text-amber-500" />}
                            </TabsTrigger>
                        </TooltipTrigger>
                        {!trialStatus.hasAccess && <TooltipContent><p>שדרג ל-Pro כדי לפתוח</p></TooltipContent>}
                    </Tooltip>
                </TooltipProvider>

                <TabsTrigger value="goals" className="text-gray-700 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                    <Target className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">יעדים</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="text-gray-700 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">דוחות</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
                {/* Advanced Analytics Section */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2">
                        <WeeklyAnalysis logs={allLogs} trainees={trainees} />
                    </div>
                    <div>
                        <PerformanceHeatmap trainees={trainees} logs={allLogs} />
                    </div>
                </div>

                {/* Trainees Grid */}
                <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Users className="w-6 h-6 text-blue-500" />
                                המתאמנים שלי
                            </CardTitle>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                                    <SelectTrigger className="w-full sm:w-32 bg-white border-gray-300 text-gray-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">היום</SelectItem>
                                        <SelectItem value="week">השבוצ</SelectItem>
                                        <SelectItem value="month">החודש</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {trainees.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">אין מתאמנים עדיין</h3>
                                { user?.role === 'admin'
                                    ? <p className="text-gray-500">כרגע אין מתאמנים רשומים במערכת.</p>
                                    : <p className="text-gray-500">הזמן מתאמנים חדשים כדי להתחיל</p>
                                }
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {trainees.map((trainee) => (
                                    <TraineeCard
                                        key={trainee.id}
                                        trainee={trainee}
                                        logs={allLogs.filter(log => log.user_id === trainee.id)}
                                        metrics={allMetrics.filter(metric => metric.user_id === trainee.id)}
                                        timeframe={selectedTimeframe}
                                        onSendMessage={handleOpenNotificationDialog}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="analytics">
                {trialStatus.hasAccess ? <SmartAnalytics trainees={trainees} logs={allLogs} metrics={allMetrics} /> : <UpgradePrompt />}
            </TabsContent>

            <TabsContent value="comparison">
                {trialStatus.hasAccess ? <TraineeComparison trainees={trainees} logs={allLogs} metrics={allMetrics} /> : <UpgradePrompt />}
            </TabsContent>

            <TabsContent value="goals">
                <GoalTracking
                    trainees={trainees}
                    logs={allLogs}
                    metrics={allMetrics}
                />
            </TabsContent>

            <TabsContent value="reports">
                <div className="grid gap-6">
                    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-gray-800">דוחות מתקדמים</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">בקרוב - דוחות מפורטים ויצוא נתונים</p>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>

        <SendNotificationDialog
          open={isNotificationDialogOpen}
          onClose={() => setIsNotificationDialogOpen(false)}
          trainee={selectedTraineeForNotif}
          onSend={handleSendNotification}
        />
      </div>
    </div>
  );
}
