import axios from "axios";

// Đường dẫn cơ sở của Backend Spring Boot
const API_BASE_URL = "/api/v1";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Bổ sung: xử lý 403 (đặc biệt mật khẩu quá hạn) — không thay request interceptor cũ
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const msg =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : "") ||
      "";

    if (status === 403) {
      const needPasswordChange =
        /mật khẩu/i.test(msg) && /quá hạn|đổi mật khẩu/i.test(msg);
      if (
        needPasswordChange &&
        !window.location.pathname.includes("/change-password")
      ) {
        import("../utils/toast").then(({ notifyWarn }) => {
          notifyWarn(msg || "Vui lòng đổi mật khẩu để tiếp tục.");
        });
        window.location.assign("/change-password");
      } else if (!needPasswordChange) {
        import("../utils/toast").then(({ notifyError }) => {
          notifyError(msg || "Bạn không có quyền thực hiện thao tác này.");
        });
      }
    }

    return Promise.reject(error);
  },
);

export const loginApi = async (username, password) => {
  return await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
};

export const forgotPassword = async (email) => {
  return await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
};

export const verifyOtp = async (token) => {
  return await axios.post(`${API_BASE_URL}/auth/verify-otp`, { token });
};

export const resetPassword = async (token, newPassword) => {
  return await axios.post(`${API_BASE_URL}/auth/reset-password`, {
    token,
    newPassword,
  });
};

export const getCurrentUserProfile = async () => {
  return await axios.get(`${API_BASE_URL}/users/profile`);
};

export const checkPhoneAvailable = async (phoneNumber) => {
  return await axios.get(`${API_BASE_URL}/users/check-phone`, {
    params: { phoneNumber },
  });
};

export const updateProfile = async (profileData) => {
  return await axios.put(`${API_BASE_URL}/users/profile`, profileData);
};

export const changePassword = async (oldPassword, newPassword) => {
  return await axios.put(`${API_BASE_URL}/users/change-password`, {
    oldPassword,
    newPassword,
  });
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return await axios.post(`${API_BASE_URL}/users/profile/avatar`, formData);
};

// Gọi API lấy toàn bộ món ăn (menu đầy đủ, kèm danh mục + ảnh)
export const getAllItems = async () => {
  return await axios.get(`${API_BASE_URL}/items`);
};

export const getLatestItems = async () => {
  return await axios.get(`${API_BASE_URL}/items/latest`);
};

export const getBestSellerItems = async () => {
  return await axios.get(`${API_BASE_URL}/items/best-sellers`);
};

/* ===== Admin Items — theo API BE của Thống (/api/v1/admin/items) ===== */
export const getAdminItems = async () => {
  return await axios.get(`${API_BASE_URL}/admin/items`);
};

export const getAdminDeletedItems = async () => {
  return await axios.get(`${API_BASE_URL}/admin/items/deleted`);
};

export const getAdminItemById = async (id) => {
  return await axios.get(`${API_BASE_URL}/admin/items/${id}`);
};

export const createAdminItem = async ({
  itemCode,
  itemName,
  price,
  description,
  categoryId,
  newCategoryName,
  image,
}) => {
  const formData = new FormData();
  formData.append("itemCode", itemCode);
  formData.append("itemName", itemName);
  formData.append("price", String(price));
  if (description != null) formData.append("description", description);
  if (categoryId != null && categoryId !== "") {
    formData.append("categoryId", String(categoryId));
  }
  if (newCategoryName) formData.append("newCategoryName", newCategoryName);
  if (image) formData.append("image", image);
  return await axios.post(`${API_BASE_URL}/admin/items`, formData);
};

export const updateAdminItem = async (
  id,
  {
    itemCode,
    itemName,
    price,
    description,
    categoryId,
    newCategoryName,
    isAvailable,
    image,
  },
) => {
  const formData = new FormData();
  if (itemCode != null) formData.append("itemCode", itemCode);
  if (itemName != null) formData.append("itemName", itemName);
  if (price != null && price !== "") formData.append("price", String(price));
  if (description != null) formData.append("description", description);
  if (categoryId != null && categoryId !== "") {
    formData.append("categoryId", String(categoryId));
  }
  if (newCategoryName) formData.append("newCategoryName", newCategoryName);
  if (typeof isAvailable === "boolean") {
    formData.append("isAvailable", String(isAvailable));
  }
  if (image) formData.append("image", image);
  return await axios.post(`${API_BASE_URL}/admin/items/${id}`, formData);
};

