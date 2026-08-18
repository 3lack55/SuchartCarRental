import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getViolations,
    getViolationById,
    createViolation,
    updateViolation,
    deleteViolation,
} from './violationsApi.js';
import { useAuth } from '../../context/auth/useAuth.js';
import { invalidateFleetQueries } from '../queryInvalidation.js';

export const violationKeys = {
    all: ['violations'],
    list: (token, params) => ['violations', token, params],
    detail: (token, id) => ['violation', token, id],
};

export function useViolations({ search, driverId, vehicleId, isPaid } = {}) {
    const { user } = useAuth();

    return useQuery({
        queryKey: violationKeys.list(user?.token, { search, driverId, vehicleId, isPaid }),
        queryFn: () => getViolations(user.token, { search, driverId, vehicleId, isPaid }),
        enabled: Boolean(user?.token),
    });
}

export function useViolation(id) {
    const { user } = useAuth();

    return useQuery({
        queryKey: violationKeys.detail(user?.token, id),
        queryFn: () => getViolationById(user.token, id),
        enabled: Boolean(user?.token && id),
    });
}

export function useCreateViolation() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        // การฝ่าฝืนกระทบทั้งรายการคนขับ/รถ (unpaid_violations) และภาพรวม จึงล้าง cache ที่เกี่ยวข้องให้หมดทุกครั้ง
        mutationFn: (data) => createViolation(user?.token, data),
        onSuccess: () => invalidateFleetQueries(queryClient),
    });
}

export function useUpdateViolation() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateViolation(user?.token, id, data),
        onSuccess: () => invalidateFleetQueries(queryClient),
    });
}

export function useDeleteViolation() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteViolation(user?.token, id),
        onSuccess: () => invalidateFleetQueries(queryClient),
    });
}
