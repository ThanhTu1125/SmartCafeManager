import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import "../../styles/sale-manager.css";
import { Client } from "@stomp/stompjs";
import { ToastService } from "../../services/toastService";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import MenuButton from "../../components/menu-button";
import { getHomePath } from "../../utils/authRedirect";

import {
  getAllTableInfo,
  getTablesInvoice,
  approvePayment,
  getApiErrorMessage,
  getActiveOrder,
  staffConfirmOrder,
  staffServeTable,
  staffEditOrderedItem,
  staffDeleteOrderedItem,
} from "../../services/apiService";
import EditItemModal from "../../components/editItemModal";
import ConfirmModal from "../../components/confirmModal";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n || 0) + "đ";

/* Ánh xạ serviceStatus của backend sang trạng thái hiển thị */
const STATUS_MAP = {
  NORMAL: "empty",
  EMPTY: "empty",
  WAITING_FOOD: "neworder",
  SERVING: "serve",
  CALL_STAFF: "call",
  WAITING_PAYMENT: "bill",
  REQUESTING_BILL: "bill",
  PAYMENT_REQUESTED: "bill",
};

/* Ánh xạ trạng thái hiển thị cho bàn kết hợp PhysicalState và ServiceStatus */
const getTableVisualState = (t) => {
  const isMaintenance = t?.physicalState === "MAINTENANCE";
  const isBroken = t?.physicalState === "BROKEN";

  if (isBroken) {
    return {
      cardClass: "tc-broken",
      badgeClass: "badge-broken",
      statusLabel: "Bị hỏng",
      descLabel: "Cần sửa chữa",
      isUsable: false,
    };
  }

  if (isMaintenance) {
    return {
      cardClass: "tc-maintenance",
      badgeClass: "badge-maintenance",
      statusLabel: "Đang bảo trì",
      descLabel: "Tạm ngưng phục vụ",
      isUsable: false,
    };
  }

  // Bàn bình thường (GOOD / ACTIVE): hiển thị theo serviceStatus
  switch (t?.status) {
    case "neworder":
      return {
        cardClass: "tc-neworder",
        badgeClass: "badge-neworder",
        statusLabel: "Đơn mới",
        descLabel: "Chờ nhận đơn",
        isUsable: true,
      };
    case "serve":
      return {
        cardClass: "tc-serve",
        badgeClass: "badge-serve",
        statusLabel: "Đang phục vụ",
        descLabel: "Đang dùng món",
        isUsable: true,
      };
    case "call":
      return {
        cardClass: "tc-call",
        badgeClass: "badge-call",
        statusLabel: "Gọi nhân viên",
        descLabel: "Cần hỗ trợ",
        isUsable: true,
      };
    case "bill":
      return {
        cardClass: "tc-bill",
        badgeClass: "badge-bill",
        statusLabel: "Chờ tính tiền",
        descLabel: "Yêu cầu thanh toán",
        isUsable: true,
      };
    case "empty":
    default:
      return {
        cardClass: "tc-empty",
        badgeClass: "badge-empty",
        statusLabel: "Trống",
        descLabel: "Sẵn sàng đón khách",
        isUsable: true,
      };
  }
};

/* Mệnh giá gợi ý trong modal thanh toán */
const QUICK_CASH = [50000, 100000, 200000, 500000];

/* Chuẩn hoá bàn từ API về shape nội bộ */
const normalizeTable = (t) => ({
  id: t.tableId,
  name: String(t.tableName ?? t.tableId ?? "").replace(/^Bàn\s*/i, ""),
  status: STATUS_MAP[t.serviceStatus] || (t.isOccupied ? "serve" : "empty"),
  rawStatus: t.serviceStatus,
  physicalState: t.physicalState,
  isOccupied: t.isOccupied,
});

/* Chuẩn hoá dòng chi tiết đơn */
const normalizeDetail = (d) => ({
  id: d.orderDetailId,
  name: d.itemName ?? "—",
  qty: d.quantity ?? 0,
  price: d.price ?? d.unitPrice ?? d.item?.price ?? 0,
  total: (d.price ?? d.unitPrice ?? d.item?.price ?? 0) * (d.quantity ?? 0),
  note: d.note ?? "",
  status: d.status,
});

