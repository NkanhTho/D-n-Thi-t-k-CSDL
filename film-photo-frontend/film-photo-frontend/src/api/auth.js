// Khớp với authController thật của nhóm:
//   POST /api/auth/register  { name, email, password, role }
//   POST /api/auth/login     { email, password } -> { token, role }
import { request } from "./client";

export function register({ name, email, password, role }) {
  return request("/auth/register", {
    method: "POST",
    body: { name, email, password, role },
  });
}

export function login({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}
