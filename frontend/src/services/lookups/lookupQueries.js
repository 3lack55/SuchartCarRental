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
    mutationFn: ({ name, color }) => createVehicleType(user?.token, name, color),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicleTypes'] }),
  });
}

export function useUpdateVehicleType() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, color }) => updateVehicleType(user?.token, id, name, color),
    // ชื่อ/สีประเภทรถถูกฝัง (join) มากับข้อมูลรถแต่ละคันตั้งแต่ตอน fetch แล้ว ไม่ใช่ค่าที่ไปหาใหม่แบบ live
    // เปลี่ยนชื่อ/สีที่นี่แล้วถ้าไม่ invalidate รายการ/รายละเอียดรถด้วย ป้ายประเภทรถจะค้างค่าเก่าไว้
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleTypes'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle'] });
    },
  });
}

export function useDeleteVehicleType() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteVehicleType(user?.token, id),
    // ลบประเภทรถที่ยังมีรถผูกอยู่ได้ (ON DELETE SET NULL) รถเหล่านั้นจะกลายเป็น "ไม่มีประเภท" ทันที
    // ต้อง invalidate รายการ/รายละเอียดรถด้วย ไม่งั้นป้ายประเภทเก่าจะยังค้างแสดงอยู่ทั้งที่ถูกลบไปแล้ว
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleTypes'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle'] });
    },
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
    mutationFn: ({ name, color }) => createServiceType(user?.token, name, color),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] }),
  });
}

export function useUpdateServiceType() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, color }) => updateServiceType(user?.token, id, name, color),
    // ชื่อประเภทบริการถูกฝังเป็นข้อความมากับสรุป/รายการซ่อมของแต่ละใบซ่อมตั้งแต่ตอน fetch แล้ว
    // เปลี่ยนชื่อที่นี่แล้วถ้าไม่ invalidate รายการ/รายละเอียดใบซ่อมด้วย ข้อความในตารางจะค้างชื่อเก่าไว้
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] });
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
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
    // ชื่อหมวดหมู่ก็ถูกฝังไว้ในรายละเอียดใบซ่อม (view_maintenance_line_items) เช่นกัน
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
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
    // ชื่อรายการย่อยถูกฝังไว้ทั้งในตารางสรุป (รายละเอียด) และหน้ารายละเอียดใบซ่อม
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCatalog'] });
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
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
