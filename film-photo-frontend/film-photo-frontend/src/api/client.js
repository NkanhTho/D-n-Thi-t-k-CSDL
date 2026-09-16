// Lớp gọi API duy nhất của toàn bộ app.
// Mọi file trong /api chỉ nên đi qua request() ở đây — không gọi
// fetch() trực tiếp trong component/page.
//
// Khi nhóm chốt lại path/base URL thật, chỉ cần sửa VITE_API_BASE
// trong .env — không phải sửa code UI.

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

const TOKEN_KEY = "fp_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

/**
 * request("/users/me")
 * request("/auth/login", { method: "POST", body: { email, password } })
 */
export async function request(path, { method = "GET", body, auth = false, signal } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (!token) throw new ApiError("Bạn cần đăng nhập để thực hiện thao tác này.", 401);
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (networkErr) {
    throw new ApiError(
      "Không thể kết nối tới backend. Kiểm tra VITE_API_BASE trong .env và server có đang chạy không.",
      0
    );
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = data?.error || data?.message || `Lỗi ${res.status}`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}
