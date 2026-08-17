import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  restoreDriver,
} from './driversApi.js';
import { useAuth } from '../../context/auth/useAuth.js';

export const driverKeys = {
  all: ['drivers'],
  list: (token, search, includeInactive) => ['drivers', token, { search, includeInactive }],
  detail: (token, id) => ['driver', token, id],
};

export function useDrivers({ search, includeInactive } = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: driverKeys.list(user?.token, search, includeInactive),
    queryFn: () => getDrivers(user.token, { search, includeInactive }),
    enabled: Boolean(user?.token),
  });
}

export function useDriver(id) {
  const { user } = useAuth();

  return useQuery({
    queryKey: driverKeys.detail(user?.token, id),
    queryFn: () => getDriverById(user.token, id),
    enabled: Boolean(user?.token && id),
  });
}

export function useCreateDriver() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createDriver(user?.token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
  });
}

export function useUpdateDriver() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateDriver(user?.token, id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.detail(user?.token, id) });
    },
  });
}

export function useDeleteDriver() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteDriver(user?.token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
  });
}

export function useRestoreDriver() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => restoreDriver(user?.token, id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.detail(user?.token, id) });
    },
  });
}
