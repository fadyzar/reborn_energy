
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Zap, Brain, Trophy, Star, Loader2, AlertTriangle, CreditCard, Shield, Lock, Utensils, BarChart2, Target } from 'lucide-react';
import { createPageUrl } from '@/utils';
import DowngradeDialog from '../components/subscription/DowngradeDialog';

const coachProFeatures = [
    { name: 'תובנות AI חכמות על מתאמנים', icon: Brain },
    { name: 'השוואת ביצועים מתקדמת', icon: Trophy },
    { name: 'חיזוי הצלחה וסיכונים', icon: Zap },
    { name: 'דוחות מותאמים אישית', icon: Star },
];

const traineeProFeatures = [
    { name: '🤖 יועץ תזונה AI אישי', icon: Brain },
    { name: '📚 ספריית מתכוני פרימיום', icon: Utensils },
    { name: '📈 אנליטיקס אישי מתקדם', icon: BarChart2 },
    { name: '🎯 הצבת יעדים שבועית', icon: Target },
];

const freeFeatures = [
    { name: 'מעקב תזונה יומי', icon: CheckCircle },
    { name: 'מעקב מדדי גוף', icon: CheckCircle },
    { name: 'תמיכה מהמאמן', icon: CheckCircle },
    { name: 'תובנות AI', icon: XCircle, pro: true },
];

