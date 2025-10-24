import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Target, 
  Clock,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  User,
  Calendar
} from "lucide-react";
import { format, subDays } from "date-fns";

export default function SmartRecommendations({ trainees, logs }) {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    generateRecommendations();
  }, [trainees, logs]);

  const generateRecommendations = () => {
    const recs = [];
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    trainees.forEach(trainee => {
      const traineeLogs = logs.filter(log => 
        log.user_id === trainee.id && log.date >= weekAgo
      );
      
      const weeklyCalories = traineeLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const dailyGoal = trainee.daily_calories_goal || 2000;
      const adherence = (weeklyCalories / (dailyGoal * 7)) * 100;
      
      // Generate personalized recommendations
      if (adherence < 60) {
        recs.push({
          type: 'urgent',
          category: 'motivation',
          trainee: trainee.hebrew_name || trainee.full_name,
          traineeId: trainee.id,
          icon: AlertTriangle,
          title: 'דרושה מוטיבציה',
          message: 'עמידה נמוכה ביעדים - מומלץ שיחה אישית',
          action: 'התקשר למתאמן',
          priority: 'high'
        });
      }
      
      if (traineeLogs.length === 0) {
        recs.push({
          type: 'inactive',
          category: 'engagement',
          trainee: trainee.hebrew_name || trainee.full_name,
          traineeId: trainee.id,
          icon: Clock,
          title: 'לא פעיל השבוע',
          message: 'לא רשם ארוחות - שלח תזכורת',
          action: 'שלח הודעה',
          priority: 'high'
        });
      }
      
      // Meal timing analysis
      const mealTimes = traineeLogs.map(log => ({
        type: log.meal_type,
        hour: new Date(log.created_date).getHours()
      }));
      
      const breakfastLogs = mealTimes.filter(m => m.type === 'אוחת בוקר');
      if (breakfastLogs.length > 0) {
        const avgBreakfastTime = breakfastLogs.reduce((sum, m) => sum + m.hour, 0) / breakfastLogs.length;
        if (avgBreakfastTime > 10) {
          recs.push({
            type: 'optimization',
            category: 'nutrition',
            trainee: trainee.hebrew_name || trainee.full_name,
            traineeId: trainee.id,
            icon: Lightbulb,
            title: 'שיפור זמני ארוחות',
            message: `מאחר בארוחת בוקר - ממוצע ${avgBreakfastTime.toFixed(1)}:00`,
            action: 'תן טיפ תזונתי',
            priority: 'medium'
          });
        }
      }
      
      // Success patterns
      if (adherence > 90 && traineeLogs.length >= 14) {
        recs.push({
          type: 'success',
          category: 'recognition',
          trainee: trainee.hebrew_name || trainee.full_name,
          traineeId: trainee.id,
          icon: Target,
          title: 'ביצועים מעולים',
          message: `${adherence.toFixed(0)}% עמידה ביעדים - שלח עידוד`,
          action: 'שלח הודעת הכרה',
          priority: 'low'
        });
      }
    });

    setRecommendations(recs);
  };

  const handleAction = (recommendation) => {
    console.log('Performing action:', recommendation);
    // Here you would implement the actual actions like sending messages, calls etc.
  };

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === selectedCategory);

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgent': return 'bg-red-50 border-red-200 text-red-800';
      case 'inactive': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'optimization': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            המלצות חכמות
          </h2>
          <p className="text-gray-600">המלצות מותאמות אישית לכל מתאמן</p>
        </div>
        
        <div className="flex gap-2">
          {['all', 'motivation', 'engagement', 'nutrition', 'recognition'].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category === 'all' ? 'הכל' :
               category === 'motivation' ? 'מוטיבציה' :
               category === 'engagement' ? 'מעורבות' :
               category === 'nutrition' ? 'תזונה' : 'הכרה'}
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {recommendations.filter(r => r.priority === 'high').length}
              </div>
              <div className="text-red-600 text-sm">דחוף</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {recommendations.filter(r => r.priority === 'medium').length}
              </div>
              <div className="text-yellow-600 text-sm">בינוני</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {recommendations.filter(r => r.priority === 'low').length}
              </div>
              <div className="text-green-600 text-sm">נמוך</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {recommendations.length}
              </div>
              <div className="text-blue-600 text-sm">סה"כ</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">אין המלצות כרגע</h3>
              <p className="text-gray-500">כל המתאמנים שלך בביצועים טובים!</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations
            .sort((a, b) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            })
            .map((recommendation, index) => {
              const Icon = recommendation.icon;
              return (
                <Card key={index} className={`border-l-4 ${getTypeColor(recommendation.type)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          <span className="text-lg">{getPriorityIcon(recommendation.priority)}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {recommendation.trainee}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{recommendation.message}</p>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            <span>מתאמן: {recommendation.trainee}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleAction(recommendation)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {recommendation.action}
                        </Button>
                        
                        <Badge 
                          className={`text-center ${
                            recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                            recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          {recommendation.priority === 'high' ? 'דחוף' :
                           recommendation.priority === 'medium' ? 'בינוני' : 'נמוך'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>
    </div>
  );
}