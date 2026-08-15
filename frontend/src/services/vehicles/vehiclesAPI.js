import { API_BASE_URL } from "../../config/api.js";
import { requestJson } from "../apiClient.js";

export function getVehicles(token, { search } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  const qs = params.toString();
  return requestJson(`${API_BASE_URL}/api/vehicles${qs ? `?${qs}` : ''}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getVehicleById(token, id) {
  return requestJson(`${API_BASE_URL}/api/vehicles/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createVehicle(token, data) {
  return requestJson(`${API_BASE_URL}/api/vehicles`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
}

export function updateVehicle(token, id, data) {
  return requestJson(`${API_BASE_URL}/api/vehicles/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
}

export function deleteVehicle(token, id) {
  return requestJson(`${API_BASE_URL}/api/vehicles/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}