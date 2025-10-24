
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Dumbbell, Zap, Heart, Shield, Target, Footprints } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const attributeMap = {
    upper_body_xp: { name: "כוח עליון", icon: Dumbbell, color: "text-red-400" },
    lower_body_xp: { name: "כוח תחתון", icon: Footprints, color: "text-blue-400" },
    core_xp: { name: "כוח ליבה", icon: Target, color: "text-yellow-400" },
    endurance_xp: { name: "סיבולת", icon: Zap, color: "text-teal-400" },
    discipline_xp: { name: "משמעת", icon: Shield, color: "text-indigo-400" },
    vitality_xp: { name: "חיוניות", icon: Heart, color: "text-green-400" }
};

const XpGainBadge = ({ type, value }) => {
    const attribute = attributeMap[type];
    if (!attribute) return null;
    const Icon = attribute.icon;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge variant="outline" className={`flex items-center gap-1 border-gray-600 ${attribute.color}`}>
                    <Icon className="w-3 h-3" />
                    +{value}
                </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white border-purple-500">
                <p>+{value} XP ל{attribute.name}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export default function WorkoutLogList({ logs, onEdit, onDelete }) {
  if (logs.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700/50 text-white">
        <CardContent className="p-8 text-center text-gray-400">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h3 className="text-xl font-bold text-white">אין אימונים מתועדים</h3>
          <p>התחל לתעד את האימונים שלך כדי לראות אותם כאן.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <TooltipProvider>
        {logs.map(log => (
          <Card key={log.id} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm text-white transform hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                  <p className="font-bold text-purple-300 text-lg">{log.exercise_name}</p>
                  <p className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded">{log.muscle_group}</p>
                  {log.xp_awarded > 0 && <Badge className="bg-yellow-500/80 text-white">+{log.xp_awarded} XP</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300 mb-3">
                  <p>
                    <span className="font-semibold text-gray-400">תאריך: </span>
                    {format(new Date(log.date), 'dd/MM/yyyy')}
                  </p>
                  {log.sets && <p><span className="font-semibold text-gray-400">סטים: </span>{log.sets}</p>}
                  {log.reps && <p><span className="font-semibold text-gray-400">חזרות: </span>{log.reps}</p>}
                  {log.weight && <p><span className="font-semibold text-gray-400">משקל: </span>{log.weight} ק"ג</p>}
                </div>
                {log.xp_gains && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-gray-700 pt-3">
                      {Object.entries(log.xp_gains).map(([type, value]) => 
                          value > 0 && <XpGainBadge key={type} type={type} value={value} />
                      )}
                  </div>
                )}
              </div>
              <div className="flex gap-2 self-start sm:self-center">
                <Button variant="ghost" size="icon" onClick={() => onEdit(log)} className="text-blue-400 hover:text-blue-300">
                  <Edit className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(log.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </TooltipProvider>
    </div>
  );
}
