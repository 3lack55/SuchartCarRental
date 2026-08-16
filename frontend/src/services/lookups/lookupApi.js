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