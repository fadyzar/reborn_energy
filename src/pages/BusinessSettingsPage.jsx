import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { BusinessSettings } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Upload, Palette, Brush } from 'lucide-react';
import { toast } from 'sonner';

export default function BusinessSettingsPage() {
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState({
        logo_url: '',
        primary_color: '#2563eb',
        secondary_color: '#16a34a',
        welcome_title: '',
        welcome_subtitle: '',
        show_quick_actions: true,
        show_weekly_chart: true,
        show_latest_metrics: true,
    });
    const [settingsId, setSettingsId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const currentUser = await User.me();
            if (!currentUser.is_coach && currentUser.role !== 'admin') {
                toast.error("אין לך הרשאה לגשת לדף זה.");
                // Redirect logic can be added here if needed
                return;
            }
            setUser(currentUser);

            const businessSettings = await BusinessSettings.filter({ coach_id: currentUser.id });
            if (businessSettings.length > 0) {
                setSettings(businessSettings[0]);
                setSettingsId(businessSettings[0].id);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("שגיאה בטעינת הנתונים.");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSwitchChange = (name, checked) => {
        setSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            setSettings(prev => ({ ...prev, logo_url: file_url }));
            toast.success("לוגו הועלה בהצלחה!");
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("שגיאה בהעלאת הלוגו.");
        }
        setUploading(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const dataToSave = { ...settings, coach_id: user.id };
            if (settingsId) {
                await BusinessSettings.update(settingsId, dataToSave);
            } else {
                const newSettings = await BusinessSettings.create(dataToSave);
                setSettingsId(newSettings.id);
            }
            toast.success("ההגדרות נשמרו בהצלחה!");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("שגיאה בשמירת ההגדרות.");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
        );
    }
    
    if (!user || (!user.is_coach && user.role !== 'admin')) {
         return (
             <div className="flex items-center justify-center min-h-screen p-8 text-center">
                <h1 className="text-2xl font-bold">דף זה זמין למאמנים בלבד.</h1>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Brush className="w-8 h-8 text-blue-500" />
                        הגדרות מיתוג ועיצוב
                    </h1>
                    <p className="text-gray-600 mt-2">
                        התאם אישית את נראות הדשבורד עבור המתאמנים שלך.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Branding Section */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-purple-500" />
                                מיתוג העסק
                            </CardTitle>
                            <CardDescription>העלה לוגו ובחר את צבעי המותג שלך.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div>
                                    <Label htmlFor="logo-upload">לוגו העסק</Label>
                                    <div className="mt-2 flex items-center gap-4">
                                        {settings.logo_url ? (
                                            <img src={settings.logo_url} alt="Logo" className="w-20 h-20 object-contain rounded-md border p-1" />
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                <span>אין לוגו</span>
                                            </div>
                                        )}
                                        <Button asChild variant="outline">
                                            <label htmlFor="logo-upload" className="cursor-pointer">
                                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                                {settings.logo_url ? 'שנה לוגו' : 'העלה לוגו'}
                                            </label>
                                        </Button>
                                        <Input id="logo-upload" type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="primary_color">צבע ראשי</Label>
                                        <div className="relative mt-2">
                                            <Input
                                                id="primary_color"
                                                name="primary_color"
                                                type="color"
                                                value={settings.primary_color}
                                                onChange={handleInputChange}
                                                className="w-full h-10 p-1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="secondary_color">צבע משני</Label>
                                        <div className="relative mt-2">
                                            <Input
                                                id="secondary_color"
                                                name="secondary_color"
                                                type="color"
                                                value={settings.secondary_color}
                                                onChange={handleInputChange}
                                                className="w-full h-10 p-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dashboard Content Section */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>תוכן הדשבורד</CardTitle>
                            <CardDescription>התאם אישית את מסכי הפתיחה של המתאמנים שלך.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="welcome_title">כותרת ראשית</Label>
                                    <Input id="welcome_title" name="welcome_title" value={settings.welcome_title} onChange={handleInputChange} placeholder="למשל: ברוכים הבאים לסטודיו שלי" />
                                </div>
                                <div>
                                    <Label htmlFor="welcome_subtitle">כותרת משנה</Label>
                                    <Input id="welcome_subtitle" name="welcome_subtitle" value={settings.welcome_subtitle} onChange={handleInputChange} placeholder="למשל: ביחד נגיע ליעדים" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Dashboard Widgets Section */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>רכיבי דשבורד</CardTitle>
                            <CardDescription>בחר אילו רכיבים יוצגו בדשבורד של המתאמנים.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <Label htmlFor="show_quick_actions">הצג "פעולות מהירות"</Label>
                                <Switch id="show_quick_actions" checked={settings.show_quick_actions} onCheckedChange={(checked) => handleSwitchChange('show_quick_actions', checked)} />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <Label htmlFor="show_weekly_chart">הצג "גרף התקדמות שבועי"</Label>
                                <Switch id="show_weekly_chart" checked={settings.show_weekly_chart} onCheckedChange={(checked) => handleSwitchChange('show_weekly_chart', checked)} />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <Label htmlFor="show_latest_metrics">הצג "מדדים אחרונים"</Label>
                                <Switch id="show_latest_metrics" checked={settings.show_latest_metrics} onCheckedChange={(checked) => handleSwitchChange('show_latest_metrics', checked)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {saving ? 'שומר...' : 'שמור הגדרות'}
                    </Button>
                </div>
            </div>
        </div>
    );
}