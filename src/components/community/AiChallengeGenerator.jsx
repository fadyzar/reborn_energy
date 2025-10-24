import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { InvokeLLM } from '@/api/integrations';
import { Sparkles, Search, Zap, Loader2 } from 'lucide-react';

export default function AiChallengeGenerator({ onChallengeSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateChallengeSuggestions = useCallback(async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const prompt = `
אתה יועץ כושר ותזונה מומחה היוצר אתגרים מעניינים וביצירים לקהילת מתאמנים.

על בסיס המילים: "${searchTerm}"

צור 3 אתגרים שונים ויצירתיים. כל אתגר צריך להיות:
- מעניין ומעורר השראה
- מעשי וניתן לביצוע
- מתאים לקבוצת מתאמנים
- כולל דרך לאמת את ההשלמה

עבור כל אתגר, תן:
- שם קצר וקולע
- תיאור מפורט (2-3 משפטים)
- הצעה לכמות נקודות (10-200)
- משך זמן מומלץ בימים (1-14)
- רעיון לאימות הצלחה

פורמט התשובה כ-JSON עם שדות: title, description, points_value, duration_days, verification_tip
      `;

      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  points_value: { type: "number" },
                  duration_days: { type: "number" },
                  verification_tip: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.challenges || []);
    } catch (error) {
      console.error('Error generating challenge suggestions:', error);
      // Fallback suggestions
      setSuggestions([
        {
          title: `אתגר ${searchTerm} מותאם`,
          description: `אתגר מיוחד הקשור ל${searchTerm}. פרטים נוספים יתווספו בעריכה.`,
          points_value: 50,
          duration_days: 7,
          verification_tip: "תמונה או תיעוד של השלמת האתגר"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      generateChallengeSuggestions();
    }
  };

  const handleQuickSearch = (term) => {
    setSearchTerm(term);
    setTimeout(() => {
      generateChallengeSuggestions();
    }, 100);
  };

  const handleSelectChallenge = (challenge) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + challenge.duration_days);
    
    const formattedChallenge = {
      title: challenge.title,
      description: challenge.description + (challenge.verification_tip ? ` הוכחת השלמה: ${challenge.verification_tip}` : ''),
      points_value: challenge.points_value,
      start_date: startDate,
      end_date: endDate,
    };
    
    onChallengeSelect(formattedChallenge);
  };

  const quickSearchTerms = [
    'ריצה', 'כוח', 'ארוחות בריאות', 'מים', 'צעדים', 
    'יוגה', 'שינה', 'מדיטציה', 'ירקות', 'חלבון'
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Sparkles className="w-5 h-5 text-blue-500" />
          מחולל אתגרים בינה מלאכותית
        </CardTitle>
        <p className="text-sm text-blue-600">
          תן למערכת ליצור עבורך אתגרים מותאמים ויצירתיים
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="למה האתגר קשור? (דוגמה: ריצה, בישול בריא, שתיית מים...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={loading || !searchTerm.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </form>

        {/* Quick Search Terms */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">חיפושים פופולריים:</p>
          <div className="flex flex-wrap gap-2">
            {quickSearchTerms.map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSearch(term)}
                className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {term}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>מחולל רעיונות מגניבים...</span>
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              רעיונות שנוצרו במיוחד עבורך:
            </h4>
            <div className="space-y-3">
              {suggestions.map((challenge, index) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
                  onClick={() => handleSelectChallenge(challenge)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-blue-900">{challenge.title}</h5>
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {challenge.points_value} נק'
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {challenge.duration_days} ימים
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{challenge.description}</p>
                  {challenge.verification_tip && (
                    <p className="text-xs text-blue-600">
                      💡 אימות: {challenge.verification_tip}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={generateChallengeSuggestions}
              className="text-blue-600 hover:bg-blue-100"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              יצר עוד רעיונות
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}