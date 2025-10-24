import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserX } from 'lucide-react';

export default function NoAvatars() {
  return (
    <Card className="bg-gray-800/50 border-gray-700/50 mt-8">
      <CardContent className="p-8 text-center text-gray-400">
        <UserX className="w-16 h-16 mx-auto mb-4 text-purple-500" />
        <h3 className="text-2xl font-bold text-white mb-2">לא נמצאו אוואטרים</h3>
        <p>נראה שרשימת האוואטרים ריקה. נסה לרענן את הדף או להוסיף את נתוני האוואטרים באופן ידני.</p>
      </CardContent>
    </Card>
  );
}