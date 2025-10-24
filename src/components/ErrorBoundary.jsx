import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    if (window.location.hostname !== 'localhost') {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4" dir="rtl">
          <Card className="max-w-2xl w-full shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                אופס! משהו השתבש
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                נתקלנו בבעיה בלתי צפויה. אנחנו מצטערים על אי הנוחות.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">פרטי השגיאה:</h3>
                  <p className="text-sm text-red-600 dark:text-red-400 font-mono mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs text-gray-600 dark:text-gray-400">
                      <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-white mb-2">
                        הצג מידע טכני נוסף
                      </summary>
                      <pre className="mt-2 p-2 bg-white dark:bg-slate-900 rounded border overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">מה ניתן לעשות?</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-400">
                  <li>רענן את הדף ונסה שוב</li>
                  <li>חזור לעמוד הבית</li>
                  <li>נקה את זיכרון המטמון של הדפדפן</li>
                  <li>אם הבעיה נמשכת, צור קשר עם התמיכה</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <RefreshCw className="w-5 h-5 ml-2" />
                  רענן את הדף
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-2 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-300"
                  size="lg"
                >
                  <Home className="w-5 h-5 ml-2" />
                  חזור לעמוד הבית
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  אם הבעיה נמשכת, אנא צור קשר עם התמיכה:
                  <a
                    href="mailto:support@rebornenergy.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline mr-1"
                  >
                    support@rebornenergy.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
