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

// เอกสารกระทบภาพรวม (documents_expiring_30d_total ฯลฯ) จึงล้าง cache ของ overview ด้วยทุกครั้ง
function invalidateRelated(queryClient) {
    queryClient.invalidateQueries({ queryKey: documentKeys.all });
    queryClient.invalidateQueries({ queryKey: ['document'] });
    queryClient.invalidateQueries({ queryKey: ['document-history'] });
    queryClient.invalidateQueries({ queryKey: ['vehicle'] });
    queryClient.invalidateQueries({ queryKey: ['overview'] });
}

export function useCreateDocument() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => createDocument(user?.token, data),
        onSuccess: () => invalidateRelated(queryClient),
    });
}

export function useUpdateDocument() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ documentType, documentId, data }) => updateDocument(user?.token, documentType, documentId, data),
        onSuccess: () => invalidateRelated(queryClient),
    });
}

export function useDeleteDocument() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ documentType, documentId }) => deleteDocument(user?.token, documentType, documentId),
        onSuccess: () => invalidateRelated(queryClient),
    });
}
