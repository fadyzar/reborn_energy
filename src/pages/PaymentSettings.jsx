import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { AppSettings } from '@/api/entities'; // שימוש במודל החדש
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building, Smartphone, DollarSign, CheckCircle, AlertTriangle, Save, Settings } from 'lucide-react';

export default function PaymentSettings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null); // רשומה אחת מההגדרות
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [paymentDetails, setPaymentDetails] = useState({
    bank_account_number: '',
    bank_name: '',
    bank_branch: '',
    account_holder_name: '',
    paypal_email: '',
    bit_phone: '',
    stripe_account_id: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      if (currentUser.role !== 'admin') {
        setLoading(false);
        return;
      }
      
      const appSettingsList = await AppSettings.list();
      const currentSettings = appSettingsList[0] || null; // תמיד תהיה רק רשומה אחת
      setSettings(currentSettings);

      if (currentSettings) {
        setPaymentMethod(currentSettings.payment_method || 'stripe');
        setPaymentDetails({
          bank_account_number: currentSettings.bank_account_number || '',
          bank_name: currentSettings.bank_name || '',
          bank_branch: currentSettings.bank_branch || '',
          account_holder_name: currentSettings.account_holder_name || '',
          paypal_email: currentSettings.paypal_email || '',
          bit_phone: currentSettings.bit_phone || '',
          stripe_account_id: currentSettings.stripe_account_id || ''
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        payment_method: paymentMethod,
        ...paymentDetails
      };
      
      if (settings && settings.id) {
        // עדכון הגדרות קיימות
        await AppSettings.update(settings.id, updateData);
      } else {
        // יצירת הגדרות בפעם הראשונה
        await AppSettings.create(updateData);
      }
      
      await loadInitialData(); // רענון המידע
      
      alert('הגדרות הסליקה של הפלטפורמה נשמרו בהצלחה! 🎉');
    } catch (error) {
      console.error("Error saving payment settings:", error);
      alert('שגיאה בשמירת ההגדרות. נסה שוב.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // רק מנהל המערכת יכול לגשת לעמוד זה
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <AlertTriangle className="w-16 h-16 text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">גישה למנהלים בלבד</h2>
        <p className="text-gray-600">עמוד זה מיועד לניהול הגדרות הסליקה של הפלטפורמה.</p>
      </div>
    );
  }

  const isSetupComplete = () => {
    switch (paymentMethod) {
      case 'bank_transfer':
        return paymentDetails.bank_account_number && paymentDetails.bank_name && 
               paymentDetails.bank_branch && paymentDetails.account_holder_name;
      case 'paypal':
        return paymentDetails.paypal_email;
      case 'bit':
        return paymentDetails.bit_phone;
      case 'stripe':
        return paymentDetails.stripe_account_id;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">הגדרות סליקה - פלטפורמה</h1>
          <p className="text-gray-600">כאן תגדיר איך הפלטפורמה שלך תקבל תשלומים</p>
          
          <div className="flex items-center justify-center gap-3 mt-4">
            {isSetupComplete() ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-4 h-4 ml-1" />
                הגדרות מוכנות לקבלת תשלום
              </Badge>
            ) : (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                <AlertTriangle className="w-4 h-4 ml-1" />
                יש להשלים את הגדרות הסליקה
              </Badge>
            )}
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">בחר שיטת סליקה ראשית</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-6">
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="stripe" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Stripe (מומלץ)
                </TabsTrigger>
                <TabsTrigger value="bank_transfer" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  העברה בנקאית
                </TabsTrigger>
                <TabsTrigger value="paypal" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  PayPal
                </TabsTrigger>
                <TabsTrigger value="bit" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Bit
                </TabsTrigger>
              </TabsList>

              {/* Stripe */}
              <TabsContent value="stripe" className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-purple-800 mb-2">⚡ Stripe</h3>
                  <p className="text-purple-700 text-sm">הפלטפורמה המומלצת לסליקת אשראי ותשלומים מתקדמים.</p>
                </div>
                
                <div>
                  <Label htmlFor="stripe_account_id">מזהה חשבון Stripe</Label>
                  <Input
                    id="stripe_account_id"
                    placeholder="acct_xxxxxxxxxx"
                    value={paymentDetails.stripe_account_id}
                    onChange={(e) => handleInputChange('stripe_account_id', e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    יש ליצור חשבון ב-Stripe ולקבל את מזהה החשבון שלך.
                  </p>
                </div>
              </TabsContent>

              {/* ... (שאר הלשוניות נשארות זהות) ... */}
              {/* העברה בנקאית */}
              <TabsContent value="bank_transfer" className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2">💳 העברה בנקאית</h3>
                  <p className="text-blue-700 text-sm">התשלומים יועברו ישירות לחשבון הבנק שלך</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="account_holder_name">שם בעל החשבון</Label>
                    <Input
                      id="account_holder_name"
                      placeholder="שם פרטי ומשפחה"
                      value={paymentDetails.account_holder_name}
                      onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_name">שם הבנק</Label>
                    <Input
                      id="bank_name"
                      placeholder="בנק לאומי, הפועלים, וכו'"
                      value={paymentDetails.bank_name}
                      onChange={(e) => handleInputChange('bank_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_branch">מספר סניף</Label>
                    <Input
                      id="bank_branch"
                      placeholder="123"
                      value={paymentDetails.bank_branch}
                      onChange={(e) => handleInputChange('bank_branch', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_account_number">מספר חשבון</Label>
                    <Input
                      id="bank_account_number"
                      placeholder="1234567"
                      value={paymentDetails.bank_account_number}
                      onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* PayPal */}
              <TabsContent value="paypal" className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2">💙 PayPal</h3>
                  <p className="text-blue-700 text-sm">קבל תשלומים ישירות לחשבון PayPal שלך</p>
                </div>
                
                <div>
                  <Label htmlFor="paypal_email">כתובת אימייל PayPal</Label>
                  <Input
                    id="paypal_email"
                    type="email"
                    placeholder="your@email.com"
                    value={paymentDetails.paypal_email}
                    onChange={(e) => handleInputChange('paypal_email', e.target.value)}
                  />
                </div>
              </TabsContent>

              {/* Bit */}
              <TabsContent value="bit" className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-orange-800 mb-2">📱 Bit</h3>
                  <p className="text-orange-700 text-sm">קבל תשלומים דרך אפליקציית Bit</p>
                </div>
                
                <div>
                  <Label htmlFor="bit_phone">מספר טלפון Bit</Label>
                  <Input
                    id="bit_phone"
                    placeholder="050-1234567"
                    value={paymentDetails.bit_phone}
                    onChange={(e) => handleInputChange('bit_phone', e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button 
                onClick={handleSave} 
                disabled={saving || !isSetupComplete()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                    שומר הגדרות...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 ml-2" />
                    שמור הגדרות סליקה
                  </>
                )}
              </Button>
              
              {!isSetupComplete() && (
                <p className="text-sm text-orange-600 text-center mt-3">
                  יש למלא את כל השדות הנדרשים עבור שיטת הסליקה שנבחרה
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* הסרת הסבר מיותר */}
      </div>
    </div>
  );
}