export default function UpgradePlan() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        billingEmail: ''
    });
    const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
    const [isDowngrading, setIsDowngrading] = useState(false);
    const [downgradeSuccess, setDowngradeSuccess] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                navigate(createPageUrl('Home'));
            }
            setLoading(false);
        };
        fetchUser();
    }, [navigate]);

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
        return formatted.substring(0, 19);
    };

    const formatExpiryDate = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
        }
        return cleaned;
    };

    const validateCard = () => {
        const { cardNumber, expiryDate, cvv, cardholderName, billingEmail } = cardDetails;
        
        if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
            return 'מספר כרטיס לא תקין';
        }
        
        if (!expiryDate || expiryDate.length !== 5) {
            return 'תאריך תפוגה לא תקין';
        }
        
        if (!cvv || cvv.length !== 3) {
            return 'CVV לא תקין';
        }
        
        if (!cardholderName.trim()) {
            return 'שם בעל הכרטיס נדרש';
        }
        
        if (!billingEmail.includes('@')) {
            return 'כתובת אימייל לא תקינה';
        }
        
        return null;
    };

    const handleCardDetailsChange = (field, value) => {
        let formattedValue = value;
        
        if (field === 'cardNumber') {
            formattedValue = formatCardNumber(value);
        } else if (field === 'expiryDate') {
            formattedValue = formatExpiryDate(value);
        } else if (field === 'cvv') {
            formattedValue = value.replace(/\D/g, '').substring(0, 3);
        }
        
        setCardDetails(prev => ({
            ...prev,
            [field]: formattedValue
        }));
        
        if (paymentError) {
            setPaymentError('');
        }
    };

    const simulateStripePayment = async (cardDetails) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
                
                if (cardNumber === '4000000000000002') {
                    reject(new Error('הכרטיס נדחה על ידי הבנק'));
                } else if (cardNumber === '4000000000000119') {
                    reject(new Error('שגיאה בעיבוד התשלום'));
                } else {
                    resolve({
                        id: 'pi_' + Math.random().toString(36).substr(2, 9),
                        status: 'succeeded'
                    });
                }
            }, 2000);
        });
    };

    const handleUpgrade = async () => {
        if (!showPaymentForm) {
            setShowPaymentForm(true);
            return;
        }

        const validationError = validateCard();
        if (validationError) {
            setPaymentError(validationError);
            return;
        }

        setIsUpgrading(true);
        setPaymentError('');

        try {
            await simulateStripePayment(cardDetails);
            await User.updateMyUserData({ subscription_plan: 'pro' });
            const updatedUser = await User.me();
            setUser(updatedUser);
            navigate(createPageUrl(user.is_coach ? 'CoachDashboard' : 'Dashboard'));
        } catch (error) {
            setPaymentError(error.message || 'שגיאה בעיבוד התשלום');
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleDowngrade = async () => {
        setIsDowngrading(true);
        try {
            await User.updateMyUserData({ subscription_plan: 'free' });
            const updatedUser = await User.me();
            setUser(updatedUser);
            setShowDowngradeDialog(false);
            setDowngradeSuccess(true);
            setTimeout(() => setDowngradeSuccess(false), 5000);
        } catch (error) {
            console.error("Downgrade failed:", error);
        } finally {
            setIsDowngrading(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
        );
    }

    const isProPlan = user.subscription_plan === 'pro';
    const isCoach = user.is_coach;
    const proFeaturesToDisplay = isCoach ? coachProFeatures : traineeProFeatures;
    const planName = isCoach ? 'מאמן Pro' : 'מתאמן Pro';
    const price = isCoach ? '₪99' : '₪29';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-6 text-white">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <Star className="w-16 h-16 mx-auto text-yellow-400 animate-pulse mb-4" />
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-white to-pink-300 bg-clip-text text-transparent">
                        {isProPlan ? `ניהול מנוי ${planName}` : `🚀 שדרג ל-${planName}`}
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        {isProPlan 
                            ? 'כאן תוכל לנהל את פרטי המנוי שלך ולצפות בהטבות.' 
                            : (isCoach 
                                ? 'הפוך למאמן-על עם כלי AI מתקדמים שיחסכו לך שעות ויכפילו את התוצאות.'
                                : 'השג את המטרות שלך מהר יותר עם תובנות AI, מתכונים וכלים מתקדמים.')
                        }
                    </p>
                </div>

                {downgradeSuccess && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-8 text-center">
                        <p className="text-green-300 flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            המנוי שלך בוטל בהצלחה.
                        </p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Free Plan */}
                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col justify-between">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl text-gray-300">המסלול החינמי</CardTitle>
                            <div className="text-4xl font-bold text-gray-400">₪0</div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {freeFeatures.map((feature, index) => (
                                    <li key={index} className={`flex items-center gap-3 ${feature.pro ? 'text-gray-500' : 'text-gray-300'}`}>
                                        <feature.icon className={`w-5 h-5 ${
                                            feature.icon === XCircle ? 'text-red-400' : feature.pro ? 'text-gray-500' : 'text-green-400'
                                        }`} />
                                        <span>{feature.name}</span>
                                        {feature.pro && <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">Pro</Badge>}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        {isProPlan && (
                            <CardContent className="mt-auto">
                                <Button 
                                    onClick={() => setShowDowngradeDialog(true)} 
                                    variant="outline" 
                                    className="w-full bg-transparent border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                >
                                    <XCircle className="w-5 h-5 mr-2" />
                                    חזור למסלול החינמי
                                </Button>
                            </CardContent>
                        )}
                    </Card>

                    {/* Pro Plan */}
                    <Card className={`bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 shadow-2xl relative overflow-hidden ${isProPlan ? 'border-green-400' : 'border-yellow-400'}`}>
                        {isProPlan ? (
                            <Badge className="absolute top-4 right-4 bg-green-400 text-slate-900 font-bold">
                                התוכנית שלך
                            </Badge>
                        ) : (
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-yellow-400 text-slate-900 font-bold">
                                    הכי פופולרי!
                                </Badge>
                            </div>
                        )}
                        
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl text-white">{planName}</CardTitle>
                            <div className="text-5xl font-bold text-yellow-400">{price}</div>
                            <p className="text-purple-200">לחודש</p>
                        </CardHeader>
                        
                        <CardContent>
                            <ul className="space-y-4 mb-6">
                                {proFeaturesToDisplay.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <feature.icon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                                        <span className="text-white font-medium">{feature.name}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Payment Form or Upgrade Button */}
                            {!isProPlan && (
                                <div className="space-y-4">
                                    {showPaymentForm ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="cardNumber" className="text-white">מספר כרטיס</Label>
                                                    <Input
                                                        id="cardNumber"
                                                        type="text"
                                                        placeholder="1234 5678 9012 3456"
                                                        value={cardDetails.cardNumber}
                                                        onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value)}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="expiryDate" className="text-white">תאריך תפוגה</Label>
                                                    <Input
                                                        id="expiryDate"
                                                        type="text"
                                                        placeholder="MM/YY"
                                                        value={cardDetails.expiryDate}
                                                        onChange={(e) => handleCardDetailsChange('expiryDate', e.target.value)}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="cvv" className="text-white">CVV</Label>
                                                    <Input
                                                        id="cvv"
                                                        type="text"
                                                        placeholder="123"
                                                        value={cardDetails.cvv}
                                                        onChange={(e) => handleCardDetailsChange('cvv', e.target.value)}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="cardholderName" className="text-white">שם בעל הכרטיס</Label>
                                                    <Input
                                                        id="cardholderName"
                                                        type="text"
                                                        placeholder="ישראל ישראלי"
                                                        value={cardDetails.cardholderName}
                                                        onChange={(e) => handleCardDetailsChange('cardholderName', e.target.value)}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="billingEmail" className="text-white">אימייל לחיוב</Label>
                                                <Input
                                                    id="billingEmail"
                                                    type="email"
                                                    placeholder="israel@example.com"
                                                    value={cardDetails.billingEmail}
                                                    onChange={(e) => handleCardDetailsChange('billingEmail', e.target.value)}
                                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                                />
                                            </div>

                                            {paymentError && (
                                                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                                                    <p className="text-red-300 text-sm">{paymentError}</p>
                                                </div>
                                            )}

                                            <div className="text-xs text-gray-400 mb-4">
                                                <p>💳 לבדיקה השתמש בכרטיסי הבדיקה הבאים:</p>
                                                <p>✅ הצלחה: 4242424242424242</p>
                                                <p>❌ נדחה: 4000000000000002</p>
                                                <p>⚠️ שגיאה: 4000000000000119</p>
                                            </div>
                                        </div>
                                    ) : null}

                                    <Button
                                        onClick={handleUpgrade}
                                        disabled={isUpgrading}
                                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold text-lg py-4 hover:from-yellow-500 hover:to-orange-600 transition-all duration-300"
                                    >
                                        {isUpgrading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                מעבד תשלום...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5 mr-2" />
                                                {showPaymentForm ? `שלם ${price} ושדרג עכשיו` : 'שדרג עכשיו'}
                                            </>
                                        )}
                                    </Button>

                                    {showPaymentForm && (
                                        <Button
                                            onClick={() => setShowPaymentForm(false)}
                                            variant="ghost"
                                            className="w-full text-white hover:bg-white/10"
                                        >
                                            חזור
                                        </Button>
                                    )}
                                </div>
                            )}

                            {isProPlan && (
                                <div className="text-center">
                                    <p className="text-green-300 mb-4">🎉 אתה כבר מנוי Pro!</p>
                                    <p className="text-sm text-gray-400">תהנה מכל הפיצ'רים המתקדמים</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Trust Indicators */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center items-center gap-6 text-gray-400">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            <span>תשלום מאובטח</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            <span>הצפנת SSL</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            <span>כל כרטיסי האשראי</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        ניתן לבטל בכל עת • ללא עלויות נסתרות • תמיכה 24/7
                    </p>
                </div>
            </div>

            <DowngradeDialog 
                open={showDowngradeDialog}
                onOpenChange={setShowDowngradeDialog}
                onConfirm={handleDowngrade}
                isDowngrading={isDowngrading}
            />
        </div>
    );
}
