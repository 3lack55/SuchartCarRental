import { API_BASE_URL } from "../../config/api";
import { requestJson } from "../apiClient";

export function getMaintenances(token, { search, vehicleId } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (vehicleId) params.set('vehicle_id', vehicleId);
    const qs = params.toString();
    return requestJson(`${API_BASE_URL}/api/maintenances${qs ? `?${qs}` : ''}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getMaintenanceById(token, id) {
    return requestJson(`${API_BASE_URL}/api/maintenances/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function createMaintenance(token, data) {
    return requestJson(`${API_BASE_URL}/api/maintenances`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
    });
}

export function updateMaintenance(token, id, data) {
    return requestJson(`${API_BASE_URL}/api/maintenances/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
    });
}

export function deleteMaintenance(token, id) {
    return requestJson(`${API_BASE_URL}/api/maintenances/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
}