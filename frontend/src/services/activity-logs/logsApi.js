import { API_BASE_URL } from "../../config/api.js";
import { requestJson } from "../apiClient.js";

export function getActivityLogs(token, { search, action, userId, dateFrom, dateTo, page, limit } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (action) params.set('action', action);
  if (userId) params.set('userId', userId);
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);
  if (page) params.set('page', page);
  if (limit) params.set('limit', limit);
  const qs = params.toString();
  return requestJson(`${API_BASE_URL}/api/logs${qs ? `?${qs}` : ''}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
