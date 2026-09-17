export function formatNewsDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const NEWS_STATUS_LABEL = {
  PENDING: "Chờ duyệt",
  PUBLISHED: "Đã đăng",
  REJECTED: "Từ chối",
};

export function getRoleName() {
  return (localStorage.getItem("roleName") || "").toUpperCase();
}

export function getCurrentUsername() {
  return localStorage.getItem("userName") || "";
}

/** Hiện chỉ ADMIN quản lý / đăng tin (theo yêu cầu lead) */
export function canManageNews() {
  return getRoleName() === "ADMIN";
}

export function isAdminRole() {
  return getRoleName() === "ADMIN";
}

export function isStaffRole() {
  return getRoleName() === "STAFF";
}

/** Admin sửa/xóa mọi bài */
export function canEditOrDeleteNews() {
  return isAdminRole();
}

export function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
