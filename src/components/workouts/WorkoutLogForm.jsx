
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkoutLogForm({ log, onSubmit, onCancel, selectedDate }) {
  const [formData, setFormData] = useState({
    date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
    exercise_name: '',
    muscle_group: '',
    sets: '',
    reps: '',
    weight: ''
  });

  useEffect(() => {
    if (log) {
      setFormData({
        date: format(new Date(log.date), 'yyyy-MM-dd'),
        exercise_name: log.exercise_name || '',
        muscle_group: log.muscle_group || '',
        sets: log.sets || '',
        reps: log.reps || '',
        weight: log.weight || ''
      });
    } else {
        setFormData({
            date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
            exercise_name: '',
            muscle_group: '',
            sets: '',
            reps: '',
            weight: ''
        });
    }
  }, [log, selectedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.muscle_group) {
        alert("יש לבחור קבוצת שרירים.");
        return;
    }
    const dataToSubmit = {
        ...formData,
        sets: formData.sets ? parseInt(formData.sets, 10) : null,
        reps: formData.reps ? parseInt(formData.reps, 10) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-400">
          <Dumbbell />
          {log ? 'עריכת אימון' : 'תיעוד אימון חדש'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="date">תאריך</Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="bg-gray-900/50 border-gray-700"
                required
                disabled 
              />
            </div>
            <div>
              <Label htmlFor="exercise_name">שם התרגיל</Label>
              <Input
                type="text"
                id="exercise_name"
                name="exercise_name"
                placeholder="לחיצת חזה"
                value={formData.exercise_name}
                onChange={handleChange}
                className="bg-gray-900/50 border-gray-700"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="muscle_group">קבוצת שרירים</Label>
            <Select
              onValueChange={(value) => handleSelectChange('muscle_group', value)}
              value={formData.muscle_group}
              required
            >
              <SelectTrigger id="muscle_group" className="bg-gray-900/50 border-gray-700">
                <SelectValue placeholder="בחר קבוצת שרירים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chest">חזה</SelectItem>
                <SelectItem value="Back">גב</SelectItem>
                <SelectItem value="Legs">רגליים</SelectItem>
                <SelectItem value="Shoulders">כתפיים</SelectItem>
                <SelectItem value="Biceps">יד קדמית</SelectItem>
                <SelectItem value="Triceps">יד אחורית</SelectItem>
                <SelectItem value="Abs">בטן</SelectItem>
                <SelectItem value="Cardio">אירובי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="sets">סטים</Label>
              <Input
                type="number"
                id="sets"
                name="sets"
                placeholder="3"
                value={formData.sets}
                onChange={handleChange}
                className="bg-gray-900/50 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="reps">חזרות</Label>
              <Input
                type="number"
                id="reps"
                name="reps"
                placeholder="10"
                value={formData.reps}
                onChange={handleChange}
                className="bg-gray-900/50 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="weight">משקל (ק"ג)</Label>
              <Input
                type="number"
                id="weight"
                name="weight"
                placeholder="60"
                value={formData.weight}
                onChange={handleChange}
                step="0.5"
                className="bg-gray-900/50 border-gray-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="border-gray-500 text-gray-300 hover:bg-gray-700">
              ביטול
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {log ? 'עדכן אימון' : 'שמור אימון'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