export const deleteAdminItem = async (id) => {
  return await axios.delete(`${API_BASE_URL}/admin/items/${id}`);
};

export const restoreAdminItem = async (id) => {
  return await axios.put(`${API_BASE_URL}/admin/items/${id}/restore`);
};

export const getNewsList = async (page = 0, size = 6) => {
  return await axios.get(`${API_BASE_URL}/news`, { params: { page, size } });
};

export const getNewsById = async (id) => {
  return await axios.get(`${API_BASE_URL}/news/${id}`);
};

export const getAdminNewsList = async (page = 0, size = 10) => {
  return await axios.get(`${API_BASE_URL}/news/admin/all`, {
    params: { page, size },
  });
};

export const getAdminNewsById = async (id) => {
  return await axios.get(`${API_BASE_URL}/news/${id}`);
};

export const getStaffNews = async (page = 0, size = 10) => {
  return await axios.get(`${API_BASE_URL}/news/my-news`, {
    params: { page, size },
  });
};

export const getStaffFeed = async (page = 0, size = 10) => {
  return await axios.get(`${API_BASE_URL}/news/staff/feed`, {
    params: { page, size },
  });
};

export const createNews = async ({ title, summary, content, image }) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("summary", summary || "");
  formData.append("content", content);
  if (image) formData.append("image", image);
  return await axios.post(`${API_BASE_URL}/news`, formData);
};

export const updateNews = async (
  id,
  { title, summary, content, imageUrl, image },
) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("summary", summary || "");
  formData.append("content", content);
  formData.append("imageUrl", imageUrl);
  if (image) formData.append("image", image);
  return await axios.put(`${API_BASE_URL}/news/${id}`, formData);
};

export const deleteNews = async (id) => {
  return await axios.delete(`${API_BASE_URL}/news/${id}`);
};

export const changeNewsStatus = async (id, status) => {
  return await axios.put(`${API_BASE_URL}/news/${id}/status`, null, {
    params: { status },
  });
};

/* Các API gọi món tại bàn — theo tài liệu mới, nằm dưới /api/v1/items */
const CUSTOMER_URL = `${API_BASE_URL}/customer`;

// API 1: Thêm món vào giỏ tạm thời (note là tuỳ chọn)
export const addItemToCart = async (tableId, itemId, quantity, note) => {
  const params = { tableId, itemId, quantity };
  if (note) params.note = note;
  return await axios.post(`${CUSTOMER_URL}/cart/add`, params, {
    headers: { "Content-Type": "application/json" },
  });
};

// API 2: Xem tất cả món trong giỏ hàng tạm thời (PENDING)
export const getCart = async (tableId) => {
  return await axios.get(`${CUSTOMER_URL}/cart/${tableId}`);
};

// API 3: [GỌI MÓN] chốt đơn gửi xuống bếp (PENDING -> CONFIRMED)
export const confirmOrder = async (tableId) => {
  return await axios.post(`${CUSTOMER_URL}/confirm-order`, null, {
    params: { tableId },
  });
};

// API 4: Xem lịch sử các món đã gọi xuống bếp (CONFIRMED / SERVED / CANCELLED)
export const getOrderHistory = async (tableId) => {
  return await axios.get(`${CUSTOMER_URL}/invoice-summary/${tableId}`);
};

// API 5: Xem chi tiết tổng quan hóa đơn
export const getInvoice = async (tableId, tableOrderId) => {
  return await axios.get(`${CUSTOMER_URL}/invoice-summary/${tableId}`);
};

// API 6: Yêu cầu thanh toán
// paymentMethod: "CASH" | "BANK_TRANSFER" | "MOMO" | "VNPAY" (bắt buộc VIẾT HOA)
export const requestCheckout = async (tableId, paymentMethod) => {
  return await axios.post(`${CUSTOMER_URL}/request-checkout`, null, {
    params: { tableId, paymentMethod },
  });
};

// API 7: Các yêu cầu dịch vụ khác (gọi nhân viên...)
// status: vd "CALLING_WAITER"
export const callService = async (tableId, status = "CALLING_WAITER") => {
  return await axios.post(`${CUSTOMER_URL}/call-service`, null, {
    params: { tableId, status },
  });
};

