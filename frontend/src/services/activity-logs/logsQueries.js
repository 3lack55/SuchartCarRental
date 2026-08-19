import { useQuery } from '@tanstack/react-query';
import { getActivityLogs } from './logsApi.js';
import { useAuth } from '../../context/auth/useAuth.js';

export const logKeys = {
  all: ['activity-logs'],
  list: (token, filters) => ['activity-logs', token, filters],
};

export function useActivityLogs(filters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: logKeys.list(user?.token, filters),
    queryFn: () => getActivityLogs(user.token, filters),
    enabled: Boolean(user?.token),
    placeholderData: (previousData) => previousData,
  });
}
