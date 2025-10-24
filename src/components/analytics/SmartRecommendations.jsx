import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Loader2, TrendingUp, Target, Clock } from "lucide-react";
import { InvokeLLM } from "@/api/integrations";

export default function SmartRecommendations({ logs, user }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRecommendations = async () => {
    setLoading(true);
    setError('');

    // Prepare data for AI analysis
    const weekCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const weekProtein = logs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const mealCount = logs.length;
    const avgCalories = weekCalories / 7;
    const goalCalories = user.daily_calories_goal || 2000;

    const prompt = `
      You are a nutrition AI expert for "Reborn Energy" app. Analyze this user's nutrition data and provide personalized recommendations in Hebrew.
      
      User Data:
      - Goal: ${user.goal}
      - Daily calorie goal: ${goalCalories}
      - This week: ${weekCalories} total calories, ${weekProtein}g protein, ${mealCount} meals logged
      - Daily average: ${avgCalories.toFixed(0)} calories
      
      Please provide 3-4 actionable, personalized recommendations in Hebrew based on this data.
      Focus on practical advice for improving nutrition habits, meal timing, or achieving their goal.
    `;

    try {
      const result = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRecommendations(result.recommendations || []);
    } catch (err) {
      console.error(err);
      setError('שגיאה בייצור המלצות. נסה שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (logs.length > 0) {
      generateRecommendations();
    }
  }, [logs, user]);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return TrendingUp;
      case 'medium': return Target;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      default: return 'text-blue-400 border-blue-400 bg-blue-400/10';
    }
  };

  if (logs.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">צבור עוד נתוני תזונה כדי לקבל המלצות אישיות</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-400/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          המלצות אישיות מ-AI
        </CardTitle>
        <Button
          onClick={generateRecommendations}
          disabled={loading}
          variant="outline"
          className="border-purple-400 text-purple-300 hover:bg-purple-600/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'מייצר המלצות...' : 'חדש המלצות'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-red-300 text-center">{error}</p>
        )}

        {loading && !recommendations && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-300">AI מנתח את הנתונים שלך...</p>
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const Icon = getPriorityIcon(rec.priority);
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2">{rec.title}</h4>
                      <p className="text-sm opacity-90">{rec.description}</p>
                      {rec.category && (
                        <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-white/10">
                          {rec.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}