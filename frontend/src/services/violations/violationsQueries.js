import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getViolations,
    getViolationById,
    createViolation,
    updateViolation,
    deleteViolation,
} from './violationsApi.js';
import { useAuth } from '../../context/auth/useAuth.js';

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

// การฝ่าฝืนกระทบทั้งรายการคนขับ/รถ (unpaid_violations) และภาพรวม จึงล้าง cache ที่เกี่ยวข้องให้หมดทุกครั้ง
function invalidateRelated(queryClient) {
    queryClient.invalidateQueries({ queryKey: violationKeys.all });
    queryClient.invalidateQueries({ queryKey: ['violation'] });
    queryClient.invalidateQueries({ queryKey: ['driver'] });
    queryClient.invalidateQueries({ queryKey: ['drivers'] });
    queryClient.invalidateQueries({ queryKey: ['vehicle'] });
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    queryClient.invalidateQueries({ queryKey: ['overview'] });
}

export function useCreateViolation() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => createViolation(user?.token, data),
        onSuccess: () => invalidateRelated(queryClient),
    });
}

export function useUpdateViolation() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateViolation(user?.token, id, data),
        onSuccess: () => invalidateRelated(queryClient),
    });
}

export function useDeleteViolation() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteViolation(user?.token, id),
        onSuccess: () => invalidateRelated(queryClient),
    });
}
