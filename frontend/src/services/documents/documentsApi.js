import { API_BASE_URL } from "../../config/api.js";
import { requestJson } from "../apiClient.js";

export function getDocuments(token, { search, documentType, status } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (documentType) params.set('document_type', documentType);
    if (status) params.set('status', status);
    const qs = params.toString();
    return requestJson(`${API_BASE_URL}/api/documents${qs ? `?${qs}` : ''}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getDocumentById(token, documentType, documentId) {
    return requestJson(`${API_BASE_URL}/api/documents/${documentType}/${documentId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getDocumentHistory(token, documentType, vehicleId) {
    return requestJson(`${API_BASE_URL}/api/documents/${documentType}/history/${vehicleId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function createDocument(token, data) {
    return requestJson(`${API_BASE_URL}/api/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
    });
}

export function updateDocument(token, documentType, documentId, data) {
    return requestJson(`${API_BASE_URL}/api/documents/${documentType}/${documentId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
    });
}

export function deleteDocument(token, documentType, documentId) {
    return requestJson(`${API_BASE_URL}/api/documents/${documentType}/${documentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
}
