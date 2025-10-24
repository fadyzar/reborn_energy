import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Trophy, Clock, Star, Edit, Users, Check, X, Send, Eye, Plus,
  Power, PowerOff, Award, Coins
} from 'lucide-react';
import { format, isPast } from 'date-fns';
import { he } from 'date-fns/locale';

const statusConfig = {
  in_progress: { label: 'בתהליך', color: 'bg-blue-100 text-blue-800' },
  pending_approval: { label: 'ממתין לאישור', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'הושלם', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'נדחה', color: 'bg-red-100 text-red-800' },
  default: { label: 'הצטרף', color: 'bg-gray-100 text-gray-800' }
};

export default function ChallengeCard({ 
  challenge, 
  participations, 
  user, 
  isCoach, 
  onJoin, 
  onSubmitProof, 
  onApprove, 
  onEdit, 
  onToggleActive,
  trainees 
}) {
  const userParticipation = participations.find(p => p.user_id === user.id);
  const [proofText, setProofText] = useState('');

  const handleProofSubmit = () => {
    if (proofText.trim()) {
      onSubmitProof(challenge.id, proofText);
      setProofText('');
    }
  };

  const getStatus = (p) => {
    return statusConfig[p.status] || statusConfig.default;
  };

  const handleToggleActive = () => {
    if (onToggleActive) {
      onToggleActive(challenge.id, !challenge.is_active);
    }
  };

  const completedParticipants = participations.filter(p => p.status === 'completed').length;
  const pendingApproval = participations.filter(p => p.status === 'pending_approval').length;

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border shadow-lg w-full transition-all duration-300 ${
      challenge.is_active ? 'border-green-300 shadow-green-100' : 'border-gray-300 opacity-75'
    }`}>
      <CardHeader className="pb-3">
        {/* כותרת ובקרות - מותאם למובייל */}
        <div className="flex flex-col space-y-3 lg:flex-row lg:justify-between lg:items-start lg:space-y-0">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-start gap-2 mb-2 leading-tight">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span className="break-words">{challenge.title}</span>
              {!challenge.is_active && (
                <Badge variant="secondary" className="bg-gray-200 text-gray-600 text-xs flex-shrink-0">
                  מושבת
                </Badge>
              )}
            </CardTitle>
            
            {/* תגיות מידע - responsive grid */}
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                <Coins className="w-3 h-3" /> 
                {challenge.points_value} נק'
              </Badge>
              <Badge variant="outline" className="gap-1 whitespace-nowrap">
                <Clock className="w-3 h-3" /> 
                {format(new Date(challenge.end_date), 'dd/MM')}
              </Badge>
              <Badge variant="outline" className="gap-1 whitespace-nowrap">
                <Users className="w-3 h-3" />
                {participations.length}
              </Badge>
            </div>
          </div>
          
          {/* כפתורי מאמן - מותאמים למובייל */}
          {isCoach && (
            <div className="flex items-center gap-2 justify-end lg:ml-4">
              {/* טוגל פעיל/מכובה - compact למובייל */}
              <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2 border text-xs">
                <span className="font-medium text-gray-600 hidden sm:inline">
                  {challenge.is_active ? 'פעיל' : 'מכובה'}
                </span>
                <Switch
                  checked={challenge.is_active}
                  onCheckedChange={handleToggleActive}
                  className="data-[state=checked]:bg-green-600 scale-75 sm:scale-100"
                />
                {challenge.is_active ? (
                  <Power className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                ) : (
                  <PowerOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                )}
              </div>
              
              {/* כפתור עריכה */}
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => onEdit(challenge)}>
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed break-words">{challenge.description}</p>
        
        {/* סטטיסטיקות מהירות למאמן */}
        {isCoach && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{participations.length}</div>
              <div className="text-xs sm:text-sm text-blue-700">משתתפים</div>
            </div>
            <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{completedParticipants}</div>
              <div className="text-xs sm:text-sm text-green-700">הושלם</div>
            </div>
            <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg text-center">
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingApproval}</div>
              <div className="text-xs sm:text-sm text-yellow-700">ממתין</div>
            </div>
            <div className="bg-purple-50 p-2 sm:p-3 rounded-lg text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">{challenge.points_value}</div>
              <div className="text-xs sm:text-sm text-purple-700">נקודות</div>
            </div>
          </div>
        )}

        {/* אזור משתתפים - responsive */}
        {!isCoach && (
          <div className="space-y-3 sm:space-y-4">
            {!userParticipation ? (
              <Button 
                onClick={() => onJoin(challenge.id)} 
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-md"
                disabled={!challenge.is_active}
              >
                <Plus className="w-4 h-4 ml-2" />
                {challenge.is_active ? 'הצטרף לאתגר!' : 'אתגר מושבת'}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">הסטטוס שלך:</span>
                  <Badge className={getStatus(userParticipation).color}>
                    {getStatus(userParticipation).label}
                  </Badge>
                </div>

                {userParticipation.status === 'in_progress' && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">הוכח השלמת האתגר:</Label>
                    <Textarea
                      placeholder="תאר איך השלמת את האתגר..."
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      className="w-full min-h-[80px] text-sm"
                    />
                    <Button 
                      onClick={handleProofSubmit}
                      disabled={!proofText.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 text-sm rounded-lg"
                    >
                      <Send className="w-4 h-4 ml-2" />
                      שלח הוכחה
                    </Button>
                  </div>
                )}

                {userParticipation.proof_submission && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm font-semibold text-blue-800 mb-2 block">ההוכחה שלך:</Label>
                    <p className="text-sm text-blue-700 break-words">{userParticipation.proof_submission}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* אישורי מאמן - responsive */}
        {isCoach && pendingApproval > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">ממתין לאישור שלך:</h4>
            <div className="space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
              {participations
                .filter(p => p.status === 'pending_approval')
                .map(p => {
                  const trainee = trainees.find(t => t.id === p.user_id);
                  return (
                    <div key={p.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-800 text-sm sm:text-base truncate">
                            {trainee?.hebrew_name || trainee?.full_name || 'מתאמן'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {format(new Date(p.created_date), 'dd/MM HH:mm')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs sm:text-sm text-gray-700 break-words leading-relaxed">
                          {p.proof_submission}
                        </p>
                      </div>
                      
                      {/* כפתורי אישור/דחיה - stack במובייל */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                          onClick={() => onApprove(p, true)}
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                          אשר
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                          onClick={() => onApprove(p, false)}
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                          דחה
                        </Button>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}