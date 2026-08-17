import { API_BASE_URL } from "../../config/api.js";
import { requestJson } from "../apiClient.js";

export function getDrivers(token, { search, includeInactive } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (includeInactive) params.set('includeInactive', 'true');
  const qs = params.toString();
  return requestJson(`${API_BASE_URL}/api/drivers${qs ? `?${qs}` : ''}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getDriverById(token, id) {
  return requestJson(`${API_BASE_URL}/api/drivers/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createDriver(token, data) {
  return requestJson(`${API_BASE_URL}/api/drivers`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
}

export function updateDriver(token, id, data) {
  return requestJson(`${API_BASE_URL}/api/drivers/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
}

export function deleteDriver(token, id) {
  return requestJson(`${API_BASE_URL}/api/drivers/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function restoreDriver(token, id) {
  return requestJson(`${API_BASE_URL}/api/drivers/${id}/restore`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}