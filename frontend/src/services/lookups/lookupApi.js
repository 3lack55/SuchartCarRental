import { API_BASE_URL } from "../../config/api.js";
import { requestJson } from "../apiClient.js";

export function getProvinces() {
  return requestJson(`${API_BASE_URL}/api/lookups/provinces`, {
    method: "GET",
  });
}

export function getVehicleTypes() {
  return requestJson(`${API_BASE_URL}/api/lookups/vehicle-types`, {
    method: "GET",
  });
}

export function getServiceCatalog() {
  return requestJson(`${API_BASE_URL}/api/lookups/service-catalog`, {
    method: "GET",
  });
}

export function getViolationReasons() {
  return requestJson(`${API_BASE_URL}/api/lookups/violation-reasons`, {
    method: "GET",
  });
}

// ---------- ประเภทรถ ----------

export function createVehicleType(token, name) {
  return requestJson(`${API_BASE_URL}/api/lookups/vehicle-types`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: { name },
  });
}

export function updateVehicleType(token, id, name) {
  return requestJson(`${API_BASE_URL}/api/lookups/vehicle-types/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: { name },
  });
}

export function deleteVehicleType(token, id) {
  return requestJson(`${API_BASE_URL}/api/lookups/vehicle-types/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---------- สาเหตุการฝ่าฝืนกฎจราจร ----------

export function createViolationReason(token, name) {
  return requestJson(`${API_BASE_URL}/api/lookups/violation-reasons`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: { name },
  });
}

export function updateViolationReason(token, id, name) {
  return requestJson(`${API_BASE_URL}/api/lookups/violation-reasons/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: { name },
  });
}

export function deleteViolationReason(token, id) {
  return requestJson(`${API_BASE_URL}/api/lookups/violation-reasons/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---------- ประเภทบริการซ่อมบำรุง ----------

export function createServiceType(token, name) {
  return requestJson(`${API_BASE_URL}/api/lookups/service-types`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: { name },
  });
}

export function updateServiceType(token, id, name) {
  return requestJson(`${API_BASE_URL}/api/lookups/service-types/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: { name },
  });
}

export function deleteServiceType(token, id) {
  return requestJson(`${API_BASE_URL}/api/lookups/service-types/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---------- หมวดหมู่บริการซ่อมบำรุง ----------

export function createServiceCategory(token, name, serviceTypeId) {
  return requestJson(`${API_BASE_URL}/api/lookups/service-categories`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: { name, service_type_id: serviceTypeId },
  });
}

export function updateServiceCategory(token, id, name, serviceTypeId) {
  return requestJson(`${API_BASE_URL}/api/lookups/service-categories/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: { name, service_type_id: serviceTypeId },
  });
}

export function deleteServiceCategory(token, id) {
  return requestJson(`${API_BASE_URL}/api/lookups/service-categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---------- รายการบริการซ่อมบำรุง ----------

export function createServiceItem(token, name, categoryId) {
  return requestJson(`${API_BASE_URL}/api/lookups/service-items`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: { name, service_category_id: categoryId },
  });
}

export function updateServiceItem(token, id, name, categoryId) {
  return requestJson(`${API_BASE_URL}/api/lookups/service-items/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: { name, service_category_id: categoryId },
  });
}

export function deleteServiceItem(token, id) {
  return requestJson(`${API_BASE_URL}/api/lookups/service-items/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}