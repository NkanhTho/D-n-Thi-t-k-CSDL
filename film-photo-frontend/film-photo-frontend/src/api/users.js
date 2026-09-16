// Khớp với userController thật của nhóm:
//   GET /api/users/me  (cần token) -> { id, name, email, role, phone }
//   PUT /api/users/me  { name, phone }
import { request } from "./client";

export function getMe() {
  return request("/users/me", { auth: true });
}

export function updateMe({ name, phone }) {
  return request("/users/me", {
    method: "PUT",
    auth: true,
    body: { name, phone },
  });
}
