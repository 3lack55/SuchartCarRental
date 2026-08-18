import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from './mainTenanceApi.js';
import { useAuth } from '../../context/auth/useAuth.js';
import { invalidateFleetQueries } from '../queryInvalidation.js';

export const maintenanceKeys = {
  all: ['maintenances'],
  list: (token, search) => ['maintenances', token, { search }],
  detail: (token, id) => ['maintenance', token, id],
};

export function useMaintenances({ search } = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: maintenanceKeys.list(user?.token, search),
    queryFn: () => getMaintenances(user.token, { search }),
    enabled: Boolean(user?.token),
  });
}

export function useMaintenance(id) {
  const { user } = useAuth();

  return useQuery({
    queryKey: maintenanceKeys.detail(user?.token, id),
    queryFn: () => getMaintenanceById(user.token, id),
    enabled: Boolean(user?.token && id),
  });
}

export function useCreateMaintenance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    // ใบซ่อมใหม่กระทบ "ประวัติซ่อมบำรุง" ในหน้ารายละเอียดรถ และยอดสรุปเดือนนี้ในหน้าภาพรวม
    mutationFn: (data) => createMaintenance(user?.token, data),
    onSuccess: () => invalidateFleetQueries(queryClient),
  });
}

export function useUpdateMaintenance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateMaintenance(user?.token, id, data),
    onSuccess: () => invalidateFleetQueries(queryClient),
  });
}

export function useDeleteMaintenance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteMaintenance(user?.token, id),
    onSuccess: () => invalidateFleetQueries(queryClient),
  });
}
