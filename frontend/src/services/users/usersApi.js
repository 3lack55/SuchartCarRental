import { API_BASE_URL } from "../../config/api.js";
import { requestJson } from "../apiClient.js";

export function getUsers(token) {
  return requestJson(`${API_BASE_URL}/api/users`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createUser(token, data) {
  return requestJson(`${API_BASE_URL}/api/users`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
}

export function updateUserRole(token, id, role) {
  return requestJson(`${API_BASE_URL}/api/users/${id}/role`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: { role },
  });
}

export function updateUserStatus(token, id, is_active) {
  return requestJson(`${API_BASE_URL}/api/users/${id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: { is_active },
  });
}

export function resetUserPassword(token, id, newPassword) {
  return requestJson(`${API_BASE_URL}/api/users/${id}/password`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: { newPassword },
  });
}
