
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { WorkoutLog } from '@/api/entities';
import { UserAvatar } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Dumbbell } from 'lucide-react';
import WorkoutLogForm from '../components/workouts/WorkoutLogForm';
import WorkoutLogList from '../components/workouts/WorkoutLogList';
import WorkoutCalendar from '../components/workouts/WorkoutCalendar';
import { toast } from 'sonner';
import { startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns';

// Function to calculate level from XP
const xpToLevel = (xp) => Math.floor(Math.pow(xp / 100, 0.7)) + 1;

// Function to calculate XP for a workout
const calculateXpForLog = async (log, userId, editingLogId = null) => {
    let upperBodyXpGain = 0;
    let lowerBodyXpGain = 0;
    let coreXpGain = 0;
    let enduranceXpGain = 0;
    let disciplineXpGain = 0;
    let vitalityXpGain = 5; // Base vitality for any workout

    // 1. Calculate main attribute XP
    switch(log.muscle_group) {
        case 'Cardio':
            enduranceXpGain = 50; // Cardio gives base endurance
            break;
        case 'Legs':
            lowerBodyXpGain = 50;
            break;
        case 'Abs':
            coreXpGain = 50;
            break;
        case 'Chest': case 'Back': case 'Shoulders': case 'Biceps': case 'Triceps':
            upperBodyXpGain = 50;
            break;
        default: break;
    }

    // 2. Calculate Endurance XP from weight and reps
    if (log.weight && log.reps) {
        enduranceXpGain += Math.round(log.weight * log.reps * 0.1);
    }
    
    // 3. Calculate Discipline XP - Award 20 XP on the 3rd workout of the week
    const now = new Date();
    const startOfThisWeek = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
    const endOfThisWeek = endOfWeek(now, { weekStartsOn: 0 }); // Saturday
    
    // Fetch all logs for the current user to check for weekly workouts
    const allUserLogs = await WorkoutLog.filter({ user_id: userId });
    
    // Exclude the log being edited from the count if it exists
    const logsForWeeklyCount = editingLogId 
      ? allUserLogs.filter(l => l.id !== editingLogId)
      : allUserLogs;
    
    const workoutsThisWeekCount = logsForWeeklyCount.filter(l => 
        isWithinInterval(new Date(l.date), { start: startOfThisWeek, end: endOfThisWeek })
    ).length;

    // This logic now works for both creation and editing.
    // If we're creating, we check if there are 2 logs already.
    // If we're editing, we check if there are 2 *other* logs.
    if (workoutsThisWeekCount === 2) {
        disciplineXpGain = 20; 
        if (!editingLogId) { // Only show toast on new log creation
             toast.info("💪 הישג משמעת! 3 אימונים השבוע!");
        }
    }
    
    const gains = {
        upper_body_xp: upperBodyXpGain,
        lower_body_xp: lowerBodyXpGain,
        core_xp: coreXpGain,
        endurance_xp: enduranceXpGain,
        discipline_xp: disciplineXpGain,
        vitality_xp: vitalityXpGain
    };

    const totalXp = Object.values(gains).reduce((sum, value) => sum + value, 0);

    return { totalXp, gains };
}

export default function WorkoutLogPage() {
  const [user, setUser] = useState(null);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadInitialData = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const logs = await WorkoutLog.filter({ user_id: currentUser.id }, '-date', 50);
      setWorkoutLogs(logs);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("שגיאה בטעינת הנתונים.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  const handleFormSubmit = async (logData) => {
    if (!user) {
        toast.error("שגיאה: משתמש לא מזוהה.");
        return;
    }
    
    try {
      const userAvatars = await UserAvatar.filter({ user_id: user.id });
      if (userAvatars.length === 0) {
        toast.error("לא נמצא אוואטר. יש לבחור אוואטר בזירת ההתעלות.");
        return;
      }
      const currentAvatar = userAvatars[0];
      
      // Ensure the log date matches the selected calendar date
      const dataToSubmit = {
        ...logData,
        date: format(selectedDate, 'yyyy-MM-dd')
      };
      
      if (editingLog) {
        // --- FULL EDIT LOGIC ---
        
        // 1. Get old XP values from the log being edited
        const oldGains = editingLog.xp_gains || {};
        const oldTotalXp = editingLog.xp_awarded || 0;

        // 2. Calculate new XP values based on the updated data
        const { totalXp: newTotalXp, gains: newGains } = await calculateXpForLog(dataToSubmit, user.id, editingLog.id);
        
        // 3. Prepare avatar update data by removing old XP and adding new XP
        const avatarUpdateData = { ...currentAvatar };
        
        // Subtract old values
        avatarUpdateData.total_xp = (avatarUpdateData.total_xp || 0) - oldTotalXp;
        for (const [key, value] of Object.entries(oldGains)) {
            if (value > 0 && avatarUpdateData.hasOwnProperty(key)) {
                avatarUpdateData[key] = Math.max(0, (avatarUpdateData[key] || 0) - value);
            }
        }

        // Add new values
        avatarUpdateData.total_xp += newTotalXp;
        for (const [key, value] of Object.entries(newGains)) {
            if (value > 0) {
                avatarUpdateData[key] = (avatarUpdateData[key] || 0) + value;
            }
        }
        
        // Ensure total_xp doesn't go below 0 after subtractions
        avatarUpdateData.total_xp = Math.max(0, avatarUpdateData.total_xp);

        // 4. Recalculate level
        const oldLevel = currentAvatar.level;
        avatarUpdateData.level = xpToLevel(avatarUpdateData.total_xp);

        // 5. Update the WorkoutLog with new data and new XP values
        await WorkoutLog.update(editingLog.id, { 
            ...dataToSubmit, 
            xp_awarded: newTotalXp,
            xp_gains: newGains 
        });

        // 6. Update the UserAvatar with the final calculated XP
        await UserAvatar.update(currentAvatar.id, avatarUpdateData);
        
        toast.success("✅ האימון עודכן וה-XP חושב מחדש!");
        const newLevel = avatarUpdateData.level;
        if (newLevel > oldLevel) {
            toast.success(`🚀 עליית רמה! אתה כעת רמה ${newLevel}!`);
        } else if (newLevel < oldLevel) {
            toast.warn(`📉 ירידת רמה! אתה כעת רמה ${newLevel}.`);
        }

      } else {
        // --- CREATE NEW LOGIC ---
        const { totalXp: newXpAwarded, gains } = await calculateXpForLog(dataToSubmit, user.id);

        // 1. Create the log with xp_awarded and xp_gains for display
        await WorkoutLog.create({ 
          ...dataToSubmit, 
          user_id: user.id, 
          xp_awarded: newXpAwarded,
          xp_gains: gains // Store the detailed gains
        });

        // 2. Update Avatar XP by adding the new gains
        const avatarUpdateData = {
          total_xp: (currentAvatar.total_xp || 0) + newXpAwarded,
        };

        for (const [key, value] of Object.entries(gains)) {
          if (value > 0) {
            avatarUpdateData[key] = (currentAvatar[key] || 0) + value;
          }
        }
        
        const oldLevel = currentAvatar.level;
        // Recalculate level based on the new total_xp
        avatarUpdateData.level = xpToLevel(avatarUpdateData.total_xp);
        
        await UserAvatar.update(currentAvatar.id, avatarUpdateData);
        
        const newLevel = avatarUpdateData.level;

        toast.success(`🎉 +${newXpAwarded} XP הושג!`);
        if (newLevel > oldLevel) {
            toast.success(`🚀 עליית רמה! אתה כעת רמה ${newLevel}!`);
        }
      }

      // Refresh UI for both cases
      setShowForm(false);
      setEditingLog(null);
      loadInitialData();
      
    } catch (error) {
      console.error("Error submitting workout log:", error);
      toast.error("שגיאה בשמירת האימון.");
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setShowForm(true);
  };
  
  const handleDelete = async (logId) => {
      if(confirm('האם אתה בטוח שברצונך למחוק את התיעוד? פעולה זו תסיר גם את ה-XP שהשגת.')) {
          try {
              const logToDelete = workoutLogs.find(log => log.id === logId);
              if (!logToDelete) {
                  toast.error("תיעוד האימון לא נמצא.");
                  return;
              }

              if (!user) {
                  toast.error("משתמש לא מזוהה.");
                  return;
              }

              const userAvatars = await UserAvatar.filter({ user_id: user.id });
              if (userAvatars.length > 0) {
                const currentAvatar = userAvatars[0];
                const xpToRemove = logToDelete.xp_awarded || 0; // Get the XP that was specifically awarded for this log
                
                const newTotalXp = Math.max(0, (currentAvatar.total_xp || 0) - xpToRemove); // Ensure XP doesn't go below 0
                const newLevel = xpToLevel(newTotalXp);

                // This is a simplified removal. A more complex system would need to know which
                // attributes were credited to then decrement them. For this task, we only adjust total XP.
                await UserAvatar.update(currentAvatar.id, {
                    total_xp: newTotalXp,
                    level: newLevel
                });
                
                toast.info(`-${xpToRemove} XP הוסר.`);
              } else {
                  toast.warn("לא נמצא אוואטר למשתמש, לא ניתן להסיר XP.");
              }

              await WorkoutLog.delete(logId);
              toast.success('האימון נמחק בהצלחה');
              loadInitialData();
          } catch(error) {
              console.error("Error deleting log:", error);
              toast.error("שגיאה במחיקת האימון.");
          }
      }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  // Filter logs for the selected date
  const filteredLogsForSelectedDate = workoutLogs.filter(log => 
    format(new Date(log.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              תיעוד אימונים
            </h1>
            <p className="text-gray-400 mt-2">תעד אימונים, צבור XP, והתחזק.</p>
          </div>
          <Button 
            onClick={() => {
              setEditingLog(null);
              setShowForm(!showForm);
            }}
            className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 ml-2" />
            תעד אימון חדש
          </Button>
        </div>

        {/* New Calendar Component */}
        <div className="mb-8">
          <WorkoutCalendar 
            logs={workoutLogs}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </div>

        {showForm && (
          <div className="mb-8">
            <WorkoutLogForm
              log={editingLog}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {/* Header for the list of logs for the selected day */}
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-300">
                אימונים מתאריך: {format(selectedDate, 'dd/MM/yyyy')}
            </h2>
        </div>

        <WorkoutLogList logs={filteredLogsForSelectedDate} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}
