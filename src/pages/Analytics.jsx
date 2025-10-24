
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { NutritionLog } from "@/api/entities";
import { BodyMetrics } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, TrendingUp, AlertTriangle } from "lucide-react";

import TraineesOverview from "../components/analytics/TraineesOverview";
import PerformanceChart from "../components/analytics/PerformanceChart";
import AlertsPanel from "../components/analytics/AlertsPanel";

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [trainees, setTrainees] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [allMetrics, setAllMetrics] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    // setLoading(false) removed from here, now handled by the useEffect watching 'user'
  };

  const loadAnalyticsData = useCallback(async () => {
    if (!user) return; // Guard clause if user is not available
    setLoading(true); // Set loading true at the start of data fetching
    try {
      let coachTrainees = [];
      
      if (user.role === 'admin') {
        // Admin can see all non-coach users
        const allUsers = await User.list();
        coachTrainees = allUsers.filter(u => !u.is_coach);
      } else if (user.is_coach) {
        // Coach can only see their own trainees
        coachTrainees = await User.filter({ coach_id: user.id });
      }
      
      setTrainees(coachTrainees);

      if (coachTrainees.length > 0) {
          // Fetch logs and metrics specifically for each trainee
          const logPromises = coachTrainees.map(t => NutritionLog.filter({ user_id: t.id }, '-date', 200));
          const metricPromises = coachTrainees.map(t => BodyMetrics.filter({ user_id: t.id }, '-date', 100));

          const logsByTrainee = await Promise.all(logPromises);
          const metricsByTrainee = await Promise.all(metricPromises);

          // Flatten the arrays of logs/metrics from all trainees
          const relevantLogs = logsByTrainee.flat();
          const relevantMetrics = metricsByTrainee.flat();

          setAllLogs(relevantLogs);
          setAllMetrics(relevantMetrics);
      } else {
          setAllLogs([]);
          setAllMetrics([]);
      }

    } catch (error) {
      console.error("Error loading analytics data:", error);
    }
    setLoading(false); // Set loading false after data fetching (or error)
  }, [user]); // Dependency array for useCallback

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    } else {
      // If user is null after initial loadUser attempt, stop loading
      setLoading(false);
    }
  }, [user, loadAnalyticsData]); // Rerun when user changes or loadAnalyticsData function definition changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">יש להתחבר למערכת</p>
      </div>
    );
  }

  if (!user.is_coach && user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">אין הרשאה</h2>
        <p className="text-gray-600">עמוד זה זמין רק למאמנים ומנהלים</p>
      </div>
    );
  }

  const filteredLogs = selectedTrainee === "all" 
    ? allLogs 
    : allLogs.filter(log => log.user_id === selectedTrainee);

  const filteredMetrics = selectedTrainee === "all" 
    ? allMetrics 
    : allMetrics.filter(metric => metric.user_id === selectedTrainee);

  return (
    <div className="p-4 lg:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">אנליטיקס מאמן</h1>
            <p className="text-gray-600">מעקב ביצועים של המתאמנים</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedTrainee} onValueChange={setSelectedTrainee}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="בחר מתאמן" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל המתאמנים</SelectItem>
                {trainees.map((trainee) => (
                  <SelectItem key={trainee.id} value={trainee.id}>
                    {trainee.hebrew_name || trainee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-blue-500" />
                מתאמנים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {trainees.length}
              </div>
              <p className="text-sm text-gray-500">סה"כ מתאמנים</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-green-500" />
                רישומים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {filteredLogs.length}
              </div>
              <p className="text-sm text-gray-500">רישומי תזונה</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                מדידות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {filteredMetrics.length}
              </div>
              <p className="text-sm text-gray-500">מדידות גוף</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                התראות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                3
              </div>
              <p className="text-sm text-gray-500">דורש תשומת לב</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trainees Overview */}
          <div className="lg:col-span-2">
            <TraineesOverview 
              trainees={trainees}
              logs={allLogs}
              metrics={allMetrics}
            />
          </div>

          {/* Alerts Panel */}
          <div className="space-y-6">
            <AlertsPanel 
              trainees={trainees}
              logs={allLogs}
              metrics={allMetrics}
            />
            
            <PerformanceChart 
              logs={filteredLogs}
              selectedTrainee={selectedTrainee}
              trainees={trainees}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
