import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addDays, subDays, isToday as isTodayDateFns } from "date-fns";
import { he } from "date-fns/locale";

export default function DaySelector({ selectedDate, onDateChange }) {
  const goToPreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = isTodayDateFns(selectedDate);

  return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            בחר תאריך
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousDay}
              className="hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <p className="font-semibold">
                {format(selectedDate, "dd/MM/yyyy")}
              </p>
              <p className="text-sm text-gray-500">
                {format(selectedDate, "EEEE", { locale: he })}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextDay}
              className="hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
          
          {!isToday && (
            <Button
              variant="outline"
              onClick={goToToday}
              className="w-full"
            >
              חזור להיום
            </Button>
          )}
        </CardContent>
      </Card>
  );
}