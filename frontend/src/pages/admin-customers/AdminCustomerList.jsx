import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import MenuButton from "../../components/menu-button";
import { getHomePath } from "../../utils/authRedirect";
import {
  getAdminCustomers,
  createAdminCustomer,
  updateAdminCustomer,
  deleteAdminCustomer,
  getApiErrorMessage,
} from "../../services/apiService";
import { ToastService } from "../../services/toastService";

/* Định dạng ngày: yyyy-MM-dd -> dd/MM/yyyy */
const formatDate = (isoOrDate) => {
  if (!isoOrDate) return "—";
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return "—";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const GENDER_MAP = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

export default function AdminCustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState("");

  // Modal Form (Thêm / Sửa)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);

  // Modal Xóa
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "MALE",
    address: "",
    loyaltyPoints: 0,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Tải danh sách khách hàng
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminCustomers();
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách khách hàng:", err);
      ToastService.error(
        getApiErrorMessage(err, "Không thể tải danh sách khách hàng."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Lọc danh sách khách hàng theo từ khóa
  const filteredCustomers = useMemo(() => {
    return customers.filter((cus) => {
      const kw = searchKeyword.toLowerCase().trim();
      if (!kw) return true;
      return (
        cus.fullName?.toLowerCase().includes(kw) ||
        cus.username?.toLowerCase().includes(kw) ||
        cus.email?.toLowerCase().includes(kw) ||
        cus.phoneNumber?.includes(kw)
      );
    });
  }, [customers, searchKeyword]);

  // Mở modal Thêm mới
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      username: "",
      password: "",
      email: "",
      fullName: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "MALE",
      address: "",
      loyaltyPoints: 0,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setModalOpen(true);
  };

  // Mở modal Chỉnh sửa
  const handleOpenEdit = (cus) => {
    setEditingCustomer(cus);
    const dobFormatted = cus.dateOfBirth
      ? new Date(cus.dateOfBirth).toISOString().split("T")[0]
      : "";

    setFormData({
      username: cus.username || "",
      password: "", // Để trống nếu không muốn đổi mật khẩu
      email: cus.email || "",
      fullName: cus.fullName || "",
      phoneNumber: cus.phoneNumber || "",
      dateOfBirth: dobFormatted,
      gender: cus.gender || "MALE",
      address: cus.address || "",
      loyaltyPoints: cus.loyaltyPoints ?? 0,
    });
    setAvatarFile(null);
    setAvatarPreview(cus.imageUrl || null);
    setModalOpen(true);
  };

  // Thay đổi file ảnh đại diện
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        ToastService.error("Dung lượng ảnh tối đa 5MB.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Submit Form Lưu khách hàng
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      ToastService.error("Vui lòng nhập Tên đăng nhập.");
      return;
    }
    if (!editingCustomer && !formData.password.trim()) {
      ToastService.error("Vui lòng nhập Mật khẩu cho khách hàng mới.");
      return;
    }
    if (!formData.fullName.trim()) {
      ToastService.error("Vui lòng nhập Họ và tên khách hàng.");
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append("username", formData.username.trim());
      if (formData.password.trim()) {
        data.append("password", formData.password.trim());
      }
      if (formData.email?.trim()) {
        data.append("email", formData.email.trim());
      }
      data.append("fullName", formData.fullName.trim());
      if (formData.phoneNumber?.trim()) {
        data.append("phoneNumber", formData.phoneNumber.trim());
      }
      if (formData.dateOfBirth) {
        data.append("dateOfBirth", formData.dateOfBirth);
      }
      if (formData.gender) {
        data.append("gender", formData.gender);
      }
      if (formData.address?.trim()) {
        data.append("address", formData.address.trim());
      }
      if (formData.loyaltyPoints != null) {
        data.append("loyaltyPoints", formData.loyaltyPoints);
      }
      if (avatarFile) {
        data.append("image", avatarFile);
      }

      if (editingCustomer) {
        await updateAdminCustomer(editingCustomer.customerId, data);
        ToastService.success("Cập nhật thông tin khách hàng thành công!");
      } else {
        await createAdminCustomer(data);
        ToastService.success("Thêm khách hàng mới thành công!");
      }

      setModalOpen(false);
      await loadCustomers();
    } catch (err) {
      console.error("Lỗi khi lưu khách hàng:", err);
      ToastService.error(
        getApiErrorMessage(err, "Không thể lưu thông tin khách hàng."),
      );
    } finally {
      setSaving(false);
    }
  };

  // Xóa / Khóa khách hàng
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    setDeleting(true);
    try {
      await deleteAdminCustomer(deleteConfirmTarget.customerId);
      ToastService.success("Đã khóa tài khoản khách hàng thành công!");
      setDeleteConfirmTarget(null);
      await loadCustomers();
    } catch (err) {
      console.error("Lỗi khi xóa khách hàng:", err);
      ToastService.error(
        getApiErrorMessage(err, "Không thể xóa tài khoản khách hàng."),
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="employee-page">
      {/* ------------------------ TOPBAR ------------------------ */}
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <MenuButton />
          <Link to={getHomePath()} className="brand" title="Trang chủ">
            <Logo className="h-9 w-9" />
            <div className="brand-name">
              <span style={{ fontWeight: 700 }}>NEO</span>
              <span style={{ fontWeight: 400 }}>CAFÉ</span>
            </div>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              padding: "4px 12px",
              background: "#2A1E14",
              color: "#E7C9A1",
              fontWeight: 700,
              fontSize: "12px",
              borderRadius: "9999px",
            }}
          >
            ADMIN
          </div>
        </div>
      </header>

      {/* -------------------- NỘI DUNG CHÍNH -------------------- */}
      <main className="wrap">
        <div className="page-header-block">
          <div>
            <h2 className="page-title">Danh sách Khách hàng & Hội viên</h2>
          </div>

          <button
            type="button"
            className="btn-add-employee"
            onClick={handleOpenAdd}
          >
            <span>+</span>
            <span>Thêm khách hàng</span>
          </button>
        </div>

        {/* Thanh công cụ tìm kiếm */}
        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Tìm theo họ tên, username, email, số điện thoại..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>

        {/* Bảng danh sách khách hàng */}
        <div className="table-wrap">
          {loading ? (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#6E5C4A" }}
            >
              Đang tải danh sách khách hàng...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>⭐</div>
              <div
                style={{ fontWeight: 700, fontSize: "16px", color: "#2A1E14" }}
              >
                Không tìm thấy khách hàng nào
              </div>
              <div
                style={{ fontSize: "13px", color: "#6E5C4A", marginTop: "4px" }}
              >
                {searchKeyword
                  ? "Thử thay đổi từ khóa tìm kiếm."
                  : "Chưa có khách hàng nào trong hệ thống."}
              </div>
            </div>
          ) : (
            <table className="emp-table">
              <thead>
                <tr>
                  <th style={{ width: "240px" }}>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Điểm tích lũy</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right", width: "160px" }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cus) => (
                  <tr key={cus.customerId}>
                    {/* Cột Khách hàng: Avatar + Tên + Username */}
                    <td>
                      <div className="emp-avatar-cell">
                        {cus.imageUrl ? (
                          <img
                            src={cus.imageUrl}
                            alt={cus.fullName}
                            className="emp-avatar-img"
                          />
                        ) : (
                          <div
                            className="emp-avatar-fallback"
                            style={{ background: "#5A3726" }}
                          >
                            {(cus.fullName || cus.username || "KH")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="emp-name-block">
                          <span className="emp-full-name">
                            {cus.fullName || "Khách hàng"}
                          </span>
                          <span className="emp-username-tag">
                            @{cus.username}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cột Liên hệ: SĐT + Email */}
                    <td>
                      <div className="emp-contact-block">
                        <div>📞 {cus.phoneNumber || "—"}</div>
                        <div style={{ color: "#6E5C4A" }}>
                          ✉ {cus.email || "—"}
                        </div>
                      </div>
                    </td>

                    {/* Giới tính */}
                    <td>
                      <span className="emp-gender-badge">
                        {GENDER_MAP[cus.gender] || "—"}
                      </span>
                    </td>

                    {/* Ngày sinh */}
                    <td>{formatDate(cus.dateOfBirth)}</td>

                    {/* Điểm tích lũy */}
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 10px",
                          background: "#FAF3E8",
                          color: "#9C6B3A",
                          borderRadius: "9999px",
                          fontWeight: 700,
                          fontSize: "12px",
                          border: "1px solid #E4D2B8",
                        }}
                      >
                        ⭐ {cus.loyaltyPoints ?? 0} pts
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          background:
                            cus.status === "ACTIVE" ? "#DCFCE7" : "#FEE2E2",
                          color:
                            cus.status === "ACTIVE" ? "#166534" : "#991B1B",
                        }}
                      >
                        {cus.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>

                    {/* Nút Thao tác */}
                    <td style={{ textAlign: "right" }}>
                      <div
                        className="emp-actions-group"
                        style={{ justifyContent: "flex-end" }}
                      >
                        <button
                          type="button"
                          className="btn-emp-edit"
                          onClick={() => handleOpenEdit(cus)}
                          title="Chỉnh sửa thông tin"
                        >
                          ✎ Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-emp-delete"
                          onClick={() => setDeleteConfirmTarget(cus)}
                          title="Khóa/Xóa khách hàng"
                        >
                          🗑 Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ----------------- MODAL THÊM / SỬA KHÁCH HÀNG ----------------- */}
      {modalOpen && (
        <div
          className="emp-modal-overlay"
          onClick={() => !saving && setModalOpen(false)}
        >
          <div
            className="emp-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="emp-modal-head">
              <h3 className="emp-modal-title">
                {editingCustomer
                  ? "Chỉnh Sửa Khách Hàng"
                  : "Thêm Khách Hàng Mới"}
              </h3>
              <button
                type="button"
                onClick={() => !saving && setModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                  color: "#6E5C4A",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ display: "contents" }}>
              <div className="emp-modal-body">
                {/* Upload Ảnh đại diện */}
                <div className="emp-avatar-upload-box">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Xem trước"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #D5A874",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "#E4D2B8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                      }}
                    >
                      👤
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#2A1E14",
                        marginBottom: "4px",
                      }}
                    >
                      Ảnh đại diện khách hàng
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ fontSize: "12.5px" }}
                    />
                  </div>
                </div>

                <div className="emp-form-grid">
                  {/* Tên đăng nhập */}
                  <div className="emp-field">
                    <label className="emp-field-label">
                      Tên đăng nhập (Username) *
                    </label>
                    <input
                      type="text"
                      className="emp-field-input"
                      placeholder="vd: khachhang01"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      disabled={!!editingCustomer}
                      required
                    />
                  </div>

                  {/* Mật khẩu */}
                  <div className="emp-field">
                    <label className="emp-field-label">
                      {editingCustomer
                        ? "Mật khẩu mới (Để trống nếu không đổi)"
                        : "Mật khẩu khởi tạo *"}
                    </label>
                    <input
                      type="password"
                      className="emp-field-input"
                      placeholder={
                        editingCustomer ? "••••••••" : "Nhập mật khẩu"
                      }
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!editingCustomer}
                    />
                  </div>

                  {/* Họ và tên */}
                  <div className="emp-field">
                    <label className="emp-field-label">Họ và tên *</label>
                    <input
                      type="text"
                      className="emp-field-input"
                      placeholder="vd: Trần Thị B"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="emp-field">
                    <label className="emp-field-label">Địa chỉ Email</label>
                    <input
                      type="email"
                      className="emp-field-input"
                      placeholder="vd: khach@gmail.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div className="emp-field">
                    <label className="emp-field-label">Số điện thoại</label>
                    <input
                      type="tel"
                      className="emp-field-input"
                      placeholder="vd: 0912345678"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Giới tính */}
                  <div className="emp-field">
                    <label className="emp-field-label">Giới tính</label>
                    <select
                      className="emp-field-input"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>

                  {/* Ngày sinh */}
                  <div className="emp-field">
                    <label className="emp-field-label">Ngày sinh</label>
                    <input
                      type="date"
                      className="emp-field-input"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Điểm tích lũy */}
                  <div className="emp-field">
                    <label className="emp-field-label">
                      Điểm tích lũy (Loyalty Points)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="emp-field-input"
                      placeholder="vd: 100"
                      value={formData.loyaltyPoints}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          loyaltyPoints: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  {/* Địa chỉ */}
                  <div className="emp-field full">
                    <label className="emp-field-label">Địa chỉ</label>
                    <input
                      type="text"
                      className="emp-field-input"
                      placeholder="vd: 456 Lê Duẩn, Đà Nẵng"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="emp-modal-foot">
                <button
                  type="button"
                  className="btn-emp-modal-cancel"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-emp-modal-submit"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingCustomer
                      ? "Cập nhật khách hàng"
                      : "Lưu khách hàng mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL XÁC NHẬN XÓA / KHÓA ----------------- */}
      {deleteConfirmTarget && (
        <div
          className="emp-modal-overlay"
          onClick={() => !deleting && setDeleteConfirmTarget(null)}
        >
          <div
            className="emp-modal-card"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="emp-modal-head" style={{ background: "#FEE2E2" }}>
              <h3 className="emp-modal-title" style={{ color: "#991B1B" }}>
                Xác nhận Khóa Tài Khoản
              </h3>
              <button
                type="button"
                onClick={() => !deleting && setDeleteConfirmTarget(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div className="emp-modal-body">
              <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6" }}>
                Bạn có chắc chắn muốn khóa tài khoản khách hàng{" "}
                <strong>{deleteConfirmTarget.fullName}</strong> (Tài khoản:{" "}
                <code>@{deleteConfirmTarget.username}</code>)?
              </p>
              <div
                style={{
                  marginTop: "8px",
                  padding: "10px 14px",
                  background: "#FFF5F5",
                  border: "1px solid #FED7D7",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  color: "#C53030",
                }}
              >
                ⚠️ Khách hàng này sẽ không thể đăng nhập đặt món trực tuyến được
                nữa.
              </div>
            </div>

            <div className="emp-modal-foot">
              <button
                type="button"
                className="btn-emp-modal-cancel"
                onClick={() => setDeleteConfirmTarget(null)}
                disabled={deleting}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                style={{
                  padding: "9px 20px",
                  background: "#DC2626",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "8px",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {deleting ? "Đang khóa..." : "Xác nhận Khóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
