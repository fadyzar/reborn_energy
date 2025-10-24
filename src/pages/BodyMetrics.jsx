import React, { useState, useEffect, useCallback, useRef } from "react";
import { User } from "@/api/entities";
import { BodyMetrics } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createCoachNotification } from '@/components/lib/notifications';

import MetricsForm from "../components/metrics/MetricsForm";
import MetricsList from "../components/metrics/MetricsList";
import ProgressChart from "../components/metrics/ProgressChart";
import StatsOverview from "../components/metrics/StatsOverview";

export default function BodyMetricsPage() {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [loading, setLoading] = useState(true);

  const formRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const loadMetrics = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await BodyMetrics.filter({ 
        user_id: user.id 
      }, '-date', 50);
      setMetrics(data);
    } catch (error) {
      console.error("Error loading metrics:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadMetrics();
    }
  }, [user, loadMetrics]);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showForm]);

  const handleSubmit = async (metricData) => {
    try {
      const dataToSave = {
        ...metricData,
        user_id: user.id
      };
      
      let savedMetric;
      if (editingMetric) {
        savedMetric = await BodyMetrics.update(editingMetric.id, dataToSave);
      } else {
        savedMetric = await BodyMetrics.create(dataToSave);
        await createCoachNotification(
          user,
          "עדכון מדדי גוף",
          `${user.hebrew_name || user.full_name} עדכן משקל ל-${savedMetric.weight} ק"ג.`,
          "new_metric"
        );
      }

      setShowForm(false);
      setEditingMetric(null);
      loadMetrics();
    } catch (error) {
      console.error("Error saving metric:", error);
    }
  };

  const handleEdit = (metric) => {
    setEditingMetric(metric);
    setShowForm(true);
  };

  const handleDelete = async (metricId) => {
    try {
      await BodyMetrics.delete(metricId);
      loadMetrics();
    } catch (error) {
      console.error("Error deleting metric:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">יש להתחבר למערכת</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">מדדי גוף</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              מעקב אחר משקל, מידות והתקדמות
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:shadow-lg transition-all duration-200 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף מדידה
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <StatsOverview metrics={metrics} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            {showForm && (
              <div ref={formRef}>
                <MetricsForm
                  metric={editingMetric}
                  onSubmit={handleSubmit}
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
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}