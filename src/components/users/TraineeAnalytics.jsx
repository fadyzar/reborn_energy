
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // This import is not used in the new component logic, but kept for consistency if other parts of the original file used it.
import { Loader2, Brain, Sparkles } from 'lucide-react'; // Star, AlertTriangle, TrendingUp are removed as they are not used with the new analysis structure.
import { InvokeLLM } from '@/api/integrations';
import { format, subDays, startOfWeek } from 'date-fns'; // Added startOfWeek

export default function TraineeAnalytics({ trainees, nutritionLogs }) {
    // Replaced 'insights' state with 'analysis'
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Changed initial error state from '' to null

    // Refactored 'generateInsights' into 'getAnalysis' and wrapped it in useCallback
    const getAnalysis = useCallback(async () => {
        // Early exit if no trainees or nutrition logs are provided
        if (trainees.length === 0 || nutritionLogs.length === 0) {
            setAnalysis(null); // Clear any previous analysis
            setLoading(false); // Ensure loading is off
            return;
        }

        setLoading(true);
        setError(null); // Reset error state

        const today = new Date();
        // Determine the start of the current week (Sunday by default in date-fns)
        const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 }); // Sunday

        // Identify trainees who have logged any nutrition data this week
        const activeTrainees = trainees.filter(t =>
            nutritionLogs.some(log => log.user_id === t.id && new Date(log.date) >= startOfWeekDate)
        );

        // Identify trainees who have NOT logged any nutrition data this week
        const inactiveTrainees = trainees.filter(t => !activeTrainees.some(at => at.id === t.id));

        // Filter all nutrition logs to only include those from the current week
        const weeklyLogs = nutritionLogs.filter(log => new Date(log.date) >= startOfWeekDate);

        // Calculate calorie adherence for active trainees
        const adherenceData = activeTrainees.map(trainee => {
            const traineeLogs = weeklyLogs.filter(log => log.user_id === trainee.id);
            const totalCalories = traineeLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
            const avgCalories = traineeLogs.length > 0 ? totalCalories / traineeLogs.length : 0;
            // Use trainee's daily goal, or a default of 2000 if not set
            const calorieGoal = trainee.daily_calories_goal || 2000;
            // Calculate adherence as a percentage
            const adherence = calorieGoal > 0 ? (avgCalories / calorieGoal) * 100 : 0;
            return { name: trainee.hebrew_name || trainee.full_name, adherence: Math.round(adherence) };
        });

        // Determine the top performer (highest adherence) and the trainee needing most attention (lowest adherence)
        const topPerformer = adherenceData.length > 0 ? adherenceData.reduce((max, t) => t.adherence > max.adherence ? t : max) : null;
        const needsAttention = adherenceData.length > 0 ? adherenceData.reduce((min, t) => t.adherence < min.adherence ? t : min) : null;

        // Construct the prompt for the LLM with the summarized data
        const prompt = `
            As a professional nutrition coach AI, analyze the following data for a coach's clients this week and provide a concise, actionable summary in Hebrew.
            Data:
            - Total trainees: ${trainees.length}
            - Trainees with logs this week: ${activeTrainees.length}
            - Trainees with NO logs this week: ${inactiveTrainees.map(t => t.hebrew_name || t.full_name).join(', ') || 'אין'}
            - Top performer (weekly calorie adherence): ${topPerformer ? `${topPerformer.name} with ${topPerformer.adherence}% adherence` : 'N/A'}
            - Trainee needing most attention (lowest adherence): ${needsAttention ? `${needsAttention.name} with ${needsAttention.adherence}% adherence` : 'N/A'}
            
            Your response must be a JSON object with this exact structure:
            {
                "title": "סיכום שבועי חכם",
                "key_insight": "A single, impactful sentence summarizing the week.",
                "positive_point": "A sentence highlighting a positive trend or top performer.",
                "improvement_point": "A sentence suggesting where to focus, e.g., inactive trainees or low adherence."
            }
            Be brief and encouraging.
        `;

        // Define the expected JSON response schema for the LLM
        const responseSchema = {
            type: "object",
            properties: {
                title: { type: "string" },
                key_insight: { type: "string" },
                positive_point: { type: "string" },
                improvement_point: { type: "string" }
            },
            required: ["title", "key_insight", "positive_point", "improvement_point"]
        };

        try {
            const result = await InvokeLLM({
                prompt: prompt,
                response_json_schema: responseSchema,
            });
            setAnalysis(result); // Set the received analysis
        } catch (err) {
            console.error("Error generating AI analysis:", err);
            setError("שגיאה ביצירת התובנות. נסה שוב מאוחר יותר.");
            setAnalysis(null); // Clear analysis on error
        } finally {
            setLoading(false);
        }
    }, [trainees, nutritionLogs]); // Dependencies for useCallback: re-run getAnalysis if trainees or nutritionLogs change

    // Use useEffect to automatically trigger analysis when component mounts or dependencies change
    useEffect(() => {
        getAnalysis();
    }, [getAnalysis]); // getAnalysis itself is a dependency, ensuring it's called when trainees/nutritionLogs change

    // The 'InsightCategory' component and its usage are removed as the new 'analysis' structure is different.

    return (
        <Card className="mb-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 border-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                    <Brain className="w-6 h-6 text-indigo-500" />
                    עוזר מאמן חכם
                </CardTitle>
                <Button onClick={getAnalysis} disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            מנתח נתונים...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 ml-2" />
                            הפק תובנות AI
                        </>
                    )}
                </Button>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 mb-4">
                    קבל ניתוח חכם של כל המתאמנים שלך כדי לזהות מי זקוק לתשומת לב ומי בדרך להצלחה.
                </p>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                {/* Display analysis based on the new structure */}
                {analysis && (
                    <div className="space-y-4 mt-4">
                        <Card className="bg-white border-l-4 border-indigo-500 shadow-sm">
                            <CardContent className="pt-4">
                                <h3 className="font-semibold text-lg text-indigo-700 mb-2">{analysis.title}</h3>
                                <p className="text-gray-700 mb-2">{analysis.key_insight}</p>
                                <p className="text-green-600 font-medium mb-1">{analysis.positive_point}</p>
                                <p className="text-orange-600 font-medium">{analysis.improvement_point}</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Show a message if no data is available for analysis and not currently loading */}
                {!loading && !analysis && !error && (trainees.length === 0 || nutritionLogs.length === 0) && (
                    <p className="text-gray-500 text-center mt-4">אין מספיק נתונים לניתוח. וודא שמתאמנים ויומני תזונה זמינים.</p>
                )}
            </CardContent>
        </Card>
    );
}
