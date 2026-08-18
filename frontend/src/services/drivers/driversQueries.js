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
import { invalidateFleetQueries } from '../queryInvalidation.js';

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
    onSuccess: () => invalidateFleetQueries(queryClient),
  });
}

export function useUpdateDriver() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    // แก้ชื่อ/เบอร์คนขับแล้ว ชื่อที่โชว์อยู่ในตารางรถ (คอลัมน์คนขับ) ก็ค้างได้เหมือนกัน จึงต้อง invalidate กว้างๆ ด้วย
    mutationFn: ({ id, data }) => updateDriver(user?.token, id, data),
    onSuccess: () => invalidateFleetQueries(queryClient),
  });
}

export function useDeleteDriver() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    // ลบคนขับแล้ว backend จะเคลียร์ driver_id ของรถที่คนขับคนนี้ดูแลอยู่ด้วย ต้อง invalidate รายการรถตามไปด้วย
    mutationFn: (id) => deleteDriver(user?.token, id),
    onSuccess: () => invalidateFleetQueries(queryClient),
  });
}

export function useRestoreDriver() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => restoreDriver(user?.token, id),
    onSuccess: () => invalidateFleetQueries(queryClient),
  });
}
