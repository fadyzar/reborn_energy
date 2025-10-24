# מערכת ניהול אימונים ותזונה - Reborn Energy

מערכת מקצועית ומודרנית לניהול מתאמנים, מעקב אימונים, תזונה ומדדי גוף. המערכת מיועדת למאמנים אישיים ומתאמנים עם עיצוב מתקדם ומצב כהה (Dark Mode) מלא.

## תכונות עיקריות

### 🌓 Dark Mode מלא
- מעבר חלק בין מצב בהיר לכהה
- תמיכה במצב אוטומטי לפי מערכת ההפעלה
- כל המסכים מותאמים ל-Dark Mode
- אנימציות ומעברים חלקים

### עיצוב מודרני
- ממשק משתמש אינטואיטיבי ונקי
- אנימציות מתוחכמות עם Framer Motion
- אפקטי Glass Morphism
- Gradient backgrounds דינמיים
- Responsive Design מלא לכל המסכים

## תכונות

### למתאמנים
- דשבורד אישי עם מעקב יומי
- תיעוד תזונה ומדדי גוף
- מעקב אחר אימונים
- מערכת גיימיפיקציה - היכל הכוח
- קהילה ואתגרים
- לוח שנה ואנליטיקס אישיות

### למאמנים
- ניהול מתאמנים
- לוח מאמן מתקדם
- מרכז פיקוד בזמן אמת
- אנליטיקס ודוחות
- ניהול חוגים
- התאמה אישית של המיתוג
- מערכת התראות

## טכנולוגיות

- **Frontend**: React 18 + Vite
- **UI Components**: Radix UI + Tailwind CSS
- **Theming**: next-themes (Dark Mode)
- **Styling**: Custom CSS Variables + Dark Mode Support
- **Routing**: React Router v7
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Animations**: Framer Motion
- **3D Graphics**: Three.js
- **Fonts**: Inter, Assistant, Heebo

## התקנה

1. התקן את התלויות:
```bash
npm install
```

2. הגדר את משתני הסביבה:
הקובץ `.env` כבר קיים עם הגדרות Supabase:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. הרץ את השרת המקומי:
```bash
npm run dev
```

4. בנה לפרודקשן:
```bash
npm run build
```

## הרשמה ושימוש

1. היכנס לכתובת המערכת
2. לחץ על "הירשם עכשיו"
3. בחר סוג משתמש: מאמן או מתאמן
4. מלא את הפרטים
5. התחבר למערכת

## שימוש ב-Dark Mode

1. לחץ על כפתור ה-Theme Toggle בפינה העליונה של הדף
2. בחר בין מצב בהיר, כהה או אוטומטי
3. המערכת תשמור את ההעדפה שלך
4. במצב אוטומטי, המערכת תתאים עצמה לפי הגדרות מערכת ההפעלה שלך

## מבנה הפרויקט

```
├── src/
│   ├── api/              # API clients and entities
│   ├── components/       # React components
│   │   ├── ui/          # UI components (Radix)
│   │   ├── auth/        # Authentication components
│   │   ├── coach/       # Coach-specific components
│   │   ├── tracking/    # Tracking components
│   │   └── ...
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Page components
│   └── utils/           # Utility functions
├── public/              # Static assets
└── dist/               # Build output
```

## מסד הנתונים

המערכת משתמשת ב-Supabase עם הטבלאות הבאות:

- `user_profiles` - פרופילי משתמשים
- `nutrition_logs` - יומן תזונה
- `body_metrics` - מדדי גוף
- `workout_logs` - יומן אימונים
- `recipes` - מתכונים
- `community_posts` - פוסטים בקהילה
- `community_comments` - תגובות
- `community_challenges` - אתגרים
- `challenge_participations` - השתתפות באתגרים
- `user_avatars` - אווטרים של משתמשים
- `item_blueprints` - פריטי גיימיפיקציה
- `user_inventory` - מלאי פריטים
- `notifications` - התראות
- `app_settings` - הגדרות אפליקציה
- `business_settings` - הגדרות עסקיות
- `groups` - חוגים
- `post_likes` - לייקים

## אבטחה

- Row Level Security (RLS) פעיל על כל הטבלאות
- משתמשים יכולים לגשת רק לנתונים שלהם
- מאמנים יכולים לצפות במתאמנים שלהם בלבד
- אימות מבוסס Supabase Auth

## תמיכה

לתמיכה ושאלות: app@base44.com
