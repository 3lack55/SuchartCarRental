import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from './vehiclesAPI.js';
import { useAuth } from '../../context/auth/useAuth.js';

export const vehicleKeys = {
  all: ['vehicles'],
  list: (token, search, includeInactive) => ['vehicles', token, { search, includeInactive }],
  detail: (token, id) => ['vehicle', token, id],
};

export function useVehicles({ search, includeInactive } = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: vehicleKeys.list(user?.token, search, includeInactive),
    queryFn: () => getVehicles(user.token, { search, includeInactive }),
    enabled: Boolean(user?.token),
  });
}

export function useVehicle(id) {
  const { user } = useAuth();

  return useQuery({
    queryKey: vehicleKeys.detail(user?.token, id),
    queryFn: () => getVehicleById(user.token, id),
    enabled: Boolean(user?.token && id),
  });
}

export function useCreateVehicle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createVehicle(user?.token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}

export function useUpdateVehicle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVehicle(user?.token, id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(user?.token, id) });
    },
  });
}

export function useDeleteVehicle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteVehicle(user?.token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}
