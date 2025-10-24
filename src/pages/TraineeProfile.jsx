
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { User } from "@/api/entities";
import { NutritionLog } from "@/api/entities";
import { BodyMetrics } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Plus, Scale as ScaleIcon, Droplets, Target as TargetIcon } from "lucide-react";
import { createPageUrl } from "@/utils";

import MetricsForm from "../components/metrics/MetricsForm";
import ProgressChart from "../components/metrics/ProgressChart";
import MetricsList from "../components/metrics/MetricsList";
import StatsOverview from "../components/metrics/StatsOverview";

export default function TraineeProfile() {
  const [trainee, setTrainee] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const traineeId = params.get('id');

  const formRef = useRef(null);

  const loadTraineeData = useCallback(async () => {
    if (!traineeId) {
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      // שינוי מ-User.get ל-User.filter כדי למנוע שגיאת 500
      const traineeResults = await User.filter({ id: traineeId });
      
      if (traineeResults && traineeResults.length > 0) {
        const traineeData = traineeResults[0];
        setTrainee(traineeData);
      
        const metricsData = await BodyMetrics.filter({ user_id: traineeId }, '-date', 100);
        setMetrics(metricsData);
        
        const logsData = await NutritionLog.filter({ user_id: traineeId }, '-date', 100);
        setLogs(logsData);
      } else {
        console.error("Trainee not found or permission denied");
        setTrainee(null); // Explicitly set trainee to null if not found
      }
      
    } catch (error) {
      console.error("Failed to load trainee data:", error);
      setTrainee(null); // Explicitly set trainee to null on error
    }
    setLoading(false);
  }, [traineeId]);

  useEffect(() => {
    loadTraineeData();
  }, [loadTraineeData]);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showForm]);

  const handleSubmitMetric = useCallback(async (metricData) => {
    try {
      const dataToSave = {
        ...metricData,
        user_id: traineeId
      };

      if (editingMetric) {
        await BodyMetrics.update(editingMetric.id, dataToSave);
      } else {
        await BodyMetrics.create(dataToSave);
      }

      setShowForm(false);
      setEditingMetric(null);
      loadTraineeData();
    } catch (error) {
      console.error("Error saving metric:", error);
    }
  }, [editingMetric, traineeId, loadTraineeData]);

  const handleEditMetric = (metric) => {
    setEditingMetric(metric);
    setShowForm(true);
  };

  const handleDeleteMetric = useCallback(async (metricId) => {
    try {
      await BodyMetrics.delete(metricId);
      loadTraineeData();
    } catch (error) {
      console.error("Error deleting metric:", error);
    }
  }, [loadTraineeData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!trainee) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl">לא נמצא מתאמן</h2>
        <Link to={createPageUrl('MyTrainees')}>
          <Button>חזור לרשימת המתאמנים</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl bg-blue-500 text-white">
                {(trainee.hebrew_name || trainee.full_name || 'M')[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{trainee.hebrew_name || trainee.full_name}</h1>
              <p className="text-gray-600">{trainee.goal || 'ללא מטרה מוגדרת'}</p>
            </div>
          </div>
          <Link to={createPageUrl('MyTrainees')}>
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה לכל המתאמנים
            </Button>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-6">
            <StatsOverview metrics={metrics} />
             <Card>
                <CardHeader>
                  <CardTitle>פעולות מהירות</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowForm(!showForm)}
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500"
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    {showForm ? 'סגור טופס' : 'הוסף מדידה חדשה'}
                  </Button>
                </CardContent>
              </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {showForm && (
              <div ref={formRef}>
                <MetricsForm
                  metric={editingMetric}
                  onSubmit={handleSubmitMetric}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingMetric(null);
                  }}
                />
              </div>
            )}
            
            <ProgressChart metrics={metrics} />
            
            <MetricsList 
              metrics={metrics}
              onEdit={handleEditMetric}
              onDelete={handleDeleteMetric}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
