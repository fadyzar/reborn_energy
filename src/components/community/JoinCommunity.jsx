import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Link as LinkIcon, Rocket, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function JoinCommunity() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 text-white">
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 w-full max-w-2xl text-center shadow-2xl overflow-hidden">
        <div className="relative p-8 md:p-12">
          {/* Animated background shapes */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-12">
              <Rocket className="w-12 h-12 text-white transform -rotate-12" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              אתה כמעט שם!
            </h1>
            <p className="text-purple-200 text-lg mb-8 max-w-md mx-auto">
              כדי להצטרף לקהילה פרטית, עליך לקבל קישור הזמנה אישי מהמאמן שלך.
            </p>

            <div className="bg-white/10 border border-white/20 p-6 rounded-2xl max-w-md mx-auto mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                  <LinkIcon className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-left text-white">איך מצטרפים?</h3>
                  <p className="text-left text-purple-200">
                    פשוט בקש מהמאמן שלך את קישור ההזמנה האישי. לחיצה עליו תחבר אותך אוטומטית!
                  </p>
                </div>
              </div>
            </div>

            <p className="text-purple-300 mb-8">
              אחרי שתצטרף, תגלה עולם שלם של תמיכה, אתגרים ומוטיבציה! <Heart className="w-5 h-5 inline-block text-red-400" />
            </p>

            <Link to={createPageUrl("Home")}>
              <Button 
                variant="outline"
                className="bg-transparent hover:bg-white/10 text-white border-white/30 px-8 py-3 rounded-xl font-bold"
              >
                חזור לדף הבית
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}