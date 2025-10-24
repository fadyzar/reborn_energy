
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { NutritionLog } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, UserPlus, Search, ArrowRight, Loader2,
  BarChart3, AlertTriangle
} from "lucide-react";
import TraineeAnalytics from "../components/users/TraineeAnalytics";

export default function MyTrainees() {
  const [user, setUser] = useState(null);
  const [trainees, setTrainees] = useState([]);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("[MyTrainees] Starting to load user...");
      const currentUser = await User.me();
      console.log("[MyTrainees] Current user:", currentUser);
      setUser(currentUser);

      // Check permissions first
      if (!currentUser.is_coach && currentUser.role !== 'admin') {
        console.log("[MyTrainees] User is not a coach or admin");
        setTrainees([]);
        setNutritionLogs([]);
        setLoading(false);
        return;
      }

      console.log("[MyTrainees] Loading trainees for coach/admin:", currentUser.id);
      
      let fetchedTrainees = [];
      try {
        if (currentUser.role === 'admin') {
          // Admin can see all non-coach, non-admin users
          const allUsers = await User.list();
          fetchedTrainees = allUsers.filter(u => !u.is_coach && u.role !== 'admin');
        } else {
          // Simplified and more robust filter: just get users assigned to this coach.
          fetchedTrainees = await User.filter({ coach_id: currentUser.id });
          // Optional: client-side filter to be extra safe, though backend should handle this.
          // This ensures that even if a coach has themselves or another coach assigned as a 'trainee'
          // due to data anomaly, they won't show up here.
          fetchedTrainees = fetchedTrainees.filter(u => !u.is_coach);
        }
        console.log("[MyTrainees] Trainees found:", fetchedTrainees.length);
        console.log("[MyTrainees] Trainee details:", fetchedTrainees.map(t => ({
          id: t.id,
          name: t.hebrew_name || t.full_name,
          coach_id: t.coach_id
        })));
      } catch (traineeError) {
        console.error("[MyTrainees] Error loading trainees:", traineeError);
        fetchedTrainees = [];
      }
      
      setTrainees(fetchedTrainees);

      // Load nutrition logs if we have trainees
      if (fetchedTrainees.length > 0) {
        console.log("[MyTrainees] Loading nutrition logs...");
        try {
          const logPromises = fetchedTrainees.map(trainee => 
            NutritionLog.filter({ user_id: trainee.id }, '-created_date', 100).catch(err => {
              console.warn(`[MyTrainees] Failed to load logs for trainee ${trainee.id}:`, err);
              return [];
            })
          );
          const logsByTrainee = await Promise.all(logPromises);
          const allLogs = logsByTrainee.flat();
          console.log("[MyTrainees] Logs loaded:", allLogs.length);
          setNutritionLogs(allLogs);
        } catch (logsError) {
          console.error("[MyTrainees] Error loading nutrition logs:", logsError);
          setNutritionLogs([]);
        }
      } else {
        console.log("[MyTrainees] No trainees found, setting empty logs");
        setNutritionLogs([]);
      }

    } catch (e) {
      console.error("[MyTrainees] Critical error:", e);
      if (e.message && e.message.includes('401')) {
        setError('יש להתחבר מחדש למערכת.');
      } else if (e.message && e.message.includes('403')) {
        setError('אין הרשאה לצפות בנתונים אלו.');
      } else {
        setError('שגיאה בטעינת הנתונים. נסה לרענן את הדף.');
      }
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    
    // רענן נתונים כל דקה כדי לתפוס מתאמנים חדשים
    const interval = setInterval(() => {
      console.log("[MyTrainees] Auto-refreshing data...");
      loadData();
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredTrainees = trainees.filter(trainee =>
    (trainee.hebrew_name || trainee.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">טוען נתונים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={loadData} className="w-full">נסה שוב</Button>
            <Button 
              variant="outline" 
              onClick={() => User.login()} 
              className="w-full"
            >
              התחבר מחדש
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-blue-800 mb-2">נדרשת התחברות</h2>
          <p className="text-blue-600 mb-4">עליך להתחבר כדי לצפות במתאמנים שלך.</p>
          <Button onClick={() => User.login()} className="w-full">
            התחבר למערכת
          </Button>
        </div>
      </div>
    );
  }

  if (!user.is_coach && user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-orange-800 mb-2">אין הרשאה</h2>
          <p className="text-orange-600 mb-4">עמוד זה זמין רק למאמנים ומנהלים.</p>
          <Button onClick={() => navigate(createPageUrl('Dashboard'))} className="w-full">
            חזרה לעמוד הבית
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              המתאמנים שלי
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">נהל, עקוב ותקשר עם כל המתאמנים שלך ממקום אחד.</p>
          </div>
          <Button onClick={() => navigate(createPageUrl('UserManagement'))}>
            <UserPlus className="w-4 h-4 ml-2" />
            הזמן מתאמן חדש
          </Button>
        </div>

        {trainees.length > 0 && (
          <TraineeAnalytics trainees={trainees} nutritionLogs={nutritionLogs} />
        )}

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="dark:text-white">רשימת מתאמנים ({filteredTrainees.length})</CardTitle>
              {trainees.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="חפש מתאמן..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredTrainees.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrainees.map(trainee => (
                  <Card key={trainee.id} className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-slate-600 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] card-hover">
                    <CardContent className="p-6">
                      {/* Header with Avatar and Name */}
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg">
                          {(trainee.hebrew_name || trainee.full_name || 'U')[0]}
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 dark:text-white">
                          {trainee.hebrew_name || trainee.full_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {trainee.email}
                        </p>
                      </div>

                      {/* Goal Badge */}
                      <div className="text-center mb-4">
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1">
                          {trainee.goal || 'מטרה כללית'}
                        </Badge>
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium shadow-lg"
                        onClick={() => navigate(createPageUrl(`TraineeProfile?id=${trainee.id}`))}
                      >
                        <BarChart3 className="w-4 h-4 ml-2" />
                        צפה בפרופיל מלא
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm 
                    ? `לא נמצאו מתאמנים בשם "${searchTerm}"`
                    : 'עדיין אין לך מתאמנים'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'נסה לשנות את מונח החיפוש או לנקות את החיפוש.'
                    : 'התחל בהזמנת המתאמן הראשון שלך!'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => navigate(createPageUrl('UserManagement'))}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="w-4 h-4 ml-2" />
                    הזמן מתאמן ראשון
                  </Button>
                )}
                {searchTerm && (
                  <Button 
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                    className="ml-2"
                  >
                    נקה חיפוש
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
