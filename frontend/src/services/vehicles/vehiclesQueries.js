import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  restoreVehicle,
} from './vehiclesAPI.js';
import { useAuth } from '../../context/auth/useAuth.js';
import { invalidateFleetQueries } from '../queryInvalidation.js';

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
    // เพิ่มรถอาจผูกคนขับประจำและแนบเอกสาร (พรบ./ภาษี/ประกัน) มาพร้อมกันได้ จึงต้อง invalidate กว้างๆ
    mutationFn: (data) => createVehicle(user?.token, data),
    onSuccess: () => invalidateFleetQueries(queryClient),
  });
}

export function useUpdateVehicle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    // แก้ทะเบียน/คนขับประจำของรถ กระทบทั้งคนขับเก่า-ใหม่ และหน้าเอกสาร/ซ่อมบำรุงที่โชว์ทะเบียนรถ จึงต้อง invalidate กว้างๆ
    mutationFn: ({ id, data }) => updateVehicle(user?.token, id, data),
    onSuccess: () => invalidateFleetQueries(queryClient),
  });
}

export function useDeleteVehicle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    // ปลดระวางรถแล้ว รถต้องหายไปจากรายการ "รถที่ดูแล" ของคนขับที่เคยผูกอยู่ด้วย
    mutationFn: (id) => deleteVehicle(user?.token, id),
    onSuccess: () => invalidateFleetQueries(queryClient),
  });
}

export function useRestoreVehicle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => restoreVehicle(user?.token, id),
    onSuccess: () => invalidateFleetQueries(queryClient),
  });
}
