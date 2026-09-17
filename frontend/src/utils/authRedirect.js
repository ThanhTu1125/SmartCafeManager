/**
 * Điều hướng sau login theo vai trò — tránh vào trang không đúng quyền (403 API).
 */
export function getPostLoginPath(roleName, requirePasswordChange) {
  if (requirePasswordChange) {
    return "/change-password";
  }

  const role = String(roleName || "").toUpperCase();

  if (role === "ADMIN") {
    return "/admin/revenue";
  }

  if (role === "STAFF") {
    return "/sale-manager";
  }

  // USER / khách
  return "/home";
}

/**
 * Lấy đường dẫn trang chủ phù hợp với vai trò hiện tại (Admin -> /admin/revenue, Staff -> /sale-manager, Khách -> /home)
 */
export function getHomePath() {
  const role = String(localStorage.getItem("roleName") || "").toUpperCase();
  if (role === "ADMIN") {
    return "/admin/revenue";
  }
  if (role === "STAFF") {
    return "/sale-manager";
  }
  return "/home";
}
