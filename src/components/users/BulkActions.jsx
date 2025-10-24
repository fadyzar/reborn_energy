import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Mail, MessageSquare, Target, UserCheck, Users, Send } from "lucide-react";

export default function BulkActions({ selectedUsers, onAction }) {
  const actions = [
    {
      id: 'send_message',
      label: 'שלח הודעה קבוצתית',
      icon: MessageSquare,
      description: 'שלח הודעה לכל המתאמנים הנבחרים'
    },
    {
      id: 'send_email',
      label: 'שלח אימייל',
      icon: Mail,
      description: 'שלח אימייל עדכון או תזכורת'
    },
    {
      id: 'update_goals',
      label: 'עדכן יעדים',
      icon: Target,
      description: 'עדכן יעדי תזונה לקבוצה'
    },
    {
      id: 'mark_checked',
      label: 'סמן כנבדק',
      icon: UserCheck,
      description: 'סמן את כל הנבחרים כנבדקו השבוע'
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Users className="w-4 h-4 ml-2" />
          פעולות קבוצתיות
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div key={action.id}>
              <DropdownMenuItem 
                onClick={() => onAction(action.id)}
                className="cursor-pointer p-3"
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-4 h-4 mt-0.5 text-blue-600" />
                  <div>
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </div>
              </DropdownMenuItem>
              {index < actions.length - 1 && <DropdownMenuSeparator />}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}