import { API_BASE_URL } from "../../config/api.js";
import { requestJson } from "../apiClient.js";

export function getVehicles(token) {
  return requestJson(`${API_BASE_URL}/api/vehicles/allVehicles`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}