// API 8: Thay đổi số lượng món
export const updateItemQuantity = async (
  tableId,
  itemId,
  note,
  newQuantity,
) => {
  return await axios.put(`${CUSTOMER_URL}/cart/items/${itemId}`, null, {
    params: { tableId, quantity: newQuantity },
  });
};

// API 9: Xóa món khỏi giỏ hàng
export const removeItem = async (tableId, itemId) => {
  return await axios.delete(`${CUSTOMER_URL}/cart/items/${itemId}`, {
    params: { tableId, itemId },
  });
};

// API 10: Lấy QR code thanh toán
export const getPaymentQRCode = async (tableId) => {
  return await axios.post(`${CUSTOMER_URL}/payment/paypal`, null, {
    params: { tableId },
  });
};

// API 11: thanh toán tiền mặt
export const payWithCash = async (tableId) => {
  return await axios.post(`${CUSTOMER_URL}/payment/cash`, null, {
    params: { tableId },
  });
};

// API: gửi feedback của khách hàng
export const sentFeedback = async (
  content,
  rating,
  orderId,
  senderName,
  email,
  imageFile,
  itemId,
) => {
  const formData = new FormData();
  formData.append("content", content);
  formData.append("rating", rating);
  formData.append("orderId", orderId);
  formData.append("senderName", senderName);
  formData.append("email", email);
  formData.append("itemId", itemId);
  if (imageFile) {
    formData.append("imageFile", imageFile);
  }
  return await axios.post(`${CUSTOMER_URL}/feedbacks`, formData);
};
// API cho nhân viên

// API 12: lấy thông tin tất cả các bàn
export const getAllTableInfo = async () => {
  return await axios.get(`${API_BASE_URL}/staff/tables`);
};

// API 13: xác nhận thanh toán
export const approvePayment = async (tableId) => {
  return await axios.post(
    `${API_BASE_URL}/staff/tables/${tableId}/approve-payment`,
  );
};

// API 14: lấy thông tin chi tiết hóa đơn của bàn
export const getTablesInvoice = async (tableId) => {
  return await axios.get(
    `${API_BASE_URL}/staff/tables/${tableId}/order-details`,
  );
};

// API 15: lấy thông tin chi tiết các đơn còn active
export const getActiveOrder = async (tableId) => {
  return await axios.get(
    `${API_BASE_URL}/staff/tables/${tableId}/active-order`,
  );
};

// API 16: lấy toan bộ feedbacks của khách hàng
export const getAllFeedbacks = async () => {
  return await axios.get(`${API_BASE_URL}/staff/feedbacks`);
};

// API 17: lấy feedbacks của một món cụ thể
export const getItemFeedbacks = async (itemId) => {
  return await axios.get(`${API_BASE_URL}/customer/feedbacks/item/${itemId}`);
};

// API 18: xác nhận đơn hàng của khách (chuyển trạng thái từ PENDING -> CONFIRMED)
export const staffConfirmOrder = async (tableOrderId) => {
  return await axios.put(
    `${API_BASE_URL}/staff/tables/${tableOrderId}/confirm-all`,
  );
};

// API 19: xác nhận phục vụ món ăn (chuyển trạng thái từ CONFIRMED -> SERVED)
export const staffServeTable = async (tableId) => {
  return await axios.put(`${API_BASE_URL}/staff/tables/${tableId}/serve-all`);
};

// API 20: chỉnh sửa đơn hàng của bàn
export const staffEditOrderedItem = async (
  tableId,
  orderDetailId,
  quantity,
  note,
) => {
  return await axios.put(
    `${API_BASE_URL}/staff/tables/${tableId}/order-details/${orderDetailId}`,
    null,
    {
      params: { quantity, note },
    },
  );
};

// API 21: xóa đơn hàng của bàn
export const staffDeleteOrderedItem = async (tableId, orderDetailId) => {
  return await axios.delete(
    `${API_BASE_URL}/staff/tables/${tableId}/order-details/${orderDetailId}`,
  );
};

// API: Cập nhật trạng thái phục vụ của bàn
export const updateTableServiceStatus = async (tableId, status) => {
  return await axios.put(
    `${API_BASE_URL}/staff/tables/${tableId}/status`,
    null,
    {
      params: { status },
    },
  );
};

export const sendAIPrompt = async (message) => {
  return await axios.post(`${API_BASE_URL}/chatbot/chat`, { message: message });
};

// API: Lấy danh sách hóa đơn (Admin / Staff)
export const getInvoicesList = async (params = {}) => {
  return await axios.get(`${API_BASE_URL}/admin/statistics/invoices`, {
    params,
  });
};

