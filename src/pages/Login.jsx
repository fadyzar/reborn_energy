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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40 dark:opacity-20"></div>

      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <Card className="w-full max-w-md glass-morphism shadow-2xl border-0 relative z-10">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-l from-blue-600 to-green-600 bg-clip-text text-transparent">התחברות</CardTitle>
          <CardDescription className="text-base">
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
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  מתחבר...
                </>
              ) : (
                'התחבר למערכת'
              )}
            </Button>

            <div className="text-center text-sm pt-4">
              <span className="text-muted-foreground">אין לך חשבון? </span>
              <Link to="/register" className="text-primary hover:underline font-bold hover:text-accent transition-colors">
                הירשם עכשיו
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
