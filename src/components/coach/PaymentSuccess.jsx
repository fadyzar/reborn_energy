import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Trophy, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PaymentSuccess() {
    useEffect(() => {
        // Confetti effect or celebration animation could go here
        const timer = setTimeout(() => {
            // Auto-redirect after 5 seconds
            window.location.href = createPageUrl('CoachDashboard');
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center p-6">
            <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl max-w-2xl w-full text-center">
                <CardContent className="p-12">
                    <div className="space-y-6">
                        <div className="relative">
                            <CheckCircle className="w-24 h-24 text-green-500 mx-auto animate-bounce" />
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-spin">
                                <Star className="w-4 h-4 text-yellow-800" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                🎉 ברוך הבא ל-Reborn Pro!
                            </h1>
                            <p className="text-xl text-gray-600">
                                התשלום עבר בהצלחה והמנוי שלך הופעל
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                מה חדש בחשבון שלך:
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-purple-700">
                                    <Zap className="w-6 h-6" />
                                    <span className="font-medium">תובנות AI חכמות</span>
                                </div>
                                <div className="flex items-center gap-3 text-purple-700">
                                    <Trophy className="w-6 h-6" />
                                    <span className="font-medium">השוואת מתאמנים מתקדמת</span>
                                </div>
                                <div className="flex items-center gap-3 text-purple-700">
                                    <Star className="w-6 h-6" />
                                    <span className="font-medium">דוחות מותאמים אישית</span>
                                </div>
                                <div className="flex items-center gap-3 text-purple-700">
                                    <CheckCircle className="w-6 h-6" />
                                    <span className="font-medium">תמיכה טלפונית VIP</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Link to={createPageUrl('CoachDashboard')}>
                                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg py-4 hover:scale-105 transition-transform shadow-lg">
                                    התחל להשתמש בפיצ'רים החדשים 🚀
                                </Button>
                            </Link>

                            <p className="text-sm text-gray-500">
                                קבלה נשלחה לאימייל שלך | ניתן לבטל המנוי בכל עת
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}