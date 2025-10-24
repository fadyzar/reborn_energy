import { useMemo } from 'react';
import { differenceInDays } from 'date-fns';

export default function useTrialStatus(user) {
  return useMemo(() => {
    if (!user) {
      return { hasAccess: false, isTrialActive: false, daysLeft: 0 };
    }

    // Admin always has access
    if (user.role === 'admin') {
      return { hasAccess: true, isTrialActive: false, daysLeft: 0 };
    }

    // Pro subscribers always have access
    if (user.subscription_plan === 'pro') {
      return { hasAccess: true, isTrialActive: false, daysLeft: 0 };
    }

    // Check trial period
    if (user.trial_started_date) {
      const trialStart = new Date(user.trial_started_date);
      const trialEnd = new Date(trialStart.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days
      const now = new Date();
      
      if (now < trialEnd) {
        const daysLeft = Math.ceil(differenceInDays(trialEnd, now));
        return { hasAccess: true, isTrialActive: true, daysLeft };
      }
    }

    // No trial or expired trial, no pro subscription
    return { hasAccess: false, isTrialActive: false, daysLeft: 0 };
  }, [user]);
}