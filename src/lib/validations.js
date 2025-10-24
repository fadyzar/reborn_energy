import { z } from 'zod';

export const nutritionLogSchema = z.object({
  food_name: z.string().min(1, 'שם המזון הוא שדה חובה').max(200, 'שם המזון ארוך מדי'),
  calories: z.number().min(0, 'קלוריות לא יכולות להיות שליליות').max(10000, 'ערך קלוריות לא סביר'),
  protein: z.number().min(0, 'חלבון לא יכול להיות שלילי').max(500, 'ערך חלבון לא סביר').optional().nullable(),
  carbs: z.number().min(0, 'פחמימות לא יכולות להיות שליליות').max(1000, 'ערך פחמימות לא סביר').optional().nullable(),
  fat: z.number().min(0, 'שומן לא יכול להיות שלילי').max(500, 'ערך שומן לא סביר').optional().nullable(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    errorMap: () => ({ message: 'סוג ארוחה לא תקין' })
  }).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך לא תקין'),
  notes: z.string().max(500, 'הערות ארוכות מדי').optional().nullable(),
});

export const bodyMetricsSchema = z.object({
  weight: z.number().min(20, 'משקל נמוך מדי').max(300, 'משקל גבוה מדי').optional().nullable(),
  body_fat: z.number().min(0, 'אחוז שומן לא יכול להיות שלילי').max(100, 'אחוז שומן לא יכול לעלות על 100').optional().nullable(),
  muscle_mass: z.number().min(0, 'מסת שריר לא יכולה להיות שלילית').max(200, 'ערך מסת שריר לא סביר').optional().nullable(),
  waist_circumference: z.number().min(20, 'היקף מותניים נמוך מדי').max(200, 'היקף מותניים גבוה מדי').optional().nullable(),
  chest_circumference: z.number().min(20, 'היקף חזה נמוך מדי').max(200, 'היקף חזה גבוה מדי').optional().nullable(),
  arm_circumference: z.number().min(10, 'היקף זרוע נמוך מדי').max(100, 'היקף זרוע גבוה מדי').optional().nullable(),
  thigh_circumference: z.number().min(20, 'היקף ירך נמוך מדי').max(150, 'היקף ירך גבוה מדי').optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך לא תקין'),
  notes: z.string().max(500, 'הערות ארוכות מדי').optional().nullable(),
});

