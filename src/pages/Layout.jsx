

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Calendar, Target, Users, BarChart3, Scale, Home, LogOut, Star, Settings, Utensils, MessageSquare, Bell, Check, AlertTriangle, Trophy, DollarSign, PlusCircle, CheckCircle, User, Dumbbell, Brush } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { User as UserEntity, Notification } from "@/api/entities";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { createCoachNotification } from '@/components/lib/notifications';

const navigationItems = [
  {
    title: "דשבורד", // Dashboard is now the main entry for everyone
    url: createPageUrl("Dashboard"),
    icon: Home, // Use Home icon for the universal dashboard
    forAll: true,
  },
  {
    title: "לוח מאמן", // New item for coaches
    url: createPageUrl("CoachDashboard"),
    icon: LayoutDashboard,
    coachOnly: true,
  },
  {
    title: "המתאמנים שלי", // New simple trainees view
    url: createPageUrl("MyTrainees"),
    icon: Users,
    coachOnly: true,
  },
  {
    title: "מרכז פיקוד", // New Command Center
    url: createPageUrl("CommandCenter"),
    icon: Target,
    coachOnly: true,
    proOnly: false, // Available for all coaches
  },
  {
    title: "דשבורד", // This is the original trainee-only Dashboard. It will be hidden for trainees by filter.
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    traineeOnly: true,
  },
  {
    title: "מעקב יומי",
    url: createPageUrl("DailyTracking"),
    icon: Target,
    traineeOnly: true,
  },
  {
    title: "האנליטיקס שלי",
    url: createPageUrl("PersonalAnalytics"),
    icon: BarChart3,
    traineeOnly: true,
  },
  {
    title: "היכל הכוח", // Changed from "מרכז האוואטר"
    url: createPageUrl("AvatarHub"),
    icon: User,
    traineeOnly: true,
  },
  {
    title: "תיעוד אימון",
    url: createPageUrl("WorkoutLogPage"),
    icon: Dumbbell,
    traineeOnly: true,
  },
  // START: Critical permission fix and splitting game experience for coach
  {
    title: "היכל הכוח", // My Avatar Hub for Coaches (personal game experience) - Changed from "זירת ההתעלות"
    url: createPageUrl("CoachAvatarHub"), // Assuming a new page for this
    icon: User, // Using the same User icon as trainee's Avatar Hub for consistency
    coachOnly: true,
  },
  {
    title: "ליגת האוואטרים",
    url: createPageUrl("AvatarLeague"),
    icon: Trophy,
    coachOnly: true, // This remains coachOnly as it's the coach's view/management of the league
  },
  // END: Critical permission fix and splitting game experience for coach
  {
    title: "קהילה",
    url: createPageUrl("Community"),
    icon: MessageSquare, // New icon for Community
    forAll: true, // Visible to all logged in users
    proOnly: false, // No longer Pro only
  },
  {
    title: "ספריית מתכונים",
    url: createPageUrl("Recipes"),
    icon: Utensils, // Using Utensils icon for recipes
    traineeOnly: true,
    proOnly: true, // New property for Pro features
  },
  {
    title: "לוח שנה",
    url: createPageUrl("Calendar"),
    icon: Calendar,
    traineeOnly: true,
  },
  {
    title: "מדדי גוף",
    url: createPageUrl("BodyMetrics"),
    icon: Scale,
    traineeOnly: true,
  },
  {
    title: "אנליטיקס",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
    coachOnly: true,
  },
  {
    title: "ניהול משתמשים",
    url: createPageUrl("UserManagement"),
    icon: Settings,
    coachOnly: true,
  },
  {
    title: "ניהול חוגים",
    url: createPageUrl("GroupManagement"),
    icon: Users,
    coachOnly: true,
  },
  {
    title: "הגדרות מיתוג",
    url: createPageUrl("BusinessSettingsPage"),
    icon: Brush,
    coachOnly: true,
  },
  {
    title: "הגדרות תשלומים", // New menu item
    url: createPageUrl("PaymentSettings"),
    icon: DollarSign,
    adminOnly: true, // שינוי הרשאה למנהל בלבד
  },
];

