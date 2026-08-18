import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProvinces,
  getVehicleTypes,
  getServiceCatalog,
  getViolationReasons,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
  createViolationReason,
  updateViolationReason,
  deleteViolationReason,
  createServiceType,
  updateServiceType,
  deleteServiceType,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
} from './lookupApi.js';
import { useAuth } from '../../context/auth/useAuth.js';

// จังหวัด/ประเภทรถ/แคตตาล็อกบริการแทบไม่เปลี่ยนแปลง จึงตั้ง staleTime ยาวเพื่อลดการยิงซ้ำ
const LOOKUP_STALE_TIME = 24 * 60 * 60 * 1000;

export function useProvinces() {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: getProvinces,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useVehicleTypes() {
  return useQuery({
    queryKey: ['vehicleTypes'],
    queryFn: getVehicleTypes,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useServiceCatalog() {
  return useQuery({
    queryKey: ['serviceCatalog'],
    queryFn: getServiceCatalog,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useViolationReasons() {
  return useQuery({
    queryKey: ['violationReasons'],
    queryFn: getViolationReasons,
    staleTime: LOOKUP_STALE_TIME,
  });
}

// ---------- ประเภทรถ ----------

export function useCreateVehicleType() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name) => createVehicleType(user?.token, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicleTypes'] }),
  });
}

export function useUpdateVehicleType() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }) => updateVehicleType(user?.token, id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicleTypes'] }),
  });
}

export function useDeleteVehicleType() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteVehicleType(user?.token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicleTypes'] }),
  });
}

// ---------- สาเหตุการฝ่าฝืนกฎจราจร ----------

export function useCreateViolationReason() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name) => createViolationReason(user?.token, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['violationReasons'] }),
  });
}

export function useUpdateViolationReason() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }) => updateViolationReason(user?.token, id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['violationReasons'] }),
  });
}

export function useDeleteViolationReason() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteViolationReason(user?.token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['violationReasons'] }),
  });
}

// ---------- แคตตาล็อกบริการซ่อมบำรุง (type / category / item ใช้ query key เดียวกัน) ----------

export function useCreateServiceType() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name) => createServiceType(user?.token, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] }),
  });
}

export function useUpdateServiceType() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }) => updateServiceType(user?.token, id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] }),
  });
}

export function useDeleteServiceType() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteServiceType(user?.token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] }),
  });
}

export function useCreateServiceCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, serviceTypeId }) => createServiceCategory(user?.token, name, serviceTypeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] }),
  });
}

export function useUpdateServiceCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, serviceTypeId }) => updateServiceCategory(user?.token, id, name, serviceTypeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] }),
  });
}

export function useDeleteServiceCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteServiceCategory(user?.token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] }),
  });
}

export function useCreateServiceItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, categoryId }) => createServiceItem(user?.token, name, categoryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] }),
  });
}

export function useUpdateServiceItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, categoryId }) => updateServiceItem(user?.token, id, name, categoryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] }),
  });
}

export function useDeleteServiceItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteServiceItem(user?.token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] }),
  });
}
