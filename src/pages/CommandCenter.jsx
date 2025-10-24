
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Users, AlertTriangle, Link as LinkIcon, 
  Copy, Target, Activity, TrendingUp, MessageSquare,
  Star, Crown, Zap
} from "lucide-react";

export default function CommandCenter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const generateInviteLink = (userId) => {
    // השתמש בכתובת הנוכחית של המערכת במקום ב-window.location.origin
    const currentUrl = window.location.href.split('?')[0]; // מסיר פרמטרים קיימים
    const baseUrl = currentUrl.includes('/CommandCenter') ? currentUrl.replace('/CommandCenter', '') : currentUrl;
    const link = `${baseUrl}?coach_id=${userId}`;
    setInviteLink(link);
  };

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      if (currentUser && (currentUser.is_coach || currentUser.role === 'admin')) {
        generateInviteLink(currentUser.id);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  }, []); // Empty dependency array as `generateInviteLink` is stable (pure function) and `User.me()` is an external call

  useEffect(() => {
    loadUser();
  }, [loadUser]); // `loadUser` is now stable due to useCallback

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 text-xl">טוען מרכז פיקוד...</p>
        </div>
      </div>
    );
  }

  if (!user || (!user.is_coach && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">אין הרשאה</h2>
          <p className="text-slate-600">מרכז הפיקוד זמין רק למאמנים ומנהלים</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            מרכז פיקוד מאמן
          </h1>
          <p className="text-gray-600 text-lg">
            שלום {user?.hebrew_name || user?.full_name} | המערכת מוכנה לעבודה
          </p>
        </div>

        {/* Main Action - Invite Trainees */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              הזמן מתאמנים ותתחיל לעבוד
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-800 text-lg mb-3">🚀 איך להתחיל?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">שלב 1: הזמן מתאמנים</h4>
                  <ul className="text-blue-600 text-sm space-y-1">
                    <li>• העתק את הקישור למטה</li>
                    <li>• שלח ל-WhatsApp, SMS או אימייל</li>
                    <li>• המתאמן נרשם ומקושר אליך אוטומטית</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">שלב 2: התחל להרוויח</h4>
                  <ul className="text-blue-600 text-sm space-y-1">
                    <li>• עקוב אחר מתאמנים בזמן אמת</li>
                    <li>• שלח התראות והודעות</li>
                    <li>• הרווח מהשדרוגים ל-Pro</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Invite Link */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">קישור ההזמנה שלך:</label>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={inviteLink} 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  dir="ltr"
                />
                <Button 
                  onClick={copyToClipboard} 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6"
                >
                  {copied ? (
                    <Badge className="text-white bg-green-500">הועתק!</Badge>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      העתק
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-green-800 text-lg mb-2">מעקב בזמן אמת</h3>
              <p className="text-green-700 text-sm">
                ברגע שיהיו לך מתאמנים, תוכל לראות כאן את כל הנתונים שלהם בזמן אמת
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold text-purple-800 text-lg mb-2">התראות חכמות</h3>
              <p className="text-purple-700 text-sm">
                המערכת תזהה מתאמנים שזקוקים לעזרה ותשלח לך התראות
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-orange-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-bold text-orange-800 text-lg mb-2">הרווח כסף</h3>
              <p className="text-orange-700 text-sm">
                כל מתאמן ששדרג ל-Pro מביא לך הכנסה ישירה לחשבון
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center shadow-2xl">
          <CardContent className="p-8">
            <Zap className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">מוכן להתחיל?</h2>
            <p className="text-blue-100 mb-6">
              שתף את הקישור עם 5 אנשים ותראה איך המערכת מתחילה לעבוד בשבילך
            </p>
            <Button 
              onClick={copyToClipboard}
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3"
            >
              {copied ? "הועתק בהצלחה! 🎉" : "העתק קישור והתחל 🚀"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
