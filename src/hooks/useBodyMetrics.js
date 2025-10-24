import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BodyMetrics } from '@/api/entities';

export function useBodyMetrics(userId) {
  return useQuery({
    queryKey: ['body-metrics', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await BodyMetrics.filter({ user_id: userId }, '-date', 30);
    },
    enabled: !!userId,
  });
}

export function useLatestBodyMetrics(userId) {
  return useQuery({
    queryKey: ['body-metrics', userId, 'latest'],
    queryFn: async () => {
      if (!userId) return null;
      const metrics = await BodyMetrics.filter({ user_id: userId }, '-date', 1);
      return metrics.length > 0 ? metrics[0] : null;
    },
    enabled: !!userId,
  });
}

export function useCreateBodyMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metricData) => {
      return await BodyMetrics.create(metricData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-metrics'] });
    },
  });
}

export function useUpdateBodyMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return await BodyMetrics.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-metrics'] });
    },
  });
}

export function useDeleteBodyMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      return await BodyMetrics.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-metrics'] });
    },
  });
}
