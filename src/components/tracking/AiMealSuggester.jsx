import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';

export default function AiMealSuggester({ remainingMacros }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getSuggestions = async () => {
        setLoading(true);
        setError('');
        setSuggestions([]);

        const prompt = `
            You are a nutrition expert for an app called "Reborn Energy". Your response must be in Hebrew.
            A user needs meal suggestions. Their remaining macros for today are:
            Calories: ${remainingMacros.calories.toFixed(0)}
            Protein: ${remainingMacros.protein.toFixed(0)}g
            Carbs: ${remainingMacros.carbs.toFixed(0)}g
            Fat: ${remainingMacros.fat.toFixed(0)}g

            Please provide 3 diverse meal ideas (e.g., breakfast, lunch, dinner, snack) that fit within these remaining macros.
            For each meal, provide: a Hebrew name, a short appealing Hebrew description, and the estimated macros (calories, protein, carbs, fat).
            Keep it simple and practical.
            Provide the response as a JSON object with a key "suggestions" which is an array of meal objects.
        `;

        const responseSchema = {
            type: "object",
            properties: {
                suggestions: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                            calories: { type: "number" },
                            protein: { type: "number" },
                            carbs: { type: "number" },
                            fat: { type: "number" }
                        },
                        required: ["name", "description", "calories", "protein"]
                    }
                }
            },
            required: ["suggestions"]
        };

        try {
            const result = await InvokeLLM({
                prompt: prompt,
                response_json_schema: responseSchema,
            });
            setSuggestions(result.suggestions || []);
        } catch (err) {
            console.error(err);
            setError('שגיאה בקבלת הצעות. נסה שוב מאוחר יותר.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-400">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="w-6 h-6" />
                    יועץ תזונה AI
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-sm">נותרו לך {remainingMacros.calories.toFixed(0)} קלוריות. לחץ לקבלת הצעות חכמות לארוחה הבאה!</p>
                <Button 
                    onClick={getSuggestions} 
                    disabled={loading}
                    className="w-full bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-500"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 ml-2" />}
                    {loading ? 'חושב...' : 'תן לי הצעות'}
                </Button>

                {error && <p className="text-red-300 mt-4 text-center">{error}</p>}

                {suggestions.length > 0 && (
                    <div className="mt-6 space-y-4">
                        {suggestions.map((meal, index) => (
                            <div key={index} className="p-4 bg-white/10 rounded-lg">
                                <h4 className="font-bold">{meal.name}</h4>
                                <p className="text-sm text-purple-200 mb-2">{meal.description}</p>
                                <div className="grid grid-cols-4 gap-2 text-xs text-center">
                                    <div className="bg-white/20 p-1 rounded">קל': {meal.calories}</div>
                                    <div className="bg-white/20 p-1 rounded">ח': {meal.protein}ג</div>
                                    <div className="bg-white/20 p-1 rounded">פ': {meal.carbs}ג</div>
                                    <div className="bg-white/20 p-1 rounded">ש': {meal.fat}ג</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}