import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Target } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message?.includes('Invalid login credentials')) {
          setError('אימייל או סיסמה שגויים');
        } else if (error.message?.includes('Email not confirmed')) {
          setError('יש לאמת את כתובת האימייל לפני ההתחברות');
        } else {
          setError(error.message || 'אירעה שגיאה בהתחברות');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('אירעה שגיאה בהתחברות. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg-ocean p-4 transition-all duration-500 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-cyan-400/30 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>

      <Card className="w-full max-w-md morphism-card shadow-2xl border-0 relative z-10 animate-scale-in backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-6 relative">
          <div className="w-20 h-20 gradient-bg-premium rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shine-effect neon-glow transform hover:scale-110 hover:rotate-6 transition-all duration-500">
            <Target className="w-10 h-10 text-white relative z-10" />
          </div>
          <CardTitle className="text-4xl font-black gradient-text-premium mb-2">התחברות</CardTitle>
          <CardDescription className="text-base text-white/80 font-medium">
            הכנס את פרטי ההתחברות שלך
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
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-bg-premium button-hover text-white font-black py-7 text-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 relative overflow-hidden"
              disabled={loading}
            >
              <span className="relative z-10">
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-6 w-6 animate-spin inline" />
                    מתחבר...
                  </>
                ) : (
                  'התחבר למערכת'
                )}
              </span>
            </Button>

            <div className="text-center text-sm pt-6">
              <span className="text-white/70 font-medium">אין לך חשבון? </span>
              <Link to="/register" className="text-white font-black hover:underline transition-all duration-300 hover:text-cyan-200">
                הירשם עכשיו
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
