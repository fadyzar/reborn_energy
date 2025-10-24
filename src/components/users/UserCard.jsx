import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Mail, Phone, Target, Edit, Calendar, Activity, TrendingUp, MessageSquare, Eye, Star, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

import UserEditForm from "./UserEditForm";

export default function UserCard({ 
  user, 
  onUpdate, 
  currentUser, 
  activityScore, 
  performanceScore, 
  isSelected, 
  onSelect, 
  viewMode = 'grid',
  isProPlan = false 
}) {
  const [showEditForm, setShowEditForm] = useState(false);

  const getRoleColor = (role, isCoach) => {
    if (role === 'admin') return 'bg-red-100 text-red-800 border-red-200';
    if (isCoach) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getRoleText = (role, isCoach) => {
    if (role === 'admin') return 'מנהל';
    if (isCoach) return 'מאמן';
    return 'מתאמן';
  };

  const getGoalColor = (goal) => {
    switch (goal) {
      case 'ירידה במשקל': return 'bg-red-100 text-red-800';
      case 'עלייה במשקל': return 'bg-green-100 text-green-800';
      case 'שמירה על משקל': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (score) => {
    if (score >= 90) return 'מצטיין';
    if (score >= 80) return 'טוב מאוד';
    if (score >= 60) return 'בינוני';
    return 'זקוק לשיפור';
  };

  const canEdit = currentUser.role === 'admin' || 
    (currentUser.is_coach && user.coach_id === currentUser.id) ||
    currentUser.id === user.id;

  if (viewMode === 'list') {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isProPlan && (
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={onSelect}
                />
              )}
              
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {(user.hebrew_name || user.full_name || 'U')[0]}
                </span>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">
                  {user.hebrew_name || user.full_name || 'משתמש'}
                </h3>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">פעילות</div>
                <div className="font-bold">{activityScore || 0}</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500">ביצועים</div>
                <div className={`font-bold ${getPerformanceColor(performanceScore || 0)}`}>
                  {(performanceScore || 0).toFixed(0)}%
                </div>
              </div>
              
              <Badge className={getRoleColor(user.role, user.is_coach)}>
                {getRoleText(user.role, user.is_coach)}
              </Badge>
              
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditForm(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        
        {showEditForm && (
          <UserEditForm
            user={user}
            onClose={() => setShowEditForm(false)}
            onUpdate={onUpdate}
          />
        )}
      </Card>
    );
  }

  // Grid view (enhanced)
  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isProPlan && (
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={onSelect}
                />
              )}
              <CardTitle className="text-lg">
                {user.hebrew_name || user.full_name || 'משתמש'}
              </CardTitle>
            </div>
            <Badge className={getRoleColor(user.role, user.is_coach)}>
              {getRoleText(user.role, user.is_coach)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Performance Indicators - Pro Feature */}
          {isProPlan && (activityScore > 0 || performanceScore > 0) && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">ביצועים השבוע</span>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">פעילות</span>
                  <div className="flex items-center gap-2 flex-1 mx-2">
                    <Progress value={Math.min((activityScore || 0) * 10, 100)} className="h-2" />
                    <span className="text-xs font-medium">{activityScore || 0}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">עמידה ביעדים</span>
                  <div className="flex items-center gap-2 flex-1 mx-2">
                    <Progress value={performanceScore || 0} className="h-2" />
                    <span className={`text-xs font-medium ${getPerformanceColor(performanceScore || 0)}`}>
                      {(performanceScore || 0).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-center">
                <Badge className={`${getPerformanceColor(performanceScore || 0)} bg-transparent border`}>
                  {getPerformanceLabel(performanceScore || 0)}
                </Badge>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{user.email}</span>
            </div>
            
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {user.birth_date && (
              <div>
                <span className="text-gray-500">גיל:</span>
                <p className="font-medium">
                  {new Date().getFullYear() - new Date(user.birth_date).getFullYear()}
                </p>
              </div>
            )}
            
            {user.height && (
              <div>
                <span className="text-gray-500">גובה:</span>
                <p className="font-medium">{user.height} ס"מ</p>
              </div>
            )}
            
            {user.gender && (
              <div>
                <span className="text-gray-500">מין:</span>
                <p className="font-medium">{user.gender}</p>
              </div>
            )}
            
            {user.activity_level && (
              <div>
                <span className="text-gray-500">פעילות:</span>
                <p className="font-medium">{user.activity_level}</p>
              </div>
            )}
          </div>

          {/* Goal */}
          {user.goal && (
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" />
              <Badge className={getGoalColor(user.goal)}>
                {user.goal}
              </Badge>
            </div>
          )}

          {/* Goals Summary */}
          {(user.daily_calories_goal || user.daily_protein_goal) && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-sm mb-2">יעדים יומיים:</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {user.daily_calories_goal && (
                  <div>קלוריות: {user.daily_calories_goal}</div>
                )}
                {user.daily_protein_goal && (
                  <div>חלבון: {user.daily_protein_goal}ג</div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions - Pro Feature */}
          {isProPlan && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <MessageSquare className="w-3 h-3 ml-1" />
                הודעה
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="w-3 h-3 ml-1" />
                צפה
              </Button>
            </div>
          )}

          {/* Registration Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500 border-t pt-3">
            <Calendar className="w-3 h-3" />
            <span>
              הצטרף: {format(new Date(user.created_date), "dd/MM/yyyy")}
            </span>
          </div>

          {/* Edit Button */}
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditForm(true)}
              className="w-full mt-3"
            >
              <Edit className="w-4 h-4 ml-2" />
              עריכה
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Edit Form Modal */}
      {showEditForm && (
        <UserEditForm
          user={user}
          onClose={() => setShowEditForm(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}