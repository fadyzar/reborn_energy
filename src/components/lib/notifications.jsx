
import { Notification } from "@/api/entities";

export const createCoachNotification = async (trainee, title, content, type) => {
  if (!trainee || !trainee.coach_id) {
    console.warn("Attempted to create notification for a trainee without a coach.", { trainee });
    return;
  }

  try {
    const { error } = await Notification.create({
      user_id: trainee.coach_id,
      title,
      message: content,
      is_read: false,
      type,
    });
    if (error) throw error;
    console.log(`Notification created for coach ${trainee.coach_id} of type ${type}`);
  } catch (error) {
    console.error("Failed to create coach notification:", error);
  }
};
