import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, Scale, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const MetricRow = ({ metric, onEdit, onDelete }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 flex-1">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <div>
          <p className="text-xs text-gray-500">תאריך</p>
          <p className="font-medium text-gray-800">{format(new Date(metric.date), 'dd/MM/yy')}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Scale className="w-4 h-4 text-gray-500" />
        <div>
          <p className="text-xs text-gray-500">משקל</p>
          <p className="font-medium text-gray-800">{metric.weight} ק"ג</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Percent className="w-4 h-4 text-gray-500" />
        <div>
          <p className="text-xs text-gray-500">אחוז שומן</p>
          <p className="font-medium text-gray-800">{metric.body_fat_percentage ? `${metric.body_fat_percentage}%` : '---'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-500">היקפים</p>
        <p className="font-medium text-gray-800">{metric.waist_circumference ? `${metric.waist_circumference} ס"מ` : '---'}</p>
      </div>
    </div>
    <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0">
      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50" onClick={() => onEdit(metric)}>
        <Edit className="w-4 h-4 text-blue-600" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => onDelete(metric.id)}>
        <Trash2 className="w-4 h-4 text-red-600" />
      </Button>
    </div>
  </div>
);

export default function MetricsList({ metrics, onEdit, onDelete }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">היסטוריית מדידות</CardTitle>
      </CardHeader>
      <CardContent>
        {metrics.length > 0 ? (
          <div className="space-y-3">
            {metrics.map((metric) => (
              <MetricRow key={metric.id} metric={metric} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">אין עדיין מדידות להצגה.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}