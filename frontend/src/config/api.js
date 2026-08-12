const HOST = import.meta.env.VITE_API_HOST || "localhost";
const PORT = import.meta.env.VITE_API_PORT || "3000";
const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL || "http";

export const API_BASE_URL = `${API_PROTOCOL}://${HOST}:${PORT}`;
