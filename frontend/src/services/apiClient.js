export async function requestJson(path, options = {}) {
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const isUrlSearchParams = typeof URLSearchParams !== "undefined" && options.body instanceof URLSearchParams;
  const isPlainObject =
    hasBody &&
    typeof options.body === "object" &&
    !isFormData &&
    !isUrlSearchParams &&
    !(options.body instanceof Blob) &&
    !(options.body instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(options.body);

  const normalizedBody = isPlainObject ? JSON.stringify(options.body) : options.body;

  const headers = { ...options.headers };
  if (hasBody && !isFormData && !isUrlSearchParams && !headers["Content-Type"] && typeof normalizedBody === "string") {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(path, {
    ...options,
    body: normalizedBody,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok || data?.success === false) {
    const err = new Error(data?.message || `Request failed with status ${response.status}`);
    // data เสริม (เช่น { conflict: 'soft-deleted', entity, id }) ให้ผู้เรียกใช้ตัดสินใจต่อได้ นอกเหนือจาก message เฉยๆ
    err.data = data?.data;
    throw err;
  }

  return data;
}