// API: Lấy chi tiết hóa đơn theo orderId (Admin / Staff)
export const getInvoiceDetailById = async (orderId) => {
  return await axios.get(
    `${API_BASE_URL}/admin/statistics/invoices/${orderId}`,
  );
};

// API: Lấy dữ liệu thống kê Dashboard (Admin)
export const getDashboardStats = async () => {
  return await axios.get(`${API_BASE_URL}/admin/statistics/dashboard`);
};

// API: Quản lý Nhân viên (Admin)
export const getAdminEmployees = async () => {
  return await axios.get(`${API_BASE_URL}/admin/employees`);
};

export const createAdminEmployee = async (formData) => {
  return await axios.post(`${API_BASE_URL}/admin/employees`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateAdminEmployee = async (id, formData) => {
  return await axios.post(`${API_BASE_URL}/admin/employees/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteAdminEmployee = async (id) => {
  return await axios.delete(`${API_BASE_URL}/admin/employees/${id}`);
};

// API: Quản lý Khách hàng (Admin)
export const getAdminCustomers = async () => {
  return await axios.get(`${API_BASE_URL}/admin/customers`);
};

export const createAdminCustomer = async (formData) => {
  return await axios.post(`${API_BASE_URL}/admin/customers`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateAdminCustomer = async (id, formData) => {
  return await axios.post(`${API_BASE_URL}/admin/customers/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteAdminCustomer = async (id) => {
  return await axios.delete(`${API_BASE_URL}/admin/customers/${id}`);
};

/* Helper: rút thông báo lỗi từ axios error để hiển thị lên UI */
const ERROR_MESSAGE_MAP = {
  "Old password is incorrect!": "Mật khẩu hiện tại không đúng.",
  "New password cannot be the same as the old password!":
    "Mật khẩu mới không được trùng mật khẩu cũ.",
  "Account does not exist!": "Tài khoản không tồn tại.",
  "Invalid input data, please check again.":
    "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.",
  "Mã OTP không hợp lệ.": "Mã OTP không hợp lệ.",
  "Mã OTP không hợp lệ": "Mã OTP không hợp lệ.",
  "Mã khôi phục đã hết hạn (quá 5 phút)!":
    "Mã OTP đã hết hạn (quá 5 phút). Vui lòng gửi lại mã mới.",
  "Mã khôi phục đã hết hạn(quá 5 phút)":
    "Mã OTP đã hết hạn (quá 5 phút). Vui lòng gửi lại mã mới.",
  "Phiên đổi mật khẩu không hợp lệ hoặc đã bị hủy.":
    "Phiên đổi mật khẩu không hợp lệ. Vui lòng xác thực OTP lại.",
  "Phiên đổi mật khẩu đã hết hạn (quá 5 phút)!":
    "Phiên đổi mật khẩu đã hết hạn. Vui lòng xác thực OTP lại.",
};

export const getApiErrorMessage = (err, fallback = "Đã có lỗi xảy ra.") => {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (
    status === 413 ||
    (err?.code === "ERR_NETWORK" &&
      /upload|multipart/i.test(String(err?.message || "")))
  ) {
    return "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.";
  }

  if (
    typeof data === "string" &&
    /Maximum upload size exceeded|MaxUploadSizeExceeded/i.test(data)
  ) {
    return "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.";
  }
  if (
    data?.message &&
    /Maximum upload size exceeded|MaxUploadSizeExceeded/i.test(data.message)
  ) {
    return "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.";
  }
  if (
    data?.error &&
    /Maximum upload size exceeded|MaxUploadSizeExceeded/i.test(data.error)
  ) {
    return "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.";
  }
  if (data?.validationErrors && typeof data.validationErrors === "object") {
    const fieldMessages = Object.values(data.validationErrors).filter(Boolean);
    if (fieldMessages.length > 0) {
      return fieldMessages.join(". ");
    }
  }
  const raw =
    data?.message ||
    data?.error ||
    (typeof data === "string" ? data : null) ||
    err?.message ||
    fallback;

  if (typeof raw === "string") {
    const technical =
      /JSON parse error|Cannot construct instance|HttpMessageNotReadable|nested exception|class com\./i.test(
        raw,
      );
    if (technical) {
      return fallback;
    }
  }

  return ERROR_MESSAGE_MAP[raw] || raw;
};
