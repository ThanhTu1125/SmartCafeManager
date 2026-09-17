import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import MenuButton from "../../components/menu-button";
import { getHomePath } from "../../utils/authRedirect";
import {
  getInvoicesList,
  getInvoiceDetailById,
  getApiErrorMessage,
} from "../../services/apiService";
import { ToastService } from "../../services/toastService";

/* Định dạng tiền tệ VND */
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n || 0) + "đ";

/* Định dạng ngày giờ */
const formatDateTime = (isoOrDate) => {
  if (!isoOrDate) return "—";
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return "—";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/* Bản đồ hiển thị trạng thái hóa đơn */
const STATUS_MAP = {
  PAID: { label: "Đã thanh toán", class: "status-paid" },
  WAITING_PAYMENT: { label: "Chờ thanh toán", class: "status-waiting" },
  OPEN: { label: "Đang mở", class: "status-open" },
  CANCELLED: { label: "Đã hủy", class: "status-cancelled" },
};

/* Bản đồ phương thức thanh toán */
const PAYMENT_METHOD_MAP = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản QR",
  MOMO: "MoMo",
  VNPAY: "VNPay",
  PAYPAL: "PayPal",
};

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Bộ lọc
  const [filterTable, setFilterTable] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const role = (localStorage.getItem("roleName") || "").toUpperCase();
  const isAdmin = role === "ADMIN";

  // Lấy danh sách hóa đơn từ API
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterTable) params.tableId = filterTable;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getInvoicesList(params);
      const data = res.data;
      setInvoices(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      console.error("Lỗi tải danh sách hóa đơn:", err);
      ToastService.error(
        getApiErrorMessage(err, "Không thể tải danh sách hóa đơn từ máy chủ."),
      );
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [filterTable, startDate, endDate]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Xem chi tiết hóa đơn
  const handleViewDetail = async (orderId) => {
    setModalLoading(true);
    try {
      const res = await getInvoiceDetailById(orderId);
      setSelectedInvoice(res.data);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết hóa đơn:", err);
      ToastService.error(
        getApiErrorMessage(err, "Không thể tải chi tiết hóa đơn."),
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleClearFilter = () => {
    setFilterTable("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="invoice-page">
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
            {isAdmin ? "ADMIN" : "STAFF"}
          </div>
        </div>
      </header>

      {/* ---------------------- NỘI DUNG CHÍNH ---------------------- */}
      <main className="wrap">
        <div className="page-header-block">
          <div>
            <h2 className="page-title">Danh sách Hóa đơn</h2>
            <p className="page-subtitle">
              Tra cứu lịch sử thanh toán, hóa đơn bàn và chi tiết món đã phục
              vụ.
            </p>
          </div>
          <div className="page-count-badge">
            Tổng cộng: <strong>{invoices.length}</strong> hóa đơn
          </div>
        </div>

        {/* Thanh công cụ lọc */}
        <div className="invoice-toolbar">
          <div className="filter-group">
            <div className="field-item">
              <label className="field-label">Lọc theo Bàn (ID)</label>
              <input
                type="number"
                placeholder="Nhập ID bàn..."
                className="filter-input"
                value={filterTable}
                onChange={(e) => setFilterTable(e.target.value)}
              />
            </div>

            <div className="field-item">
              <label className="field-label">Từ ngày</label>
              <input
                type="date"
                className="filter-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="field-item">
              <label className="field-label">Đến ngày</label>
              <input
                type="date"
                className="filter-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {(filterTable || startDate || endDate) && (
              <button className="btn-clear" onClick={handleClearFilter}>
                ✕ Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}># ID</th>
                <th style={{ width: 120 }}>Mã HĐ</th>
                <th style={{ width: 140 }}>Vị trí bàn</th>
                <th style={{ width: 140 }}>Tổng tiền</th>
                <th style={{ width: 160 }}>Thời gian</th>
                <th style={{ width: 140 }}>Thanh toán</th>
                <th style={{ width: 130 }}>Trạng thái</th>
                <th style={{ width: 120, textAlign: "center" }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="table-empty">
                    Đang tải dữ liệu hóa đơn...
                  </td>
                </tr>
              ) : invoices.length > 0 ? (
                invoices.map((inv) => {
                  const statusInfo = STATUS_MAP[inv.status] || {
                    label: inv.status,
                    class: "status-paid",
                  };
                  const paymentText =
                    PAYMENT_METHOD_MAP[inv.paymentMethod] ||
                    inv.paymentMethod ||
                    "Tiền mặt";

                  return (
                    <tr key={inv.orderId}>
                      <td className="td-code">#{inv.orderId}</td>
                      <td className="td-code">
                        {inv.invoiceCode || `#HD${inv.orderId}`}
                      </td>
                      <td className="td-table">
                        {inv.tableName || `Bàn ${inv.tableId}`}
                      </td>
                      <td className="td-amount">{fmt(inv.totalAmount)}</td>
                      <td className="td-time">
                        {formatDateTime(
                          inv.paidAt || inv.createdAt || inv.openAt,
                        )}
                      </td>
                      <td>
                        <span className="pay-method-tag">{paymentText}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn-view-detail"
                          onClick={() => handleViewDetail(inv.orderId)}
                          disabled={modalLoading}
                        >
                          Xem HĐ
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="table-empty">
                    Không tìm thấy hóa đơn nào trong khoảng thời gian đã chọn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ------------------------- MODAL CHI TIẾT ------------------------- */}
      {selectedInvoice && (
        <div
          className="invoice-modal-overlay"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="invoice-modal-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invoice-modal-head">
              <h3 className="invoice-modal-title">
                Hóa đơn:{" "}
                {selectedInvoice.invoiceCode || `#HD${selectedInvoice.orderId}`}
              </h3>
              <button
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                  color: "#6E5C4A",
                }}
                onClick={() => setSelectedInvoice(null)}
              >
                ✕
              </button>
            </div>

            <div className="invoice-modal-body">
              <div className="invoice-info-grid">
                <div className="invoice-info-item">
                  <strong>Bàn:</strong>{" "}
                  {selectedInvoice.tableName ||
                    `Bàn ${selectedInvoice.tableId}`}
                </div>
                <div className="invoice-info-item">
                  <strong>Mã đơn:</strong> #{selectedInvoice.orderId}
                </div>
                <div className="invoice-info-item">
                  <strong>Thanh toán:</strong>{" "}
                  {PAYMENT_METHOD_MAP[selectedInvoice.paymentMethod] ||
                    selectedInvoice.paymentMethod ||
                    "Tiền mặt"}
                </div>
                <div className="invoice-info-item">
                  <strong>Thời gian:</strong>{" "}
                  {formatDateTime(
                    selectedInvoice.paidAt ||
                      selectedInvoice.createdAt ||
                      selectedInvoice.openAt,
                  )}
                </div>
              </div>

              <div className="invoice-items-title">Danh sách món đã dùng</div>

              <div className="invoice-items-list">
                {(selectedInvoice.items || []).length > 0 ? (
                  selectedInvoice.items.map((item, idx) => (
                    <div className="invoice-item-row" key={idx}>
                      <div>
                        <span className="invoice-item-name">
                          {item.itemName}
                        </span>
                        <span className="invoice-item-qty">
                          x{item.quantity}
                        </span>
                      </div>
                      <span className="invoice-item-price">
                        {fmt(item.totalPrice || item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#6E5C4A",
                      textAlign: "center",
                      margin: "8px 0",
                    }}
                  >
                    Hóa đơn không có chi tiết món ăn.
                  </p>
                )}
              </div>

              <div className="invoice-modal-total-row">
                <span className="invoice-modal-total-label">
                  Tổng thanh toán:
                </span>
                <span className="invoice-modal-total-value">
                  {fmt(selectedInvoice.totalAmount)}
                </span>
              </div>
            </div>

            <div className="invoice-modal-foot">
              <button
                className="btn-modal-close"
                onClick={() => setSelectedInvoice(null)}
              >
                Đóng phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
