export function formatVnd(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export function extractCategories(items = []) {
  const map = new Map();
  items.forEach((item) => {
    if (item?.categoryId != null && item?.categoryName) {
      map.set(String(item.categoryId), {
        categoryId: item.categoryId,
        categoryName: item.categoryName,
      });
    }
  });
  return Array.from(map.values()).sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName, "vi")
  );
}

export function canManageItems() {
  const role = (localStorage.getItem("roleName") || "").toUpperCase();
  return role === "ADMIN" || role === "STAFF";
}

/** Thêm / sửa thông tin món — chỉ ADMIN */
export function canEditItems() {
  const role = (localStorage.getItem("roleName") || "").toUpperCase();
  return role === "ADMIN";
}

export function availabilityLabel(isAvailable) {
  return isAvailable ? "Đang bán" : "Ngưng bán";
}
