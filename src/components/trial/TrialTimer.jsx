
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Star, Zap } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes, format } from 'date-fns';
import { he } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function TrialTimer({ user, onTrialExpired }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.trial_started_date) return;

    const calculateTimeLeft = () => {
      const trialStart = new Date(user.trial_started_date);
      const trialEnd = new Date(trialStart.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days
      const now = new Date();

      if (now >= trialEnd) {
        setIsExpired(true);
        setTimeLeft(null);
        if (onTrialExpired) onTrialExpired();
        return;
      }

      const daysLeft = differenceInDays(trialEnd, now);
      const hoursLeft = differenceInHours(trialEnd, now) % 24;
      const minutesLeft = differenceInMinutes(trialEnd, now) % 60;

      setTimeLeft({
        days: daysLeft,
        hours: hoursLeft,
        minutes: minutesLeft,
        total: differenceInMinutes(trialEnd, now)
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user, onTrialExpired]);

  if (!user || user.subscription_plan === 'pro' || !user.trial_started_date || user.role === 'admin') {
    return null;
  }

  if (isExpired) {
    return (
      <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-red-400 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="font-bold">תקופת הניסיון הסתיימה! 🕰️</p>
                <p className="text-sm opacity-90">שדרג עכשיו כדי להמשיך ליהנות מהפיצ'רים המתקדמים</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate(createPageUrl('UpgradePlan'))}
              className="bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-500"
            >
              <Star className="w-4 h-4 mr-2" />
              שדרג עכשיו
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!timeLeft) return null;

  const isUrgent = timeLeft.total < 60 * 24; // Less than 24 hours
  const isWarning = timeLeft.total < 60 * 24 * 3; // Less than 3 days

  return (
    <Card className={`mb-4 ${
      isUrgent ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white border-red-400' :
      isWarning ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-orange-400' :
      'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold">תקופת ניסיון חינמית!</p>
                <Badge className="bg-white/20 text-white border-white/30">
                  {timeLeft.days > 0 ? `${timeLeft.days} ימים` : 
                   timeLeft.hours > 0 ? `${timeLeft.hours} שעות` : 
                   `${timeLeft.minutes} דקות`} נשארו
                </Badge>
              </div>
              <p className="text-sm opacity-90">
                {timeLeft.days > 0 
                  ? `נשארו לך ${timeLeft.days} ימים ו-${timeLeft.hours} שעות לנסות את כל הפיצ'רים בחינם!`
                  : timeLeft.hours > 0
                  ? `נשארו לך ${timeLeft.hours} שעות ו-${timeLeft.minutes} דקות לנסות הכל בחינם!`
                  : `נשארו לך ${timeLeft.minutes} דקות לפני תום תקופת הניסיון!`
                }
              </p>
            </div>
          </div>
          
          {(isUrgent || isWarning) && (
            <Button 
              onClick={() => navigate(createPageUrl('UpgradePlan'))}
              className={`${
                isUrgent ? 'bg-yellow-400 text-slate-900' : 'bg-white text-orange-600'
              } font-bold hover:scale-105 transition-transform`}
            >
              <Star className="w-4 h-4 mr-2" />
              שדרג עכשיו
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
