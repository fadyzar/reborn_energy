import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Target, UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'trainee'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        role: formData.role
      });

      if (error) {
        if (error.message?.includes('User already registered')) {
          setError('כתובת האימייל כבר רשומה במערכת');
        } else if (error.message?.includes('Password')) {
          setError('הסיסמה חייבת להכיל לפחות 6 תווים');
        } else if (error.message?.includes('Email')) {
          setError('כתובת אימייל לא תקינה');
        } else {
          setError(error.message || 'אירעה שגיאה בהרשמה');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('אירעה שגיאה בהרשמה. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg-sunset p-4 transition-all duration-500 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-yellow-400/30 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>

      <Card className="w-full max-w-md morphism-card shadow-2xl border-0 relative z-10 animate-scale-in backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-6 relative">
          <div className="w-20 h-20 gradient-bg-warm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shine-effect neon-glow transform hover:scale-110 hover:rotate-6 transition-all duration-500">
            <UserPlus className="w-10 h-10 text-white relative z-10" />
          </div>
          <CardTitle className="text-4xl font-black gradient-text-premium mb-2">הרשמה</CardTitle>
          <CardDescription className="text-base text-white/80 font-medium">
            צור חשבון חדש כדי להתחיל
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name">שם מלא</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="שם מלא"
                value={formData.full_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">אימות סיסמה</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label>סוג משתמש</Label>
              <RadioGroup value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="trainee" id="trainee" />
                  <Label htmlFor="trainee" className="font-normal cursor-pointer">
                    מתאמן
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="coach" id="coach" />
                  <Label htmlFor="coach" className="font-normal cursor-pointer">
                    מאמן
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  נרשם...
                </>
              ) : (
                'צור חשבון'
              )}
            </Button>

            <div className="text-center text-sm pt-4">
              <span className="text-muted-foreground">כבר יש לך חשבון? </span>
              <Link to="/login" className="text-primary hover:underline font-bold hover:text-accent transition-colors">
                התחבר
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