// רכיב פעמון ההתראות משודרג
function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data: userNotifications, error } = await Notification.getAll({
          filter: { user_id: user.id },
          orderBy: { field: 'created_at', ascending: false },
          limit: 20
        });
        if (error) throw error;
        setNotifications(userNotifications || []);
        setUnreadCount(userNotifications?.filter(n => !n.is_read).length || 0);
      } catch (error) {
        if (error.message && !error.message.includes('429')) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 180000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await Notification.update(notificationId, { is_read: true });
      if (error) throw error;
      setNotifications(notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      for (const id of unreadIds) {
        const { error } = await Notification.update(id, { is_read: true });
        if (error) throw error;
      }
      setNotifications(notifications.map(n => ({...n, is_read: true})));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // פונקציה לעיבוד תוכן ההודעה - הפיכת שורות לפסקאות
  const formatNotificationContent = (content) => {
    if (!content) return '';
    
    // פיצול לשורות והסרת שורות ריקות
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // זיהוי כותרות (שורות המתחילות באמוג'י או עם סימנים מיוחדים)
      const isHeader = /^[🎯📊💪⚡❤️🔴🟡🟢📱✅❌]/.test(trimmedLine);
      
      // זיהוי רשימות (שורות המתחילות ב- • או -)
      const isBullet = /^[•\-]/.test(trimmedLine);
      
      return (
        <div key={index} className={`
          ${isHeader ? 'font-semibold text-blue-800 mt-2 mb-1' : ''}
          ${isBullet ? 'mr-3 text-gray-700' : 'text-gray-700'}
          ${index > 0 && !isHeader && !isBullet ? 'mt-1' : ''}
          leading-relaxed text-sm
        `}>
          {trimmedLine}
        </div>
      );
    });
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'weekly_report':
        return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'inactive_alert':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'new_trainee':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'new_log':
        return <Utensils className="w-4 h-4 text-indigo-500" />;
      case 'new_metric':
        return <Scale className="w-4 h-4 text-purple-500" />;
      case 'challenge_join':
        return <PlusCircle className="w-4 h-4 text-teal-500" />;
      case 'challenge_submission':
        return <CheckCircle className="w-4 h-4 text-cyan-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-w-[90vw]" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              התראות
            </h3>
            {unreadCount > 0 && (
              <Button variant="link" size="sm" onClick={markAllAsRead} className="text-blue-600 hover:text-blue-800">
                <Check className="w-4 h-4 ml-1" />
                סמן הכל כנקרא
              </Button>
            )}
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium text-gray-600">אין התראות חדשות</p>
                <p className="text-sm text-gray-500 mt-1">כשהמאמן שלך ישלח לך הודעות, תראה אותן כאן</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div key={notification.id} className={`
                  p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer
                  ${!notification.is_read 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-gray-50 border-gray-200'
                  }
                `}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold truncate ${!notification.is_read ? 'text-blue-900' : 'text-gray-800'}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 ml-2 hover:bg-blue-100" 
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="w-3 h-3 text-green-600" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {formatNotificationContent(notification.content)}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          notification.type === 'weekly_report' ? 'bg-blue-100 text-blue-700' :
                          notification.type === 'inactive_alert' ? 'bg-orange-100 text-orange-700' :
                          notification.type === 'achievement' ? 'bg-yellow-100 text-yellow-700' :
                          notification.type === 'new_trainee' ? 'bg-green-100 text-green-700' :
                          notification.type === 'new_log' ? 'bg-indigo-100 text-indigo-700' :
                          notification.type === 'new_metric' ? 'bg-purple-100 text-purple-700' :
                          notification.type === 'challenge_join' ? 'bg-teal-100 text-teal-700' :
                          notification.type === 'challenge_submission' ? 'bg-cyan-100 text-cyan-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {notification.type === 'weekly_report' ? '📊 דוח שבועי' :
                           notification.type === 'inactive_alert' ? '⚠️ תזכורת' :
                           notification.type === 'achievement' ? '🏆 הישג' :
                           notification.type === 'new_trainee' ? '👥 מתאמן חדש' :
                           notification.type === 'new_log' ? '🍽️ תיעוד חדש' :
                           notification.type === 'new_metric' ? '📈 מדד חדש' :
                           notification.type === 'challenge_join' ? '🎉 הצטרפות לאתגר' :
                           notification.type === 'challenge_submission' ? '✅ הגשה לאתגר' :
                           '💬 הודעה'}
                        </span>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true, locale: he })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user: authUser, profile, loading: authLoading } = useAuth();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!authLoading && profile) {
      loadUser();
    }
  }, [authLoading, profile]);

  const loadUser = async () => {
    try {
      let currentUser = profile;
      console.log("[Layout] Current user loaded:", currentUser);

      const urlParams = new URLSearchParams(window.location.search);
      const coachIdFromUrl = urlParams.get('coach_id');

      console.log("[Layout] Coach ID from URL:", coachIdFromUrl);
      console.log("[Layout] Current user coach_id:", currentUser.coach_id);
      console.log("[Layout] User role:", currentUser.role);

      if (coachIdFromUrl && currentUser.role !== 'coach' && currentUser.coach_id !== coachIdFromUrl) {
        console.log("[Layout] Attempting to assign user to coach:", coachIdFromUrl);

        try {
          const { error } = await UserEntity.update(currentUser.id, {
            coach_id: coachIdFromUrl
          });
          if (error) throw error;

          console.log("[Layout] User successfully assigned to coach");
          const { data: updatedUser } = await UserEntity.getById(currentUser.id);
          if (updatedUser) {
            currentUser = updatedUser;
            console.log("[Layout] Updated user data:", currentUser);
          }

          try {
            await createCoachNotification(
              currentUser,
              "מתאמן חדש הצטרף!",
              `${currentUser.full_name} הצטרף לקהילה שלך!`,
              "new_trainee"
            );
            console.log("[Layout] Notification sent to coach");
          } catch (notificationError) {
            console.error("[Layout] Error sending notification:", notificationError);
          }

          window.history.replaceState({}, document.title, window.location.pathname);
          console.log("[Layout] URL parameter removed");

        } catch (updateError) {
          console.error("[Layout] Error updating user data:", updateError);
        }
      }

      setUser(currentUser);
    } catch (error) {
      console.error("[Layout] Error in loadUser:", error);
      setUser(null);
    }
    setLoading(false);
  };

  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isProPlan = user?.subscription_plan === 'pro';
  const isAdmin = user?.role === 'admin';
  const isCoach = user?.role === 'coach';

  const filteredItems = navigationItems.filter(item => {
    if (!user) return false;

    // Admin has access to almost everything, so we check this first.
    if (isAdmin) {
      // Hide MyTrainees from admin if it's not the primary entry
      // Also hide the trainee-specific dashboard if it still exists in the list
      if (item.url === createPageUrl("MyTrainees") || (item.url === createPageUrl("Dashboard") && item.traineeOnly)) return false;
      return item.adminOnly || item.coachOnly || item.forAll;
    }
    
    // Pro plan check for non-admins
    if (item.proOnly && !isProPlan) {
      return false;
    }
    
    // Coach view logic
    if (isCoach) {
      // Coaches should not see the trainee-specific dashboard if it still exists
      if (item.url === createPageUrl("Dashboard") && item.traineeOnly) return false;
      // Coaches should not see the trainee-specific AvatarHub, only their own (CoachAvatarHub)
      if (item.url === createPageUrl("AvatarHub") && item.traineeOnly) return false;

      return item.coachOnly || item.forAll;
    }

    // Trainee view logic
    // Hide original Dashboard for trainee, as the `forAll` Dashboard is now the main entry
    if (item.url === createPageUrl("Dashboard") && item.traineeOnly) return false;
    // Trainees should not see the coach-specific AvatarHub or AvatarLeague
    if ((item.url === createPageUrl("CoachAvatarHub") || item.url === createPageUrl("AvatarLeague")) && item.coachOnly) return false;

    return item.traineeOnly || item.forAll;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden transition-colors duration-300">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40 dark:opacity-20"></div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .shimmer {
          animation: shimmer 3s infinite;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 1000px 100%;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
        }

        .sidebar-item {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-item::before {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          border-radius: 2px;
          transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-item.active::before {
          height: 60%;
        }

        .sidebar-item:hover {
          transform: translateX(-4px);
        }
      `}</style>
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar side="right" className="border-l border-white/20 dark:border-slate-700/50 glass-effect relative z-10">
            <SidebarHeader className="border-b border-blue-100/50 dark:border-slate-700/50 p-6 bg-gradient-to-b from-blue-50/50 dark:from-slate-800/50 to-transparent">
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-2xl bg-gradient-to-l from-blue-600 to-green-600 bg-clip-text text-transparent">Reborn Energy</h2>
                  <p className="text-sm text-gray-600 font-medium">מעקב תזונה חכם</p>
                </div>
              </Link>
            </SidebarHeader>
            
            <SidebarContent className="p-3">
              <SidebarGroup>
                <SidebarGroupLabel className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-3 py-2">
                  תפריט ראשי
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`sidebar-item hover:bg-gradient-to-l hover:from-blue-50 hover:to-green-50 hover:text-blue-700 transition-all duration-300 rounded-2xl mb-2 group ${
                            location.pathname === item.url ? 'bg-gradient-to-l from-blue-100 to-green-100 text-blue-700 shadow-md active' : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-4 px-4 py-3.5 relative overflow-hidden">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              location.pathname === item.url
                                ? 'bg-gradient-to-br from-blue-500 to-green-500 shadow-lg'
                                : 'bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-blue-400 group-hover:to-green-400'
                            }`}>
                              <item.icon className={`w-5 h-5 transition-colors duration-300 ${
                                location.pathname === item.url ? 'text-white' : 'text-gray-600 group-hover:text-white'
                              }`} />
                            </div>
                            <span className="font-semibold text-[15px]">{item.title}</span>
                            {location.pathname === item.url && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-green-500 rounded-r-full"></div>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-blue-100/50 dark:border-slate-700/50 p-4 bg-gradient-to-t from-blue-50/30 dark:from-slate-800/30 to-transparent">
              {user && !isProPlan && !isAdmin && (
                  <div className="mb-4 relative overflow-hidden rounded-2xl">
                      <Link to={createPageUrl("UpgradePlan")}>
                          <Button className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl hover:shadow-2xl py-6 relative group overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <Star className="w-5 h-5 ml-2 relative z-10 animate-pulse" />
                              <span className="relative z-10 text-lg">שדרג ל-Pro</span>
                          </Button>
                      </Link>
                  </div>
              )}

              {user && isProPlan && !isAdmin && (
                <div className="mb-4">
                    <Link to={createPageUrl("UpgradePlan")}>
                        <Button variant="outline" className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 font-semibold py-6 rounded-2xl">
                            <Settings className="w-4 h-4 ml-2" />
                            נהל מנוי
                        </Button>
                    </Link>
                </div>
              )}

              {user ? (
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-4 border border-blue-100 dark:border-slate-600">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-blue-100">
                        <span className="text-white font-bold text-lg">
                          {user.hebrew_name?.[0] || user.full_name?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">
                          {user.hebrew_name || user.full_name || 'משתמש'}
                        </p>
                        <p className="text-xs text-gray-600 truncate font-medium">
                          {isAdmin ? '⭐ מנהל ראשי' : isCoach ? (isProPlan ? '👑 מאמן Pro' : '🎯 מאמן') : (isProPlan ? '💎 מתאמן Pro' : '💪 מתאמן')}
                        </p>
                      </div>
                      <NotificationBell user={user} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="flex-1 text-red-600 border-2 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 transition-all duration-300 font-semibold py-3 rounded-xl"
                    >
                      <LogOut className="w-4 h-4 ml-2" />
                      התנתקות
                    </Button>
                    <ThemeToggle />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Button 
                    onClick={() => UserEntity.login()} // Use UserEntity
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                  >
                    התחברות
                  </Button>
                </div>
              )}
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col relative z-0">
            <header className="glass-effect border-b border-white/30 dark:border-slate-700/50 px-4 sm:px-6 py-4 lg:hidden sticky top-0 z-50 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-l from-blue-600 to-green-600 bg-clip-text text-transparent">Reborn Energy</span>
                </Link>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  {user && <NotificationBell user={user} />}
                  <SidebarTrigger className="hover:bg-blue-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-all duration-200 active:scale-95" />
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