function SaleManager() {
  const [tables, setTables] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const selectedIdRef = useRef(selectedId);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const [details, setDetails] = useState([]);
  const [openAt, setOpenAt] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [cash, setCash] = useState("");
  const [lastChange, setLastChange] = useState(0);
  const [showNhanDon, setShowNhanDon] = useState(false);
  const [showServed, setShowServed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Bộ lọc bàn
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Đồng hồ thời gian thực
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      );
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  /* Thêm thông báo vào danh sách */
  const pushNotification = useCallback((text, type = "info") => {
    setNotifications((prev) =>
      [
        {
          id: Date.now() + Math.random(),
          text: String(text),
          type,
          time: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev,
      ].slice(0, 30),
    );
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = (msg, type = "info", msgType = null, tableId = null) => {
    const text = String(msg);

    if (type === "success") {
      ToastService.success(text);
    } else if (type === "error") {
      ToastService.error(text);
    } else {
      switch (msgType) {
        case "NEW_ORDER":
          pushNotification("Bàn " + tableId + " có đơn mới", type);
          if (tableId === selectedIdRef.current) {
            loadDetails(selectedIdRef.current);
          }
          loadTables(true);
          break;

        case "CALL_STAFF":
          pushNotification(text, type);
          loadTables(true);
          break;

        case "ALL_ITEMS_SERVED":
          if (tableId === selectedIdRef.current) {
            loadDetails(selectedIdRef.current);
          }
          loadTables(true);
          break;

        case "CHECKOUT_COMPLETE":
          pushNotification(text, type);
          if (tableId === selectedIdRef.current) {
            loadDetails(selectedIdRef.current);
          }
          loadTables(true);
          break;

        case "ORDER_CONFIRMED":
          if (tableId === selectedIdRef.current) {
            loadDetails(selectedIdRef.current);
          }
          break;

        case "PAYMENT_REQUESTED":
          pushNotification(text, type);
          loadTables(true);
          break;

        case "TABLE_CLEARED":
          if (tableId === selectedIdRef.current) {
            loadDetails(selectedIdRef.current);
          }
          loadTables(true);
          ToastService.success(`Bàn ${tableId} đã hoàn tất thanh toán.`);
          break;

        default:
          break;
      }
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setBellOpen(false);
  };

  /* Lấy thông tin tất cả các bàn */
  const loadTables = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getAllTableInfo();
      const list = Array.isArray(res.data)
        ? res.data.filter((t) => !t.deleted).map(normalizeTable)
        : [];
      setTables(list);
      setSelectedId((prev) => {
        if (prev !== null && list.some((t) => t.id === prev)) return prev;
        const busy = list.find(
          (t) =>
            t.status !== "empty" &&
            t.physicalState !== "MAINTENANCE" &&
            t.physicalState !== "BROKEN",
        );
        return (busy || list[0])?.id ?? null;
      });
    } catch (err) {
      notify(getApiErrorMessage(err, "Không tải được danh sách bàn."), "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  /* Lấy chi tiết hóa đơn của bàn */
  const loadDetails = useCallback(async (tableId) => {
    if (tableId === null || tableId === undefined) {
      setDetails([]);
      setOpenAt("");
      setCustomerName("");
      return;
    }
    try {
      const res = await getTablesInvoice(tableId);
      const raw = Array.isArray(res.data) ? res.data : [];
      const visible = raw.filter((d) => !d.deleted && d.status !== "CANCELLED");
      setDetails(visible.map(normalizeDetail));

      setShowNhanDon(visible.some((d) => d.status === "ORDERED"));
      setShowServed(visible.some((d) => d.status === "CONFIRMED"));

      const order = raw[0]?.order;
      if (order?.openAt) {
        const d = new Date(order.openAt);
        setOpenAt(
          `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
        );
      } else {
        setOpenAt("");
      }
      setCustomerName(order?.customer?.fullName ?? "");
    } catch (err) {
      // Bàn trống hoặc không có đơn hàng đang mở là trạng thái bình thường -> không báo lỗi
      setDetails([]);
      setOpenAt("");
      setCustomerName("");
      setShowNhanDon(false);
      setShowServed(false);
    }
  }, []);

  useEffect(() => {
    loadDetails(selectedId);
  }, [selectedId, loadDetails]);

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedId) ?? null,
    [tables, selectedId],
  );

  const total = useMemo(
    () => details.reduce((sum, d) => sum + d.total, 0),
    [details],
  );

  const totalItemsCount = useMemo(
    () => details.reduce((sum, d) => sum + (d.qty || 0), 0),
    [details],
  );

  const change = (Number(cash) || 0) - total;
  const canFinish = Number(cash) > 0 && change >= 0 && !loading;

  // Thống kê số lượng bàn
  const stats = useMemo(() => {
    const totalCount = tables.length;
    const maintenanceCount = tables.filter(
      (t) => t.physicalState === "MAINTENANCE",
    ).length;
    const brokenCount = tables.filter(
      (t) => t.physicalState === "BROKEN",
    ).length;
    const unavailableCount = maintenanceCount + brokenCount;

    // Bàn hoạt động bình thường (GOOD hoặc ACTIVE)
    const usableTables = tables.filter(
      (t) => t.physicalState !== "MAINTENANCE" && t.physicalState !== "BROKEN",
    );
    const occupiedCount = usableTables.filter(
      (t) => t.status !== "empty",
    ).length;
    const emptyCount = usableTables.filter((t) => t.status === "empty").length;
    const newOrderCount = usableTables.filter(
      (t) => t.status === "neworder",
    ).length;
    const servingCount = usableTables.filter(
      (t) => t.status === "serve",
    ).length;
    const billCount = usableTables.filter((t) => t.status === "bill").length;
    const callCount = usableTables.filter((t) => t.status === "call").length;

    return {
      totalCount,
      occupiedCount,
      emptyCount,
      newOrderCount,
      servingCount,
      billCount,
      callCount,
      maintenanceCount,
      brokenCount,
      unavailableCount,
    };
  }, [tables]);

  // Lọc danh sách bàn hiển thị
  const filteredTables = useMemo(() => {
    switch (filterStatus) {
      case "EMPTY":
        return tables.filter(
          (t) =>
            t.status === "empty" &&
            t.physicalState !== "MAINTENANCE" &&
            t.physicalState !== "BROKEN",
        );
      case "SERVING":
        return tables.filter(
          (t) =>
            t.status === "serve" &&
            t.physicalState !== "MAINTENANCE" &&
            t.physicalState !== "BROKEN",
        );
      case "NEW_ORDER":
        return tables.filter(
          (t) =>
            t.status === "neworder" &&
            t.physicalState !== "MAINTENANCE" &&
            t.physicalState !== "BROKEN",
        );
      case "BILL":
        return tables.filter(
          (t) =>
            t.status === "bill" &&
            t.physicalState !== "MAINTENANCE" &&
            t.physicalState !== "BROKEN",
        );
      case "CALL":
        return tables.filter(
          (t) =>
            t.status === "call" &&
            t.physicalState !== "MAINTENANCE" &&
            t.physicalState !== "BROKEN",
        );
      case "UNAVAILABLE":
        return tables.filter(
          (t) =>
            t.physicalState === "MAINTENANCE" || t.physicalState === "BROKEN",
        );
      default:
        return tables;
    }
  }, [tables, filterStatus]);

  /* Xử lý nhận đơn */
  const handleNhanDon = async () => {
    if (!selectedTable) return;
    setLoading(true);
    try {
      const res = await getActiveOrder(selectedTable.id);
      const order = res.data;
      if (!order?.hasActiveOrder) {
        notify("Không tìm thấy đơn đang mở của bàn này.", "error");
        return;
      }
      await staffConfirmOrder(order.tableId);
      notify("Đã xác nhận chuyển đơn xuống bếp.", "success");
      await loadDetails(selectedTable.id);
      await loadTables(true);
    } catch (err) {
      notify(getApiErrorMessage(err, "Xác nhận món thất bại."), "error");
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = () => {
    setCash("");
    setPayOpen(true);
  };

  /* Xác nhận thanh toán */
  const handleXacNhanThanhToan = async () => {
    if (!canFinish || !selectedTable) return;
    setLoading(true);
    try {
      await approvePayment(selectedTable.id);
      notify("Đã duyệt thanh toán và giải phóng bàn thành công.", "success");
      setLastChange(change);
      setPayOpen(false);
      setShowNhanDon(false);
      setShowServed(false);
      setDoneOpen(true);
    } catch (err) {
      notify(getApiErrorMessage(err, "Xác nhận thanh toán thất bại."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleServeAll = async () => {
    if (!selectedTable) return;
    setLoading(true);
    try {
      await staffServeTable(selectedTable.id);
      notify("Đã xác nhận phục vụ tất cả món.", "success");
      await loadDetails(selectedTable.id);
      await loadTables(true);
    } catch (err) {
      notify(getApiErrorMessage(err, "Xác nhận phục vụ thất bại."), "error");
    } finally {
      setLoading(false);
    }
  };

  const closeDone = async () => {
    setDoneOpen(false);
    await loadTables(true);
    await loadDetails(selectedId);
  };

  /* Đóng modal bằng phím Esc */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (payOpen) setPayOpen(false);
      else if (doneOpen) closeDone();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  /* Xóa món */
  const handleRemoveItem = (detail) => {
    setDeleteItem(detail);
  };

  const confirmDelete = async () => {
    if (!deleteItem || !selectedTable) return;
    setLoading(true);
    try {
      await staffDeleteOrderedItem(selectedTable.id, deleteItem.id);
      notify("Xóa món thành công.", "success");
      setDeleteItem(null);
      await loadDetails(selectedTable.id);
    } catch (err) {
      notify(getApiErrorMessage(err, "Xoá món thất bại."), "error");
    } finally {
      setLoading(false);
    }
  };

  /* Sửa món */
  const handleEditItem = (detail) => {
    setEditItem(detail);
  };

  const submitEdit = async ({ quantity, note }) => {
    if (!editItem || !selectedTable) return;
    setLoading(true);
    try {
      const qty = Number(quantity) > 0 ? Number(quantity) : 1;
      await staffEditOrderedItem(selectedTable.id, editItem.id, qty, note);
      notify("Cập nhật món thành công.", "success");
      setEditItem(null);
      await loadDetails(selectedTable.id);
    } catch (err) {
      notify(getApiErrorMessage(err, "Cập nhật món thất bại."), "error");
    } finally {
      setLoading(false);
    }
  };

  const showAccept = selectedTable?.status === "neworder";
  const showPay = selectedTable?.status === "bill";

  // WebSocket
  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/table-events`, (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            notify(data?.message, "info", data?.type, data?.tableId);
          }
        });
      },
      onStompError: (frame) => {
        console.error("[WebSocket] Lỗi STOMP: ", frame.headers["message"]);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <div className="sale-manager">
      {/* ------------------------ TOPBAR ------------------------ */}
      <header>
        <div className="header-row">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <MenuButton />
            <Link to={getHomePath()} className="brand" title="Trang chủ">
              <Logo className="h-9 w-9" />
              <div className="brand-text">
                <span className="bold">NEO</span>
                <span className="light">CAFÉ</span>
              </div>
            </Link>
          </div>

          <div className="header-center">
            <div className="header-title-badge">POS · Bán hàng</div>
            <div className="header-status-pill">
              <span className="status-live-dot" />
              <span>
                {stats.occupiedCount}/{stats.totalCount} Bàn đang phục vụ
              </span>
            </div>
          </div>

          <div className="header-right">
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
              {(localStorage.getItem("roleName") || "STAFF").toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="main-content">
          {/* ------------------- SƠ ĐỒ BÀN (FLOOR MAP) ------------------- */}
          <div className="floor">
            <div className="floor-head-card">
              <div className="floor-title-row">
                <h2 className="floor-title">Sơ đồ bàn</h2>
              </div>

              {/* Bộ lọc trạng thái */}
              <div className="floor-filters">
                <button
                  className={`filter-pill ${filterStatus === "ALL" ? "active" : ""}`}
                  onClick={() => setFilterStatus("ALL")}
                >
                  Tất cả{" "}
                  <span className="filter-count-badge">{stats.totalCount}</span>
                </button>
                <button
                  className={`filter-pill ${filterStatus === "SERVING" ? "active" : ""}`}
                  onClick={() => setFilterStatus("SERVING")}
                >
                  Đang phục vụ{" "}
                  <span className="filter-count-badge">
                    {stats.servingCount}
                  </span>
                </button>
                <button
                  className={`filter-pill ${filterStatus === "NEW_ORDER" ? "active" : ""}`}
                  onClick={() => setFilterStatus("NEW_ORDER")}
                >
                  Đơn mới{" "}
                  <span className="filter-count-badge">
                    {stats.newOrderCount}
                  </span>
                </button>
                <button
                  className={`filter-pill ${filterStatus === "BILL" ? "active" : ""}`}
                  onClick={() => setFilterStatus("BILL")}
                >
                  Chờ tính tiền{" "}
                  <span className="filter-count-badge">{stats.billCount}</span>
                </button>
                {stats.callCount > 0 && (
                  <button
                    className={`filter-pill ${filterStatus === "CALL" ? "active" : ""}`}
                    onClick={() => setFilterStatus("CALL")}
                  >
                    Gọi NV{" "}
                    <span className="filter-count-badge">
                      {stats.callCount}
                    </span>
                  </button>
                )}
                <button
                  className={`filter-pill ${filterStatus === "EMPTY" ? "active" : ""}`}
                  onClick={() => setFilterStatus("EMPTY")}
                >
                  Bàn trống{" "}
                  <span className="filter-count-badge">{stats.emptyCount}</span>
                </button>
                {stats.unavailableCount > 0 && (
                  <button
                    className={`filter-pill ${filterStatus === "UNAVAILABLE" ? "active" : ""}`}
                    onClick={() => setFilterStatus("UNAVAILABLE")}
                  >
                    Bảo trì / Hỏng{" "}
                    <span className="filter-count-badge">
                      {stats.unavailableCount}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {filteredTables.length === 0 ? (
              <div className="floor-empty">
                {loading
                  ? "Đang tải sơ đồ bàn..."
                  : "Không có bàn nào trong bộ lọc này."}
              </div>
            ) : (
              <div className="grid-table">
                {filteredTables.map((t) => {
                  const visual = getTableVisualState(t);
                  return (
                    <button
                      key={t.id}
                      className={`table-card ${visual.cardClass} ${
                        t.id === selectedId ? "selected" : ""
                      }`}
                      onClick={() => setSelectedId(t.id)}
                      aria-label={`Chọn bàn ${t.name}`}
                    >
                      <div className="table-card-top">
                        <div className="table-num">Bàn {t.name}</div>
                        <span className="table-card-status-badge">
                          {visual.statusLabel}
                        </span>
                      </div>

                      <div className="table-card-bottom">
                        <div className="table-card-desc">
                          {visual.descLabel}
                        </div>
                        {t.physicalState &&
                          t.physicalState !== "GOOD" &&
                          t.physicalState !== "ACTIVE" && (
                            <div className="table-card-meta">
                              {t.physicalState}
                            </div>
                          )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ----------------- PHIẾU HÓA ĐƠN (RECEIPT PANEL) ----------------- */}
          <section className="order-detail">
            {!selectedTable ? (
              <div className="order-empty-message">
                Vui lòng chọn một bàn từ sơ đồ để xem chi tiết hóa đơn.
              </div>
            ) : (
              (() => {
                const selectedVisual = getTableVisualState(selectedTable);
                return (
                  <>
                    <div className="order-detail-header">
                      <div className="order-head">
                        <h3 className="order-title">
                          Bàn {selectedTable.name}
                        </h3>
                        <span
                          className={`order-badge ${selectedVisual.badgeClass}`}
                        >
                          {selectedVisual.statusLabel}
                        </span>
                      </div>

                      <div className="order-meta">
                        <span>
                          {customerName ? customerName : "Khách vãng lai"}
                        </span>
                        <span className="order-meta-dot">•</span>
                        <span>
                          {openAt ? `Vào lúc ${openAt}` : "Chưa có giờ vào"}
                        </span>
                      </div>
                    </div>

                    <div className="order-body">
                      {selectedTable.physicalState === "MAINTENANCE" && (
                        <div className="table-warning-banner banner-maintenance">
                          ⚠️ Bàn này đang BẢO TRÌ — Tạm ngưng phục vụ khách.
                        </div>
                      )}
                      {selectedTable.physicalState === "BROKEN" && (
                        <div className="table-warning-banner banner-broken">
                          🚫 Bàn này đang BỊ HỎNG — Vui lòng kiểm tra sửa chữa.
                        </div>
                      )}

                      <div className="order-table-head">
                        <span>Món đã gọi ({totalItemsCount})</span>
                        <span>Thành tiền</span>
                      </div>

                      <div className="order-scroll">
                        {details.length === 0 ? (
                          <div className="order-empty-message">
                            Bàn này hiện chưa có món nào được gọi.
                          </div>
                        ) : (
                          <div className="order-list">
                            {details.map((d) => (
                              <div className="order-row" key={d.id}>
                                <div className="order-row-main">
                                  <div className="order-item-left">
                                    <div className="order-item-title-row">
                                      <span className="order-name">
                                        {d.name}
                                      </span>
                                      {d.status === "ORDERED" && (
                                        <span className="tag tag-new">Mới</span>
                                      )}
                                      {d.status === "CONFIRMED" && (
                                        <span className="tag tag-confirmed">
                                          Đã gửi bếp
                                        </span>
                                      )}
                                      {d.status === "SERVED" && (
                                        <span className="tag tag-served">
                                          Đã phục vụ
                                        </span>
                                      )}
                                      {d.status === "PENDING" && (
                                        <span className="tag tag-pending">
                                          Chưa gọi
                                        </span>
                                      )}
                                    </div>

                                    {d.note && (
                                      <div className="order-item-note">
                                        "{d.note}"
                                      </div>
                                    )}

                                    <div className="order-item-subinfo">
                                      <span className="order-item-qty">
                                        x{d.qty}
                                      </span>
                                      <span>{fmt(d.price)}</span>
                                    </div>
                                  </div>

                                  <div className="order-item-right">
                                    <span className="order-price">
                                      {fmt(d.total)}
                                    </span>
                                    <div className="order-item-actions">
                                      <button
                                        className="action-btn-mini"
                                        onClick={() => handleEditItem(d)}
                                        title="Sửa số lượng hoặc ghi chú"
                                      >
                                        ✎ Sửa
                                      </button>
                                      <button
                                        className="action-btn-mini delete"
                                        onClick={() => handleRemoveItem(d)}
                                        title="Xóa món khỏi đơn"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="order-total-card">
                        <div className="order-total-row">
                          <span className="total-label">Tổng thanh toán</span>
                          <span className="total-value">{fmt(total)}</span>
                        </div>

                        <div className="order-actions-group">
                          {showNhanDon && (
                            <button
                              className="btn-pos-primary btn-nhandon"
                              onClick={handleNhanDon}
                              disabled={loading}
                            >
                              Nhận đơn xuống bếp
                            </button>
                          )}

                          {showServed && (
                            <button
                              className="btn-pos-primary btn-served"
                              onClick={handleServeAll}
                              disabled={loading}
                            >
                              Xác nhận đã lên món
                            </button>
                          )}

                          <button
                            className="btn-pos-primary btn-thanhtoan"
                            onClick={openPayModal}
                            disabled={loading || details.length === 0}
                          >
                            {showPay
                              ? "Thanh toán (Khách chờ tính tiền)"
                              : "Thanh toán hóa đơn"}
                          </button>

                          {!showAccept && !showPay && details.length === 0 && (
                            <div className="action-empty-hint">
                              Bàn trống chưa có đơn hàng
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()
            )}
          </section>
        </div>
      </main>

      <footer>
        <p className="footer-contact-info">
          <strong>SMART CAFÉ MANAGER · POS</strong>
          <br />
          Chấp nhận: Tiền mặt, Thẻ Visa/MasterCard, Chuyển khoản QR
          <br />
          Hotline hỗ trợ kỹ thuật: 1900 1900 · Địa chỉ: TP. Hồ Chí Minh
        </p>
      </footer>

      {/* ------------------------- Modal thanh toán ------------------------- */}
      {payOpen && selectedTable && (
        <div className="modal-overlay" onClick={() => setPayOpen(false)}>
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-title">
              Thanh toán · Bàn {selectedTable.name}
            </div>

            <div className="pay-table">
              <div className="pay-row">
                <span className="pay-label">Tổng hóa đơn</span>
                <span className="pay-value">{fmt(total)}</span>
              </div>
              <div className="pay-row">
                <span className="pay-label">Tiền khách đưa</span>
                <input
                  type="number"
                  className="pay-input"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={cash}
                  autoFocus
                  onChange={(e) => setCash(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleXacNhanThanhToan()
                  }
                />
              </div>
              <div className="pay-row pay-change">
                <span className="pay-label">Tiền thối lại</span>
                <span className="pay-value">
                  {change >= 0 ? fmt(change) : "—"}
                </span>
              </div>
            </div>

            <div className="pay-quick-grid">
              <button
                className="quick-cash-btn"
                onClick={() => setCash(String(total))}
              >
                Đúng tiền
              </button>
              {QUICK_CASH.filter((v) => v >= total).map((v) => (
                <button
                  key={v}
                  className="quick-cash-btn"
                  onClick={() => setCash(String(v))}
                >
                  {fmt(v)}
                </button>
              ))}
            </div>

            {Number(cash) > 0 && change < 0 && (
              <div className="pay-warning">
                Tiền khách đưa chưa đủ (còn thiếu {fmt(Math.abs(change))})
              </div>
            )}

            <div className="modal-actions-row">
              <button
                className="btn-modal-primary"
                onClick={handleXacNhanThanhToan}
                disabled={!canFinish}
              >
                {loading ? "Đang xử lý..." : "Hoàn tất thu tiền"}
              </button>
              <button
                className="btn-modal-ghost"
                onClick={() => setPayOpen(false)}
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------ Modal đã thu tiền ------------------------- */}
      {doneOpen && selectedTable && (
        <div className="modal-overlay" onClick={closeDone}>
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="done-icon-circle">✓</div>
            <div className="modal-title done-title">Thanh toán hoàn tất</div>
            <p className="done-text">
              Hóa đơn <strong>Bàn {selectedTable.name}</strong> đã được thanh
              toán.
            </p>
            <p className="done-text done-muted">Tiền thối cho khách</p>
            <p className="done-change">{fmt(lastChange)}</p>
            <div className="modal-actions-row">
              <button className="btn-modal-primary" onClick={closeDone}>
                Đóng & Giải phóng bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- Chuông thông báo nổi -------------------- */}
      {notifications.length > 0 && (
        <div className="notif-bell-wrap">
          {bellOpen && (
            <div
              className="notif-panel"
              role="dialog"
              aria-label="Danh sách thông báo"
            >
              <div className="notif-panel-head">
                <span>Thông báo ({notifications.length})</span>
                <button className="notif-clear" onClick={clearNotifications}>
                  Xoá hết
                </button>
              </div>
              <div className="notif-list">
                {notifications.map((n) => (
                  <div className={`notif-item ${n.type}`} key={n.id}>
                    <span className="notif-dot" />
                    <div className="notif-body">
                      <div className="notif-text">{n.text}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                    <button
                      className="notif-close"
                      onClick={() => removeNotification(n.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className="notif-bell"
            onClick={() => setBellOpen((v) => !v)}
            aria-label={`${notifications.length} thông báo`}
          >
            <span style={{ fontSize: "20px" }}>🔔</span>
            <span className="notif-badge">{notifications.length}</span>
          </button>
        </div>
      )}

      {/* Modal sửa món trong hóa đơn */}
      <EditItemModal
        open={Boolean(editItem)}
        item={editItem}
        loading={loading}
        onSubmit={submitEdit}
        onClose={() => setEditItem(null)}
      />

      {/* Modal xác nhận xoá món */}
      <ConfirmModal
        open={Boolean(deleteItem)}
        title="Xoá món"
        message={
          deleteItem
            ? `Bạn chắc chắn muốn xoá "${deleteItem.name}" khỏi hóa đơn?`
            : ""
        }
        confirmText="Xoá"
        danger
        loading={loading}
        onConfirm={confirmDelete}
        onClose={() => setDeleteItem(null)}
      />
    </div>
  );
}

export default SaleManager;
