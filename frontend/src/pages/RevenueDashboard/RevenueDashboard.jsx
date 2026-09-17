import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getDashboardStats,
  getInvoicesList,
  getInvoiceDetailById,
  getApiErrorMessage,
} from "../../services/apiService";
import { getHomePath } from "../../utils/authRedirect";
import Logo from "../../components/Logo";
import MenuButton from "../../components/menu-button";

/* Bảng màu sang trọng cho Biểu đồ tròn danh mục */
const PIE_COLORS = [
  "#2A1E14",
  "#9C6B3A",
  "#D5A874",
  "#6E5C4A",
  "#C49A6C",
  "#4A3728",
];

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

const PAYMENT_METHOD_MAP = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản QR",
  MOMO: "MoMo",
  VNPAY: "VNPay",
  PAYPAL: "PayPal",
};

export default function RevenueDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrderCount: 0,
    monthRevenue: 0,
    weeklyRevenue: [],
    categorySales: [],
  });

  const [todayInvoices, setTodayInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Tải dữ liệu Dashboard và Hóa đơn hôm nay
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Thống kê KPI & Biểu đồ
      const statsRes = await getDashboardStats();
      if (statsRes.data) {
        setStats({
          todayRevenue: statsRes.data.todayRevenue || 0,
          todayOrderCount: statsRes.data.todayOrderCount || 0,
          monthRevenue: statsRes.data.monthRevenue || 0,
          weeklyRevenue: statsRes.data.weeklyRevenue || [],
          categorySales: statsRes.data.categorySales || [],
        });
      }

      // 2. Hóa đơn hôm nay
      const nowStr = new Date().toISOString().split("T")[0];
      const invoicesRes = await getInvoicesList({
        startDate: nowStr,
        endDate: nowStr,
      });
      const list = Array.isArray(invoicesRes.data)
        ? invoicesRes.data
        : invoicesRes.data?.content || [];

      // Nếu hôm nay chưa có hóa đơn, tải các hóa đơn gần nhất để tiện theo dõi
      if (list.length > 0) {
        setTodayInvoices(list);
      } else {
        const fallbackRes = await getInvoicesList({});
        const fallbackList = Array.isArray(fallbackRes.data)
          ? fallbackRes.data
          : fallbackRes.data?.content || [];
        setTodayInvoices(fallbackList.slice(0, 8));
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Dashboard:", err);
      ToastService.error(
        getApiErrorMessage(err, "Không tải được dữ liệu thống kê."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Xem chi tiết hóa đơn
  const handleViewInvoiceDetail = async (orderId) => {
    setModalLoading(true);
    try {
      const res = await getInvoiceDetailById(orderId);
      setSelectedInvoice(res.data);
    } catch (err) {
      ToastService.error(
        getApiErrorMessage(err, "Không thể tải chi tiết hóa đơn."),
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Tính giá trị trung bình trên đơn (AOV)
  const averageOrderValue = useMemo(() => {
    if (!stats.todayOrderCount || stats.todayOrderCount === 0) return 0;
    return Math.round(stats.todayRevenue / stats.todayOrderCount);
  }, [stats.todayRevenue, stats.todayOrderCount]);

  return (
    <div className="admin-dashboard">
      {/* ------------------------ TOPBAR ------------------------ */}
      <header className="topbar">
        <div className="topbar-left">
          {/* Nút 3 gạch bên trái mở Drawer */}
          <MenuButton />

          {/* Logo Thương hiệu */}
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

      {/* -------------------- NỘI DUNG CHÍNH DASHBOARD -------------------- */}
      <main className="wrap">
        <div className="page-header-block">
          <div>
            <h2 className="page-title">Tổng quan Kinh doanh</h2>
            <p className="page-subtitle">
              Theo dõi hiệu suất doanh thu, đơn hàng và cơ cấu bán hàng thời
              gian thực.
            </p>
          </div>
          <div className="live-indicator">
            <span className="live-dot" />
            <span>Hệ thống trực tuyến</span>
          </div>
        </div>

        {/* 1. BỘ 4 THẺ CHỈ SỐ KPI */}
        <section className="kpi-grid">
          <div className="kpi-card highlight">
            <div className="kpi-label">Doanh thu hôm nay</div>
            <div className="kpi-value">
              {loading ? "..." : fmt(stats.todayRevenue)}
            </div>
            <div className="kpi-sub">Doanh số thực thu trong ngày</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Đơn hàng hôm nay</div>
            <div className="kpi-value">
              {loading ? "..." : `${stats.todayOrderCount} đơn`}
            </div>
            <div className="kpi-sub">Đã hoàn tất thanh toán</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Doanh thu tháng này</div>
            <div className="kpi-value">
              {loading ? "..." : fmt(stats.monthRevenue)}
            </div>
            <div className="kpi-sub">Tổng tích lũy trong tháng</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Giá trị TB / Đơn (AOV)</div>
            <div className="kpi-value">
              {loading ? "..." : fmt(averageOrderValue)}
            </div>
            <div className="kpi-sub">Mức chi tiêu trung bình mỗi bàn</div>
          </div>
        </section>

        {/* 2. KHU VỰC BIỂU ĐỒ PHÂN TÍCH */}
        <section className="charts-grid">
          {/* Biểu đồ diện tích/đường: Doanh thu 7 ngày */}
          <div className="chart-box">
            <div className="chart-head">
              <div>
                <h3 className="chart-title">Biến động Doanh thu 7 ngày</h3>
                <span className="chart-subtitle">
                  Thống kê từ Thứ 2 đến Chủ nhật tuần này
                </span>
              </div>
            </div>

            <div className="chart-body">
              {stats.weeklyRevenue.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 0",
                    color: "#6E5C4A",
                  }}
                >
                  Chưa có dữ liệu doanh thu tuần này.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={stats.weeklyRevenue}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#9C6B3A"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#9C6B3A"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#6E5C4A", fontSize: 12 }}
                      axisLine={{ stroke: "#E4D2B8" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#6E5C4A", fontSize: 11 }}
                      axisLine={{ stroke: "#E4D2B8" }}
                      tickLine={false}
                      tickFormatter={(val) =>
                        val >= 1000000
                          ? `${(val / 1000000).toFixed(1)}M`
                          : val >= 1000
                            ? `${(val / 1000).toFixed(0)}k`
                            : val
                      }
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="custom-chart-tooltip">
                              <div className="tooltip-day">{d.day}</div>
                              <div className="tooltip-rev">
                                Doanh thu: <strong>{fmt(d.revenue)}</strong>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#9C6B3A"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Biểu đồ tròn: Cơ cấu bán theo danh mục */}
          <div className="chart-box">
            <div className="chart-head">
              <div>
                <h3 className="chart-title">Cơ cấu Doanh số Món</h3>
                <span className="chart-subtitle">
                  Tỷ lệ số lượng món bán theo nhóm
                </span>
              </div>
            </div>

            <div className="chart-body">
              {stats.categorySales.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 0",
                    color: "#6E5C4A",
                  }}
                >
                  Chưa có dữ liệu danh mục.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.categorySales}
                      cx="50%"
                      cy="48%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="totalQuantity"
                      nameKey="categoryName"
                    >
                      {stats.categorySales.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke="#FFFDF9"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} món`, name]}
                      contentStyle={{
                        background: "#2A1E14",
                        border: "1px solid #4A3728",
                        borderRadius: "8px",
                        color: "#FFFDF9",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span
                          style={{
                            color: "#2A1E14",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        {/* 3. BẢNG HÓA ĐƠN & GIAO DỊCH HÔM NAY */}
        <section className="today-transactions-box">
          <div className="today-trans-head">
            <div>
              <h3 className="today-trans-title">Giao dịch & Hóa đơn gần đây</h3>
              <span className="chart-subtitle">
                Theo dõi các lượt thanh toán phát sinh trong ca làm việc
              </span>
            </div>
            <div className="today-trans-actions">
              <Link to="/admin/invoices" className="btn-link-all-invoices">
                Xem tất cả hóa đơn ›
              </Link>
            </div>
          </div>

          <div
            className="invoice-table-wrap"
            style={{ border: "none", boxShadow: "none" }}
          >
            <table className="invoice-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}># ID</th>
                  <th style={{ width: 120 }}>Mã HĐ</th>
                  <th style={{ width: 140 }}>Bàn phục vụ</th>
                  <th style={{ width: 140 }}>Tổng tiền</th>
                  <th style={{ width: 150 }}>Thời gian</th>
                  <th style={{ width: 140 }}>Thanh toán</th>
                  <th style={{ width: 130 }}>Trạng thái</th>
                  <th style={{ width: 110, textAlign: "center" }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="table-empty">
                      Đang tải danh sách giao dịch...
                    </td>
                  </tr>
                ) : todayInvoices.length > 0 ? (
                  todayInvoices.slice(0, 6).map((inv) => {
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
                          <span className="status-badge status-paid">
                            {inv.status === "PAID"
                              ? "Đã thanh toán"
                              : inv.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="btn-view-detail"
                            onClick={() => handleViewInvoiceDetail(inv.orderId)}
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
                      Chưa có giao dịch thanh toán nào hôm nay.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ------------------------- MODAL XEM CHI TIẾT HÓA ĐƠN ------------------------- */}
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