export const userProfileSchema = z.object({
  full_name: z.string().min(2, 'שם מלא קצר מדי').max(100, 'שם מלא ארוך מדי').optional(),
  hebrew_name: z.string().min(2, 'שם עברי קצר מדי').max(100, 'שם עברי ארוך מדי').optional(),
  email: z.string().email('כתובת אימייל לא תקינה').optional(),
  phone: z.string().regex(/^0\d{1,2}-?\d{7}$/, 'מספר טלפון לא תקין').optional().nullable(),
  daily_calories_goal: z.number().min(1000, 'יעד קלורי נמוך מדי').max(10000, 'יעד קלורי גבוה מדי').optional().nullable(),
  daily_protein_goal: z.number().min(20, 'יעד חלבון נמוך מדי').max(500, 'יעד חלבון גבוה מדי').optional().nullable(),
  daily_carbs_goal: z.number().min(50, 'יעד פחמימות נמוך מדי').max(1000, 'יעד פחמימות גבוה מדי').optional().nullable(),
  daily_fat_goal: z.number().min(20, 'יעד שומן נמוך מדי').max(300, 'יעד שומן גבוה מדי').optional().nullable(),
  height: z.number().min(100, 'גובה נמוך מדי').max(250, 'גובה גבוה מדי').optional().nullable(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך לא תקין').optional().nullable(),
});

export const workoutLogSchema = z.object({
  exercise_name: z.string().min(1, 'שם התרגיל הוא שדה חובה').max(200, 'שם התרגיל ארוך מדי'),
  sets: z.number().int('מספר סטים חייב להיות מספר שלם').min(1, 'לפחות סט אחד').max(20, 'מספר סטים גבוה מדי').optional().nullable(),
  reps: z.number().int('מספר חזרות חייב להיות מספר שלם').min(1, 'לפחות חזרה אחת').max(100, 'מספר חזרות גבוה מדי').optional().nullable(),
  weight: z.number().min(0, 'משקל לא יכול להיות שלילי').max(1000, 'משקל גבוה מדי').optional().nullable(),
  duration_minutes: z.number().min(1, 'משך האימון חייב להיות לפחות דקה').max(600, 'משך האימון ארוך מדי').optional().nullable(),
  calories_burned: z.number().min(0, 'קלוריות שרופות לא יכולות להיות שליליות').max(5000, 'ערך קלוריות לא סביר').optional().nullable(),
  workout_type: z.enum(['strength', 'cardio', 'flexibility', 'sports', 'other'], {
    errorMap: () => ({ message: 'סוג אימון לא תקין' })
  }).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך לא תקין'),
  notes: z.string().max(500, 'הערות ארוכות מדי').optional().nullable(),
});

export const recipeSchema = z.object({
  name: z.string().min(1, 'שם המתכון הוא שדה חובה').max(200, 'שם המתכון ארוך מדי'),
  description: z.string().max(1000, 'תיאור ארוך מדי').optional().nullable(),
  ingredients: z.string().min(1, 'רכיבים הם שדה חובה').max(2000, 'רשימת רכיבים ארוכה מדי'),
  instructions: z.string().min(1, 'הוראות הכנה הן שדה חובה').max(5000, 'הוראות הכנה ארוכות מדי'),
  prep_time_minutes: z.number().int('זמן הכנה חייב להיות מספר שלם').min(0, 'זמן הכנה לא יכול להיות שלילי').max(600, 'זמן הכנה ארוך מדי').optional().nullable(),
  cook_time_minutes: z.number().int('זמן בישול חייב להיות מספר שלם').min(0, 'זמן בישול לא יכול להיות שלילי').max(600, 'זמן בישול ארוך מדי').optional().nullable(),
  servings: z.number().int('מספר מנות חייב להיות מספר שלם').min(1, 'לפחות מנה אחת').max(50, 'מספר מנות גבוה מדי').optional().nullable(),
  calories_per_serving: z.number().min(0, 'קלוריות למנה לא יכולות להיות שליליות').max(5000, 'ערך קלוריות לא סביר').optional().nullable(),
  protein_per_serving: z.number().min(0, 'חלבון למנה לא יכול להיות שלילי').max(200, 'ערך חלבון לא סביר').optional().nullable(),
  carbs_per_serving: z.number().min(0, 'פחמימות למנה לא יכולות להיות שליליות').max(500, 'ערך פחמימות לא סביר').optional().nullable(),
  fat_per_serving: z.number().min(0, 'שומן למנה לא יכול להיות שלילי').max(200, 'ערך שומן לא סביר').optional().nullable(),
  category: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'smoothie'], {
    errorMap: () => ({ message: 'קטגוריה לא תקינה' })
  }).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'רמת קושי לא תקינה' })
  }).optional(),
  is_vegetarian: z.boolean().optional(),
  is_vegan: z.boolean().optional(),
  is_gluten_free: z.boolean().optional(),
  is_dairy_free: z.boolean().optional(),
});

export const challengeSchema = z.object({
  title: z.string().min(1, 'כותרת האתגר היא שדה חובה').max(200, 'כותרת האתגר ארוכה מדי'),
  description: z.string().min(1, 'תיאור האתגר הוא שדה חובה').max(1000, 'תיאור האתגר ארוך מדי'),
  challenge_type: z.enum(['nutrition', 'workout', 'weight_loss', 'other'], {
    errorMap: () => ({ message: 'סוג אתגר לא תקין' })
  }),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך התחלה לא תקין'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך סיום לא תקין'),
  goal_value: z.number().optional().nullable(),
  goal_unit: z.string().max(50, 'יחידת מדידה ארוכה מדי').optional().nullable(),
  max_participants: z.number().int('מספר משתתפים חייב להיות מספר שלם').min(1, 'לפחות משתתף אחד').max(1000, 'מספר משתתפים גבוה מדי').optional().nullable(),
});

export const notificationSchema = z.object({
  title: z.string().min(1, 'כותרת ההתראה היא שדה חובה').max(200, 'כותרת ההתראה ארוכה מדי'),
  content: z.string().min(1, 'תוכן ההתראה הוא שדה חובה').max(1000, 'תוכן ההתראה ארוך מדי'),
  type: z.enum([
    'general',
    'weekly_report',
    'inactive_alert',
    'achievement',
    'new_trainee',
    'new_log',
    'new_metric',
    'challenge_join',
    'challenge_submission',
    'message'
  ], {
    errorMap: () => ({ message: 'סוג התראה לא תקין' })
  }),
});

export function validateField(schema, fieldName, value) {
  try {
    const fieldSchema = schema.shape[fieldName];
    if (!fieldSchema) return { success: true };

    fieldSchema.parse(value);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.errors[0]?.message || 'ערך לא תקין'
    };
  }
}

export function validateForm(schema, data) {
  try {
    schema.parse(data);
    return { success: true, data };
  } catch (error) {
    const errors = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    return { success: false, errors };
  }
}
