
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Recipe } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { Lock, Utensils, Timer, Flame, Search, Star } from 'lucide-react';
import useTrialStatus from "../components/trial/useTrialStatus";
import TrialTimer from "../components/trial/TrialTimer";

const RecipeCard = ({ recipe }) => (
    <Card className="overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <img src={recipe.image_url} alt={recipe.name} className="w-full h-48 object-cover" />
        <CardHeader>
            <CardTitle>{recipe.name}</CardTitle>
            <Badge variant="secondary" className="w-fit">{recipe.meal_type}</Badge>
        </CardHeader>
        <CardContent>
            <p className="text-gray-600 mb-4">{recipe.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1"><Timer className="w-4 h-4" /> {recipe.prep_time_minutes} דקות</div>
                <div className="flex items-center gap-1"><Flame className="w-4 h-4" /> {recipe.calories} קלוריות</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-blue-50 p-1 rounded">חלבון: {recipe.protein}ג</div>
                <div className="bg-green-50 p-1 rounded">פחמימה: {recipe.carbs}ג</div>
                <div className="bg-red-50 p-1 rounded">שומן: {recipe.fat}ג</div>
            </div>
            {/* Add a button to view full recipe in a dialog/new page later */}
        </CardContent>
    </Card>
);

const UpgradePrompt = () => {
    const navigate = useNavigate();
    return (
        <div className="text-center p-12 bg-gradient-to-br from-purple-600/50 to-pink-600/50 rounded-xl border border-purple-400 text-white">
            <Star className="w-16 h-16 mx-auto text-yellow-300 mb-4" />
            <h2 className="text-3xl font-bold mb-4">גישה לספריית המתכונים היא פיצ'ר Pro!</h2>
            <p className="mb-6 text-purple-100 max-w-2xl mx-auto">
                שדרג את המנוי שלך וקבל גישה מיידית למתכונים טעימים ובריאים, יחד עם כלי AI מתקדמים ותובנות שיעזרו לך להגיע ליעדים שלך מהר יותר.
            </p>
            <Button 
                onClick={() => navigate(createPageUrl('UpgradePlan'))}
                className="bg-yellow-400 text-slate-900 font-bold text-lg py-3 px-8 hover:bg-yellow-500 transition-all duration-300 scale-105"
            >
                שדרג עכשיו
            </Button>
        </div>
    );
};

export default function RecipesPage() {
    const [user, setUser] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const trialStatus = useTrialStatus(user);

    useEffect(() => {
        const loadData = async () => {
            try {
                let currentUser = await User.me();
                
                // Initialize trial period for new users
                if (!currentUser.trial_started_date && currentUser.subscription_plan !== 'pro') {
                    await User.updateMyUserData({ 
                        trial_started_date: new Date().toISOString()
                    });
                    currentUser = await User.me(); // Fetch updated user data
                }
                
                setUser(currentUser);
                if (trialStatus.hasAccess) {
                    const recipeData = await Recipe.list();
                    setRecipes(recipeData);
                }
            } catch (e) {
                // Not logged in
                setUser(null);
            }
            setLoading(false);
        };
        loadData();
    }, [trialStatus.hasAccess]);

    const filteredRecipes = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    }

    if (!user || !trialStatus.hasAccess) {
        return (
             <div className="p-4 lg:p-8 min-h-screen">
                <div className="max-w-5xl mx-auto">
                    {/* Trial Timer */}
                    {user && <TrialTimer user={user} />}
                    <UpgradePrompt />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Trial Timer */}
                {user && <TrialTimer user={user} />}

                <div className="mb-8 text-center">
                    <Utensils className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">ספריית המתכונים</h1>
                    <p className="text-gray-600">מצאו השראה לארוחה הבאה שלכם</p>
                </div>

                <div className="relative mb-8 max-w-lg mx-auto">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="חיפוש מתכון..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRecipes.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            </div>
        </div>
    );
}
