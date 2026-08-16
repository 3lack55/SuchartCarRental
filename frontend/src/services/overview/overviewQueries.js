import { useQuery } from '@tanstack/react-query';
import { getOverview } from './overviewApi.js';
import { useAuth } from '../../context/auth/useAuth.js';

export function useOverview() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['overview', user?.token],
    queryFn: () => getOverview(user.token),
    enabled: Boolean(user?.token),
  });
}
