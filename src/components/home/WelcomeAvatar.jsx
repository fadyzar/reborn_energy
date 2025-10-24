
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Added Card components
import {
  X, Bot, MessageSquare, Volume2, VolumeX, ArrowRight,
  Play, Sparkles, Zap, Target, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const avatarMessages = [
  {
    id: 'welcome',
    title: 'ברוכים הבאים! 👋',
    content: 'היי! אני כאן כדי להכיר לכם את Reborn Energy - המערכת החכמה ביותר למעקב תזונה וכושר!',
    icon: '🤖',
    action: null
  },
  {
    id: 'tracking',
    title: 'מעקב חכם ופשוט 📱',
    content: 'רושמים ארוחות בקלות, המערכת מחשבת הכל אוטומטית - קלוריות, חלבון, פחמימות ושומן. בלי סיבוכים!',
    icon: '🍎',
    features: ['מעקב יומי', 'חישובים אוטומטיים', 'יעדים אישיים'],
    action: 'DailyTracking'
  },
  {
    id: 'coach',
    title: 'ליווי מאמן מקצועי 🏆',
    content: 'המאמן שלכם עוקב אחרי ההתקדמות, נותן המלצות ומניע אתכם להגיע ליעדים שלכם!',
    icon: '👨‍🏫',
    features: ['ניתוח מקצועי', 'המלצות אישיות', 'מוטיבציה'],
    action: null
  },
  {
    id: 'community',
    title: 'קהילה תומכת 💪',
    content: 'הצטרפו לקהילה של מתאמנים, שתפו הישגים, השתתפו באתגרים וצברו נקודות!',
    icon: '👥',
    features: ['אתגרים מעניינים', 'נקודות ופרסים', 'תמיכה קהילתית'],
    action: 'Community'
  },
  {
    id: 'analytics',
    title: 'אנליטיקס מתקדם 📊',
    content: 'גרפים יפים, מעקב התקדמות, ואנליזות חכמות שעוזרות לכם להבין איך להשתפר!',
    icon: '📈',
    features: ['גרפים אינטראקטיביים', 'ניתוח מגמות', 'תובנות חכמות'],
    action: 'PersonalAnalytics'
  }
];

export default function WelcomeAvatar({ onGetStarted, onNavigate }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStartedTour, setHasStartedTour] = useState(false);

  const currentMessage = avatarMessages[currentMessageIndex];

  const speak = useCallback((text) => {
    if (isMuted || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);

      // הגדרות קול משופרות - קול גברי ונעים
      utterance.lang = 'he-IL';
      utterance.rate = 0.85; // מהירות איטית יותר
      utterance.pitch = 0.8; // טון נמוך יותר (גברי)
      utterance.volume = 0.9;

      // נסה לבחור קול גברי אם זמין
      const voices = window.speechSynthesis.getVoices();
      const hebrewVoice = voices.find(voice =>
        voice.lang.includes('he') && voice.name.toLowerCase().includes('male')
      ) || voices.find(voice => voice.lang.includes('he'));

      if (hebrewVoice) {
        utterance.voice = hebrewVoice;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech error:", error);
      setIsSpeaking(false);
    }
  }, [isMuted]);

  useEffect(() => {
    if (isExpanded && hasStartedTour) {
      speak(currentMessage.content);
    }
  }, [currentMessageIndex, isExpanded, hasStartedTour, speak, currentMessage.content]);

  useEffect(() => {
    if (hasStartedTour && currentMessageIndex < avatarMessages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, hasStartedTour]);

  const startTour = () => {
    setHasStartedTour(true);
    if (currentMessageIndex === 0) {
      setCurrentMessageIndex(1); // Start tour from the second message
    }
  };

  const nextMessage = () => {
    if (currentMessageIndex < avatarMessages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    }
  };

  const prevMessage = () => {
    if (currentMessageIndex > 0) { // Allow going back to welcome message
      setCurrentMessageIndex(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setHasStartedTour(false);
    setCurrentMessageIndex(0); // Reset to welcome message
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleActionClick = (action) => {
    if (action && onNavigate) {
      handleClose(); // Close avatar before navigating
      onNavigate(action);
    }
  };

  // אייקון מצומצם
  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <motion.button
          onClick={() => setIsExpanded(true)}
          className="relative w-16 h-16 rounded-full shadow-2xl overflow-hidden group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-pulse"></div>
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.75, 1, 0.75],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          ></motion.div>
          <motion.div
            className="relative z-10 text-3xl flex items-center justify-center w-full h-full" // Added flex for centering
            animate={{
              y: [0, -2, 0, 2, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🤖
          </motion.div>
        </motion.button>
      </motion.div>
    );
  }

  // חלון צ'אט מורחב
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 50 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
        className="fixed bottom-6 left-6 z-50 max-w-sm w-full" // Added w-full for max-width to apply
      >
        <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 shadow-2xl overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-10"></div>
            <CardHeader className="pb-3 relative">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: isSpeaking ? [0, -10, 10, -10, 0] : [0, 0], // Only rotate if speaking
                    scale: isSpeaking ? [1, 1.1, 1] : [1, 1.05, 1] // Keep subtle animation if not speaking
                  }}
                  transition={{
                    duration: isSpeaking ? 0.6 : 2, // Faster if speaking
                    repeat: isSpeaking ? Infinity : Infinity,
                    repeatDelay: isSpeaking ? 0 : 3
                  }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl shadow-lg"
                >
                  {currentMessage.icon}
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">
                    {currentMessage.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 px-2 py-1">
                      מדריך חכם
                    </Badge>
                    {hasStartedTour && (
                      <span className="text-xs text-gray-500">
                        {currentMessageIndex + 1}/{avatarMessages.length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-blue-100"
                    onClick={() => setIsMuted(prev => !prev)}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100" onClick={handleClose}>
                    <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </div>
          <CardContent className="p-4">
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                {currentMessage.content}
              </p>
              {currentMessage.features && (
                <div className="grid grid-cols-1 gap-2 mb-3">
                  {currentMessage.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-blue-50/50 p-2 rounded-md text-xs font-medium text-blue-800 flex items-center gap-2"
                    >
                      <Zap className="w-3 h-3 text-blue-500" />
                      {feature}
                    </motion.div>
                  ))}
                </div>
              )}
              {currentMessage.action && (
                <Button
                  onClick={() => handleActionClick(currentMessage.action)}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-100 mt-2"
                >
                  <ArrowRight className="w-4 h-4 ml-2" /> {/* Moved icon to right for RTL */}
                  נסה את המסך הזה
                </Button>
              )}
            </motion.div>
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2">
                {/* Previous button: Only visible if tour started AND not on the very first message.
                    If currentMessageIndex is 1 (the first message *of the tour*), 
                    prevMessage will take it back to the welcome message (index 0).
                */}
                {currentMessageIndex > 0 && hasStartedTour && (
                  <Button size="sm" variant="ghost" onClick={prevMessage}>
                    הקודם
                  </Button>
                )}
                {/* Next button: Only visible if tour started AND not on the last message */}
                {currentMessageIndex < avatarMessages.length - 1 && hasStartedTour && (
                  <Button size="sm" onClick={nextMessage} className="bg-blue-600 hover:bg-blue-700">
                    הבא
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {/* Start tour button: Only visible if tour has NOT started */}
                {!hasStartedTour && (
                  <Button size="sm" onClick={startTour} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg">
                    <Play className="w-4 h-4 ml-2" /> {/* Moved icon to right for RTL */}
                    התחל סיור
                  </Button>
                )}
                {/* Done button: Only visible on the very last message */}
                {currentMessageIndex === avatarMessages.length - 1 && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleClose();
                      onGetStarted?.();
                    }}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:shadow-lg"
                  >
                    סיימתי!
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
