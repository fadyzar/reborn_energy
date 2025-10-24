
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { NutritionLog } from "@/api/entities";
import { BodyMetrics } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, Brain, Target, Clock, 
  Calendar, Zap, Star, Activity, AlertCircle, 
  BarChart3, PieChart, Trophy, Flame, Lock
} from "lucide-react";
import { format, subDays, isToday, startOfWeek, endOfWeek } from "date-fns";
import { he } from "date-fns/locale";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

import WeeklyHeatmap from "../components/analytics/WeeklyHeatmap";
import NutritionInsights from "../components/analytics/NutritionInsights";
import GoalProgress from "../components/analytics/GoalProgress";
import SmartRecommendations from "../components/analytics/SmartRecommendations";
import useTrialStatus from "../components/trial/useTrialStatus";
import TrialTimer from "../components/trial/TrialTimer";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function PersonalAnalytics() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const navigate = useNavigate();
  
  const trialStatus = useTrialStatus(user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let currentUser = await User.me();
      
      // Initialize trial period for new users
      if (!currentUser.trial_started_date && currentUser.subscription_plan !== 'pro') {
        await User.updateMyUserData({ 
          trial_started_date: new Date().toISOString()
        });
        currentUser = await User.me(); // Re-fetch user data to get updated trial_started_date
      }
      
      setUser(currentUser);

      // Load nutrition logs for the last 30 days
      const userLogs = await NutritionLog.filter({ 
        user_id: currentUser.id 
      }, '-date', 100);
      setLogs(userLogs);

      // Load body metrics
      const userMetrics = await BodyMetrics.filter({ 
        user_id: currentUser.id 
      }, '-date', 30);
      setMetrics(userMetrics);

    } catch (error) {
      console.error("Error loading data:", error);
      setUser(null);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl">טוען נתונים...</p>
        </div>
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

  const isProPlan = user?.subscription_plan === 'pro';

  // Calculate analytics data
  const today = new Date();
  const weekAgo = subDays(today, 7);
  const monthAgo = subDays(today, 30);

  const weekLogs = logs.filter(log => new Date(log.date) >= weekAgo);
  const monthLogs = logs.filter(log => new Date(log.date) >= monthAgo);

  // Daily averages
  const weeklyAverage = {
    calories: weekLogs.reduce((sum, log) => sum + (log.calories || 0), 0) / 7,
    protein: weekLogs.reduce((sum, log) => sum + (log.protein || 0), 0) / 7,
  };

  // Meal timing analysis
  const mealTiming = logs.reduce((acc, log) => {
    if (log.created_date) {
      const hour = new Date(log.created_date).getHours();
      const timeSlot = hour < 10 ? 'בוקר' : hour < 15 ? 'צהריים' : hour < 20 ? 'ערב' : 'לילה';
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
    }
    return acc;
  }, {});

  const mealTimingData = Object.entries(mealTiming).map(([time, count]) => ({ time, count }));

  // Progress trends
  const weeklyTrends = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => log.date === dateString);
    const totalCalories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const totalProtein = dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
    
    weeklyTrends.push({
      date: format(date, 'dd/MM'),
      calories: totalCalories,
      protein: totalProtein,
      goal: user.daily_calories_goal || 2000
    });
  }

  // Macro distribution (last 7 days)
  const macroTotals = weekLogs.reduce((acc, log) => ({
    protein: acc.protein + (log.protein || 0),
    carbs: acc.carbs + (log.carbs || 0),
    fat: acc.fat + (log.fat || 0)
  }), { protein: 0, carbs: 0, fat: 0 });

  const macroData = [
    { name: 'חלבון', value: macroTotals.protein * 4, color: '#10B981' },
    { name: 'פחמימות', value: macroTotals.carbs * 4, color: '#3B82F6' },
    { name: 'שומן', value: macroTotals.fat * 9, color: '#F59E0B' }
  ];

  // Consistency score
  const consistencyScore = Math.round((weekLogs.length / 21) * 100); // 3 meals per day for 7 days

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative p-8">
          <div className="max-w-7xl mx-auto">
            {/* Trial Timer */}
            {user && <TrialTimer user={user} />}

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                האנליטיקס שלי
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                תובנות מתקדמות על ההרגלים התזונתיים והביצועים שלך
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {weeklyAverage.calories.toFixed(0)}
                  </div>
                  <p className="text-gray-300 text-sm">קלוריות ממוצע יומי</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {weekLogs.length}
                  </div>
                  <p className="text-gray-300 text-sm">ארוחות השבוע</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {consistencyScore}%
                  </div>
                  <p className="text-gray-300 text-sm">עקביות השבוע</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {metrics.length}
                  </div>
                  <p className="text-gray-300 text-sm">מדידות גוף</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-xl">
            <TabsTrigger value="trends" className="data-[state=active]:bg-purple-600">מגמות</TabsTrigger>
            <TabsTrigger value="nutrition" className="data-[state=active]:bg-purple-600">תזונה</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">תובנות</TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-purple-600">יעדים</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Calories Trend */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    מגמת קלוריות - 7 ימים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weeklyTrends}>
                      <defs>
                        <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="calories"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#caloriesGradient)"
                      />
                      <Line
                        type="monotone"
                        dataKey="goal"
                        stroke="#F59E0B"
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Meal Timing */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    דפוסי אכילה
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mealTimingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Heatmap */}
            <WeeklyHeatmap logs={logs} />
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Macro Distribution */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-400" />
                    חלוקת מקרו - השבוע
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        dataKey="value"
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {macroData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Nutrition Insights */}
              <NutritionInsights logs={weekLogs} user={user} />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 mt-6">
            {trialStatus.hasAccess ? (
              <SmartRecommendations logs={logs} user={user} />
            ) : (
              <Card className="bg-gradient-to-br from-purple-600/50 to-pink-600/50 border-purple-400 text-center">
                <CardContent className="p-12">
                  <Lock className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                  <h3 className="text-2xl font-bold mb-4">תובנות AI - פיצ'ר Pro</h3>
                  <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                    שדרג למסלול Pro וקבל תובנות מתקדמות מ-AI על ההרגלים שלך, 
                    המלצות אישיות ועצות לשיפור הביצועים.
                  </p>
                  <Button 
                    onClick={() => navigate(createPageUrl('UpgradePlan'))}
                    className="bg-yellow-400 text-slate-900 font-bold text-lg py-3 px-8 hover:bg-yellow-500"
                  >
                    <Star className="w-5 h-5 mr-2" />
                    שדרג עכשיו
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-6">
            <GoalProgress user={user} logs={weekLogs} metrics={metrics} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
