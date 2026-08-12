import { API_BASE_URL } from "../../config/api.js";
import { requestJson } from "../apiClient.js";

export function getOverview(token) {
  return requestJson(`${API_BASE_URL}/api/overview`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}