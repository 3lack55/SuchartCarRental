import { API_BASE_URL } from "../../config/api.js";
import { requestJson } from "../apiClient.js";

export function getViolations(token, { search, driverId, vehicleId, isPaid } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (driverId) params.set('driver_id', driverId);
    if (vehicleId) params.set('vehicle_id', vehicleId);
    if (isPaid !== undefined) params.set('is_paid', String(isPaid));
    const qs = params.toString();
    return requestJson(`${API_BASE_URL}/api/violations${qs ? `?${qs}` : ''}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getViolationById(token, id) {
    return requestJson(`${API_BASE_URL}/api/violations/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function createViolation(token, data) {
    return requestJson(`${API_BASE_URL}/api/violations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
    });
}

export function updateViolation(token, id, data) {
    return requestJson(`${API_BASE_URL}/api/violations/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
    });
}

export function deleteViolation(token, id) {
    return requestJson(`${API_BASE_URL}/api/violations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
}
