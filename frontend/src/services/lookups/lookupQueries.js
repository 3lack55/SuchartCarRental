import { useQuery } from '@tanstack/react-query';
import { getProvinces, getVehicleTypes, getServiceCatalog } from './lookupApi.js';

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
