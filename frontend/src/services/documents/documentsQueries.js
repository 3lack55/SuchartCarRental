import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getDocuments,
    getDocumentById,
    getDocumentHistory,
    createDocument,
    updateDocument,
    deleteDocument,
} from './documentsApi.js';
import { useAuth } from '../../context/auth/useAuth.js';
import { invalidateFleetQueries } from '../queryInvalidation.js';

export const documentKeys = {
    all: ['documents'],
    list: (token, params) => ['documents', token, params],
    detail: (token, type, id) => ['document', token, type, id],
    history: (token, type, vehicleId) => ['document-history', token, type, vehicleId],
};

export function useDocuments({ search, documentType, status } = {}) {
    const { user } = useAuth();

    return useQuery({
        queryKey: documentKeys.list(user?.token, { search, documentType, status }),
        queryFn: () => getDocuments(user.token, { search, documentType, status }),
        enabled: Boolean(user?.token),
    });
}

export function useDocument(documentType, documentId) {
    const { user } = useAuth();

    return useQuery({
        queryKey: documentKeys.detail(user?.token, documentType, documentId),
        queryFn: () => getDocumentById(user.token, documentType, documentId),
        enabled: Boolean(user?.token && documentType && documentId),
    });
}

export function useDocumentHistory(documentType, vehicleId, { enabled = true } = {}) {
    const { user } = useAuth();

    return useQuery({
        queryKey: documentKeys.history(user?.token, documentType, vehicleId),
        queryFn: () => getDocumentHistory(user.token, documentType, vehicleId),
        enabled: Boolean(user?.token && documentType && vehicleId && enabled),
    });
}

export function useCreateDocument() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        // เอกสารใหม่กระทบสถานะ "เอกสารไม่สมบูรณ์" ในหน้ารถ (ทั้งการ์ดสรุปและไอคอนเตือนรายแถว) และภาพรวม
        mutationFn: (data) => createDocument(user?.token, data),
        onSuccess: () => invalidateFleetQueries(queryClient),
    });
}

export function useUpdateDocument() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ documentType, documentId, data }) => updateDocument(user?.token, documentType, documentId, data),
        onSuccess: () => invalidateFleetQueries(queryClient),
    });
}

export function useDeleteDocument() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ documentType, documentId }) => deleteDocument(user?.token, documentType, documentId),
        onSuccess: () => invalidateFleetQueries(queryClient),
    });
}
