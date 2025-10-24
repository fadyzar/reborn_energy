import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NutritionLog } from '@/api/entities';

export function useNutritionLogs(userId, date) {
  return useQuery({
    queryKey: ['nutrition-logs', userId, date],
    queryFn: async () => {
      if (!userId || !date) return [];
      return await NutritionLog.filter({ user_id: userId, date });
    },
    enabled: !!userId && !!date,
  });
}

export function useWeeklyNutritionLogs(userId) {
  return useQuery({
    queryKey: ['nutrition-logs', userId, 'weekly'],
    queryFn: async () => {
      if (!userId) return [];
      return await NutritionLog.filter({ user_id: userId }, '-date', 50);
    },
    enabled: !!userId,
  });
}

export function useCreateNutritionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logData) => {
      return await NutritionLog.create(logData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-logs'] });
    },
  });
}

export function useUpdateNutritionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return await NutritionLog.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-logs'] });
    },
  });
}

export function useDeleteNutritionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      return await NutritionLog.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-logs'] });
    },
  });
}
