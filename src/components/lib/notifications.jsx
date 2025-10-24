
import { base44 } from "@/api/base44Client";

/**
 * יוצר התראה למאמן על סמך פעולה של מתאמן.
 * @param {object} trainee - אובייקט המשתמש של המתאמן שביצע את הפעולה.
 * @param {string} title - כותרת ההתראה.
 * @param {string} content - תוכן ההתראה.
 * @param {string} type - סוג ההתראה (לצורך אייקון ומיון).
 */
export const createCoachNotification = async (trainee, title, content, type) => {
  if (!trainee || !trainee.coach_id) {
    console.warn("Attempted to create notification for a trainee without a coach.", { trainee });
    return;
  }

  try {
    await base44.entities.Notification.create({
      user_id: trainee.coach_id, // ההתראה מיועדת למאמן
      coach_id: trainee.coach_id, // שומרים את מזהה המאמן
      title,
      content,
      is_read: false,
      type,
    });
    console.log(`Notification created for coach ${trainee.coach_id} of type ${type}`);
  } catch (error) {
    console.error("Failed to create coach notification:", error);
  }
};
