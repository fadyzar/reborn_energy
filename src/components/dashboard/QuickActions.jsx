import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Camera, Scale, Target } from "lucide-react";

export default function QuickActions() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold">פעולות מהירות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link to={createPageUrl("DailyTracking")} className="block">
          <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
            <Plus className="w-4 h-4 ml-2" />
            הוסף ארוחה
          </Button>
        </Link>
        
        <Link to={createPageUrl("BodyMetrics")} className="block">
          <Button variant="outline" className="w-full justify-start border-green-200 hover:bg-green-50">
            <Scale className="w-4 h-4 ml-2" />
            רשום משקל
          </Button>
        </Link>

        <Link to={createPageUrl("Calendar")} className="block">
          <Button variant="outline" className="w-full justify-start border-purple-200 hover:bg-purple-50">
            <Target className="w-4 h-4 ml-2" />
            צפה בהתקדמות
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}