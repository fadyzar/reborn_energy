
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar as CalendarIcon, Save, Lightbulb, Star, Sparkles, Users } from "lucide-react";

import AiChallengeGenerator from './AiChallengeGenerator';

const challengeTemplates = [
  {
    id: 'pushups',
    name: '💪 אתגר 100 שכיבות סמיכה יומי',
    title: "אתגר 100 שכיבות סמיכה יומי",
    description: "בצעו 100 שכיבות סמיכה בכל יום, במשך שבוע שלם! ניתן לחלק את הכמות לאורך היום. המטרה: עקביות וכוח. שלחו סרטון קצר או תמונה כהוכחה.",
    points_value: 75,
    duration: 7
  },
  {
    id: 'beach_run',
    name: '🏃‍♂️ מפגש ריצה קהילתי בחוף',
    title: "מפגש ריצה קהילתי בחוף הים",
    description: "בואו ניפגש כולנו לריצת 10 ק\"מ משותפת בחוף הים! זה יהיה ביום שישי בשעה 07:00. הזדמנות מעולה לגיבוש, אוויר טוב ומוטיבציה משותפת. שלחו תמונה מהמקום כהוכחת הגעה.",
    points_value: 50,
    duration: 3
  },
  {
    id: 'double_workout',
    name: '🔥 אתגר שני אימונים ביום',
    title: "אתגר שני אימונים ביום",
    description: "לאמיצים בלבד! השלימו שני אימונים ביום (למשל: כוח בבוקר + אירובי בערב) במשך 3 ימים השבוע. רשמו מה היו האימונים ובאיזה שעות כהוכחה.",
    points_value: 100,
    duration: 7
  },
  {
    id: 'water_challenge',
    name: '💧 אתגר שתיית מים',
    title: "אתגר שתיית 3 ליטר מים ביום",
    description: "שתו לפחות 3 ליטר מים בכל יום במשך 5 ימים. עקבו אחר הכמות ושלחו תמונה של הבקבוקים הריקים או אפליקציית מעקב מים כהוכחה.",
    points_value: 40,
    duration: 5
  },
  {
    id: 'steps_challenge',
    name: '👟 אתגר 10,000 צעדים',
    title: "אתגר 10,000 צעדים ביום",
    description: "הגיעו ל-10,000 צעדים בכל יום במשך שבוע שלם. השתמשו באפליקציות ספירת צעדים בטלפון או בשעון חכם. שלחו צילום מסך של הסטטיסטיקה כהוכחה.",
    points_value: 60,
    duration: 7
  },
  {
    id: 'healthy_meals',
    name: '🥗 אתגר ארוחות בריאות',
    title: "אתגר 3 ארוחות בריאות ביום",
    description: "הכינו 3 ארוחות בריאות ומאוזנות בכל יום במשך 5 ימים. כל ארוחה צריכה לכלול ירקות, חלבון ופחמימות מורכבות. שלחו תמונות של הארוחות כהוכחה.",
    points_value: 80,
    duration: 5
  }
];

export default function ChallengeForm({ open, onClose, onSave, challenge, groups }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_value: 10,
    start_date: new Date(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
    group_id: '',
  });
  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => {
    if (challenge) {
      setFormData({
        title: challenge.title,
        description: challenge.description,
        points_value: challenge.points_value,
        start_date: new Date(challenge.start_date),
        end_date: new Date(challenge.end_date),
        group_id: challenge.group_id || '',
      });
      setActiveTab('create');
    } else {
      setFormData({
        title: '',
        description: '',
        points_value: 10,
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
        group_id: groups && groups.length > 0 ? groups[0].id : '',
      });
    }
  }, [challenge, open, groups]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (template) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + template.duration);
    
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      points_value: template.points_value,
      start_date: startDate,
      end_date: endDate,
    }));
    setActiveTab('create');
  };

  const handleAiChallengeSelect = (aiChallenge) => {
    setFormData(prev => ({ ...prev, ...aiChallenge }));
    setActiveTab('create');
  };

  const handleSaveClick = () => {
    if (!formData.group_id) {
        alert("יש לבחור חוג עבור האתגר.");
        return;
    }
    const challengeData = {
      ...formData,
      challenge_type: 'custom',
      goal_type: 'custom',
      target_value: 1,
      start_date: format(formData.start_date, 'yyyy-MM-dd'),
      end_date: format(formData.end_date, 'yyyy-MM-dd'),
    };
    onSave(challengeData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {challenge ? 'עריכת אתגר' : 'יצירת אתגר חדש'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI חכם
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              דוגמאות מוכנות
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              יצירה מותאמת
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-6">
            <AiChallengeGenerator onChallengeSelect={handleAiChallengeSelect} />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">בחר אתגר מוכן:</h3>
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {challengeTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {template.description.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-100 text-green-800">
                            {template.points_value} נקודות
                          </Badge>
                          <Badge variant="outline">
                            {template.duration} ימים
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group">שיוך לחוג</Label>
                <Select
                  value={formData.group_id}
                  onValueChange={(value) => handleInputChange('group_id', value)}
                  disabled={!groups || groups.length === 0}
                >
                  <SelectTrigger>
                    <Users className="w-4 h-4 ml-2" />
                    <SelectValue placeholder={!groups || groups.length === 0 ? "אין חוגים זמינים" : "בחר חוג"} />
                  </SelectTrigger>
                  <SelectContent>
                    {groups && groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">שם האתגר</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="לדוגמה: אתגר 100 שכיבות סמיכה ביום"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">תיאור האתגר</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="פרט על האתגר, איך משתתפים, ומה נחשב כהוכחת השלמה..."
                  className="h-24"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="points">נקודות לזוכה</Label>
                <Input 
                  id="points" 
                  type="number" 
                  value={formData.points_value} 
                  onChange={e => handleInputChange('points_value', parseInt(e.target.value, 10))}
                  min="1"
                  max="200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>תאריך התחלה</Label>
                   <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {format(formData.start_date, 'PPP', { locale: he })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar 
                          mode="single" 
                          selected={formData.start_date} 
                          onSelect={(date) => handleInputChange('start_date', date)} 
                          initialFocus 
                        />
                      </PopoverContent>
                    </Popover>
                </div>
                
                 <div className="space-y-2">
                  <Label>תאריך סיום</Label>
                   <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {format(formData.end_date, 'PPP', { locale: he })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar 
                          mode="single" 
                          selected={formData.end_date} 
                          onSelect={(date) => handleInputChange('end_date', date)} 
                          initialFocus 
                        />
                      </PopoverContent>
                    </Popover>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {activeTab === 'create' && (
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>ביטול</Button>
            <Button 
              onClick={handleSaveClick}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <Save className="w-4 h-4 ml-2" /> 
              {challenge ? 'עדכן אתגר' : 'צור אתגר'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
