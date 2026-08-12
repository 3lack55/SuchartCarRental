import { API_BASE_URL } from "../../config/api.js";
import { requestJson } from "../apiClient.js";

export function getDrivers(token) {
  return requestJson(`${API_BASE_URL}/api/drivers/allDrivers`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}