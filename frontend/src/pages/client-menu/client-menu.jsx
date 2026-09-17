import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Client } from '@stomp/stompjs';
import { ToastService } from "../../services/toastService";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/client-menu.css";
import AddDrinkModal from "../../components/add-drink";
import FeedbackModal from "../../components/feedback";
import CheckoutModal from "../../components/checkout";
import PaypalQrModal from "../../components/paypal-qr";
import { Link, useParams } from "react-router-dom";
import { logo } from "../../constants/assets";
import Logo from "../../components/Logo";
import MenuButton from "../../components/menu-button";
import { getHomePath } from "../../utils/authRedirect";
import {
  getAllItems,
  addItemToCart,
  getCart,
  confirmOrder,
  getPaymentQRCode,
  getInvoice,
  callService,
  getApiErrorMessage,
  updateItemQuantity,
  removeItem,
  payWithCash,
  sentFeedback,
  sendAIPrompt
} from "../../services/apiService";
import AiBubble from "../../components/ai-buble";
import aiContext from "../../constants/context.txt?raw";

/* Menu dự phòng khi không kết nối được server (giữ đúng shape đã chuẩn hoá) */
const FALLBACK_MENU = [
  {
    id: 1,
    name: "Cà phê đen",
    price: 25000,
    category: "Coffee",
    img: "/images/iced-black-coffee.png",
    isAvailable: true,
  },
  {
    id: 2,
    name: "Cà phê sữa",
    price: 30000,
    category: "Coffee",
    img: "/images/cafe-sua-da.png",
    isAvailable: true,
  },
  {
    id: 3,
    name: "Cà phê hạt dẻ",
    price: 35000,
    category: "Coffee",
    img: "/images/cà phê hạt dẻ.png",
    isAvailable: true,
  },
  {
    id: 4,
    name: "Cà phê muối",
    price: 35000,
    category: "Coffee",
    img: "/images/cà_phê_muối.png",
    isAvailable: true,
  },
  {
    id: 5,
    name: "Bạc xỉu",
    price: 30000,
    category: "Coffee",
    img: "/images/Bạc_xỉu.png",
    isAvailable: true,
  },
  {
    id: 6,
    name: "Cappuccino",
    price: 35000,
    category: "Coffee",
    img: "/images/cappuccino.png",
    isAvailable: true,
  },
];

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

/* Chuẩn hoá item từ API về shape nội bộ */
const normalizeItem = (it) => ({
  id: it.itemId,
  name: it.itemName,
  price: it.price,
  category: it.categoryName ?? it.categoryId ?? "Khác",
  img: it.imageUrl || logo,
  description: it.description,
  isAvailable: it.isAvailable !== false,
});

function ClientMenu() {
  const tableId = localStorage.getItem("tableId") || "1";
  const [menuItems, setMenuItems] = useState([]);
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [history, setHistory] = useState([]);
  const [billTotal, setBillTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [tableOrderId, setTableOrderId] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paypalOpen, setPaypalOpen] = useState(false);
  const [paypalData, setPaypalData] = useState(null);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const notify = (msg, type = "info") => {
    const text = String(msg);
    if (type === "success") ToastService.success(text);
    else if (type === "error") ToastService.error(text);
    else ToastService.info(text);
  };

  const loadMenu = useCallback(async () => {
    try {
      const res = await getAllItems();
      const items = Array.isArray(res.data)
        ? res.data.map(normalizeItem)
        : [];
      setMenuItems(items);
      if (items.length > 0) setCategory(items[0].category);
    } catch (err) {
      setMenuItems(FALLBACK_MENU);
      setCategory(FALLBACK_MENU[0].category);
      notify(getApiErrorMessage(err, "Không tải được menu từ máy chủ."), "error");
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const categories = useMemo(
    () => [...new Set(menuItems.map((m) => m.category))],
    [menuItems],
  );

  const filtered = useMemo(() => {
    let list = menuItems;
    if (category) {
      list = list.filter((m) => m.category === category);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase().trim();
      list = list.filter((m) => m.name?.toLowerCase().includes(kw));
    }
    return list;
  }, [menuItems, category, searchKeyword]);

  const loadCart = useCallback(async () => {
    try {
      const res = await getCart(tableId);
      const data = res.data ?? {};
      setCart(Array.isArray(data.pendingItems) ? data.pendingItems : []);
      setHistory(Array.isArray(data.orderedItems) ? data.orderedItems : []);
      setBillTotal(data.currentTotalAmount ?? 0);
      setTableOrderId(data.tableOrderId ?? null);
    } catch (err) {
      setCart([]);
      setHistory([]);
      setBillTotal(0);
      setTableOrderId(null);
      if (err?.response?.status !== 500) {
        notify(getApiErrorMessage(err, "Không kết nối được máy chủ."), "error");
      }
    }
  }, [tableId]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const cartRows = cart.map((c) => ({
    orderDetailId: c.orderDetailId,
    name: c.itemName ?? "—",
    itemId: c.itemId,
    price: c.price,
    qty: c.quantity,
    note: c.note,
    status: c.status,
  }));

  const total = billTotal;
  const pendingCount = cartRows.reduce((sum, r) => sum + (r.qty || 1), 0);
  const totalItemCount = pendingCount + history.reduce((sum, r) => sum + (r.quantity || 1), 0);

  const historyRows = history.map((h) => ({
    orderDetailId: h.orderDetailId,
    name: h.itemName ?? "—",
    price: h.price,
    qty: h.quantity,
    note: h.note,
    status: h.status,
  }));

  const STATUS_LABEL = {
    CONFIRMED: "Đang pha chế",
    SERVED: "Đã phục vụ",
    CANCELLED: "Đã huỷ",
  };

  const confirmAddItem = async (item, qty, note) => {
    setLoading(true);
    try {
      await addItemToCart(tableId, item.id, qty, note);
      notify("Đã thêm món vào giỏ.", "success");
      await loadCart();
    } catch (err) {
      notify(getApiErrorMessage(err, "Thêm món thất bại."), "error");
    } finally {
      setLoading(false);
      setSelectedItem(null);
    }
  };

  const handleGoiMon = async () => {
    setLoading(true);
    try {
      await confirmOrder(tableId);
      notify("Gửi đơn xuống bếp thành công!", "success");
      await loadCart();
      setMobileCartOpen(false);
    } catch (err) {
      notify(getApiErrorMessage(err, "Gọi món thất bại."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleThanhToan = async () => {
    setLoading(true);
    try {
      const res = await getInvoice(tableId, tableOrderId);
      setInvoice(res.data);
      setCheckoutOpen(true);
      setMobileCartOpen(false);
    } catch (err) {
      notify("Không lấy được hóa đơn.", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmCheckout = async () => {
    if (paymentMethod === "CASH") {
      setLoading(true);
      try {
        await payWithCash(tableId);
        notify("Đã gửi yêu cầu thanh toán tiền mặt.");
        await callService(tableId, "REQUESTING_BILL");
        await loadCart();
      } catch (err) {
        notify(getApiErrorMessage(err, "Thanh toán tiền mặt thất bại."), "error");
      } finally {
        setCheckoutOpen(false);
        window.scrollTo(0, 0);
        setLoading(false);
      }
    } else if (paymentMethod === "BANK_TRANSFER") {
      setCheckoutOpen(false);
      setPaypalData(null);
      setPaypalLoading(true);
      setPaypalOpen(true);
      try {
        const res = await getPaymentQRCode(tableId);
        setPaypalData(res.data);
      } catch (err) {
        notify(getApiErrorMessage(err, "Không tạo được mã QR thanh toán."), "error");
      } finally {
        setPaypalLoading(false);
      }
    }
  };

  const handleGoiNhanVien = async () => {
    setLoading(true);
    try {
      await callService(tableId, "CALL_STAFF");
      notify("Đã gửi yêu cầu nhân viên hỗ trợ bàn.", "success");
    } catch (err) {
      notify(getApiErrorMessage(err, "Gọi nhân viên thất bại."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeQty = async (itemId, currentQty, note, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      return handleRemoveItem(itemId);
    }
    setLoading(true);
    try {
      await updateItemQuantity(tableId, itemId, note, newQty);
      notify("Cập nhật số lượng thành công.", "success");
      await loadCart();
    } catch (err) {
      notify(getApiErrorMessage(err, "Cập nhật số lượng thất bại."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setLoading(true);
    try {
      await removeItem(tableId, itemId);
      notify("Đã xóa món khỏi giỏ.", "success");
      await loadCart();
    } catch (err) {
      notify(getApiErrorMessage(err, "Xoá món thất bại."), "error");
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (data) => {
    try {
      await sentFeedback(
        data.noidung,
        data.rating,
        tableOrderId,
        data.hoten,
        data.email,
        data.image,
        data.itemId
      );
      setLoading(true);
      notify("Cảm ơn phản hồi của bạn!", "success");
    } catch (err) {
      notify(getApiErrorMessage(err, "Gửi phản hồi thất bại."), "error");
    } finally {
      setLoading(false);
      setFeedbackOpen(false);
    }
  };

  const onMessageReceived = async (msg, type = "info", msgType = null) => {
    if (msgType === "ALL_ITEMS_CONFIRMED" || msgType === "ODER_CONFIRMED") {
      notify("Bếp đã tiếp nhận đơn món!", "info");
    }
    try {
      await loadMenu();
      await loadCart();
    } catch (err) {
      notify(getApiErrorMessage(err, "Không tải được dữ liệu mới."), "error");
    }
  };

  useEffect(() => {
    if (!tableId) return;

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/table/${tableId}`, (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            onMessageReceived(data?.message, "info", data?.type, data?.tableId);
          }
        });
      },
      onStompError: (frame) => {
        console.error('[WebSocket] Lỗi STOMP: ', frame.headers['message']);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [tableId]);

  const handelSendAIPrompt = async (prompt, historyText) => {
    try {
      const message =
        `Bối cảnh hệ thống:\n${aiContext}\n\n` +
        `Lịch sử hội thoại:\n${historyText}\n` +
        `--------- Câu hỏi của người dùng: ${prompt}`;
      const res = await sendAIPrompt(message);
      return res?.data.reply;
    } catch (error) {
      notify("Gửi tin nhắn thất bại", "error");
      return "Có lỗi khi gửi tin nhắn.";
    }
  };

  const pickCategory = (c) => {
    setCategory(c);
  };

  // Render component nội dung đơn hàng (dùng chung cho sidebar desktop và drawer mobile)
  const renderOrderContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧾</span>
          <h3 className="text-base font-bold text-[#2E1F14]">Hóa đơn Bàn {tableId}</h3>
        </div>
        <button
          onClick={handleGoiNhanVien}
          disabled={loading}
          className="text-xs px-2.5 py-1 bg-[#FAF4EC] hover:bg-[#F5ECE0] text-[#5C4033] font-semibold rounded-full border border-amber-900/15 flex items-center gap-1 transition-all cursor-pointer"
        >
          <span>🔔</span>
          <span>Gọi NV</span>
        </button>
      </div>

      {/* Danh sách món cuộn */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 scrollbar-thin">
        {/* Món đã gọi xuống bếp */}
        {historyRows.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#A4B435] mb-2 flex items-center gap-1">
              <span>⏳</span>
              <span>Món đã gửi bếp ({historyRows.length})</span>
            </div>
            <div className="space-y-2">
              {historyRows.map((r) => (
                <div
                  key={r.orderDetailId}
                  className="bg-[#FAF8F5] p-2.5 rounded-xl border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs md:text-sm font-semibold text-[#3E2723] truncate">
                      {r.name}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {fmt(r.price)} <span className="text-[#8D6E63] font-bold">x{r.qty}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-[#8D6E63] text-[10px] font-bold rounded-md">
                      {STATUS_LABEL[r.status] || "Đang xử lý"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Giỏ tạm PENDING */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#D97706] mb-2 flex items-center gap-1">
            <span>🛒</span>
            <span>Món mới chọn ({cartRows.length})</span>
          </div>

          {cartRows.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400 bg-[#FAF8F5] rounded-xl border border-dashed border-gray-200">
              Chưa có món nào mới trong giỏ.
            </div>
          ) : (
            <div className="space-y-2">
              {cartRows.map((r) => (
                <div
                  key={r.orderDetailId}
                  className="bg-white p-2.5 rounded-xl border border-amber-900/10 shadow-xs flex items-center justify-between gap-2"
                >
                  <button
                    onClick={() => handleRemoveItem(r.itemId)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 text-sm p-1 rounded-full hover:bg-red-50 cursor-pointer"
                    title="Xóa món"
                  >
                    🗑️
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs md:text-sm font-bold text-[#2E1F14] truncate">
                      {r.name}
                    </div>
                    <div className="text-xs text-[#8D6E63] font-semibold">
                      {fmt(r.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-[#FAF4EC] p-1 rounded-lg border border-amber-900/10">
                    <button
                      onClick={() => handleChangeQty(r.itemId, r.qty, r.note, -1)}
                      disabled={loading}
                      className="w-5 h-5 rounded bg-white text-xs font-bold text-[#3E2723] shadow-xs flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-[#3E2723]">
                      {r.qty}
                    </span>
                    <button
                      onClick={() => handleChangeQty(r.itemId, r.qty, r.note, 1)}
                      disabled={loading}
                      className="w-5 h-5 rounded bg-[#3E2723] text-white text-xs font-bold shadow-xs flex items-center justify-center hover:bg-[#5C4D3F] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tổng tiền & Chọn phương thức thanh toán */}
      <div className="pt-3 border-t border-amber-900/10 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-600">Tổng hóa đơn:</span>
          <span className="text-base md:text-lg font-extrabold text-[#3E2723]">
            {fmt(total)}
          </span>
        </div>

        {/* Lựa chọn phương thức thanh toán */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <label className="text-gray-500 font-medium">Thanh toán:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="px-2.5 py-1.5 bg-[#FAF4EC] text-[#3E2723] font-semibold rounded-lg border border-amber-900/15 focus:outline-none focus:ring-1 focus:ring-[#8D6E63] text-xs cursor-pointer"
          >
            <option value="CASH">💵 Tiền mặt</option>
            <option value="BANK_TRANSFER">📱 Chuyển khoản / QR</option>
          </select>
        </div>

        {/* Cụm nút hành động */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleGoiMon}
            disabled={loading || cartRows.length === 0}
            className="w-full py-2.5 px-3 bg-[#3E2723] hover:bg-[#5C4D3F] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>🚀</span>
            <span>Gửi bếp gọi món</span>
          </button>

          <button
            onClick={handleThanhToan}
            disabled={loading || total <= 0}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-[#D2A97B] to-[#C2986A] hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-[#241711] font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>💳</span>
            <span>Thanh toán</span>
          </button>
        </div>

        <button
          onClick={() => setFeedbackOpen(true)}
          className="w-full py-1.5 text-center text-xs font-semibold text-[#8D6E63] hover:text-[#3E2723] transition-colors cursor-pointer"
        >
          💬 Đánh giá & Góp ý cho quán
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#FDFBF7] min-h-screen flex flex-col font-['Inter',sans-serif]">
      {/* 1. Header Gọi món chuyên nghiệp */}
      <header className="sticky top-0 z-30 bg-[#D2A97B] shadow-sm px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MenuButton />
            <Link to={getHomePath()} className="flex items-center gap-2 no-underline text-inherit" title="Trang chủ">
              <Logo className="h-9 w-9" />
              <div className="text-lg font-['Inter'] leading-none">
                <span className="font-bold text-[#000]">NEO</span>
                <span className="font-normal text-[#000]">CAFÉ</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-white/30 backdrop-blur-sm text-[#2E1F14] font-bold text-xs rounded-full border border-white/40 shadow-2xs">
              📍 Bàn {tableId}
            </div>

            <button
              onClick={handleGoiNhanVien}
              disabled={loading}
              className="px-3 py-1 bg-[#3E2723] text-white hover:bg-[#5C4D3F] font-semibold text-xs rounded-full shadow-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Gọi nhân viên phục vụ"
            >
              <span>🔔</span>
              <span className="hidden sm:inline">Gọi phục vụ</span>
            </button>
          </div>
        </div>
      </header>

      <ToastContainer position="top-center" autoClose={2500} />

      {/* 2. Nội dung chính: Menu + Sidebar đơn hàng */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 pb-28 md:pb-12">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Cột trái: Menu món ăn */}
          <div className="w-full lg:w-2/3 flex flex-col">
            {/* Thanh tìm kiếm & lọc danh mục */}
            <div className="bg-white p-4 rounded-2xl border border-amber-900/10 shadow-xs mb-4">
              <div className="relative mb-3">
                <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm món đồ uống yêu thích..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] focus:bg-white text-xs md:text-sm rounded-full border border-amber-900/15 focus:outline-none focus:ring-2 focus:ring-[#8D6E63] transition-all"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword("")}
                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Danh mục cuộn ngang */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => pickCategory(c)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      category === c
                        ? "bg-[#3E2723] text-[#E7C9A1] shadow-xs scale-102"
                        : "bg-[#FAF4EC] text-[#5C4033] hover:bg-[#F5ECE0] border border-amber-900/10"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Lưới món ăn (Drink Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {filtered.map((m) => (
                <div
                  key={m.id}
                  onClick={() => m.isAvailable && setSelectedItem(m)}
                  className={`bg-white rounded-2xl p-2.5 md:p-3 shadow-xs hover:shadow-md border border-amber-900/10 flex flex-col justify-between transition-all duration-200 group ${
                    m.isAvailable
                      ? "cursor-pointer hover:border-[#D2A97B]/60 active:scale-[0.98]"
                      : "opacity-60 cursor-not-allowed bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 mb-2.5">
                      <img
                        src={m.img}
                        alt={m.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                      {!m.isAvailable && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold rounded-xl">
                          Hết món
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-xs md:text-sm text-[#2E1F14] line-clamp-1 group-hover:text-[#A4B435] transition-colors">
                      {m.name}
                    </h4>
                    {m.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {m.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100">
                    <span className="text-xs md:text-sm font-extrabold text-[#5C4033]">
                      {fmt(m.price)}
                    </span>
                    {m.isAvailable && (
                      <button
                        type="button"
                        className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#3E2723] text-white flex items-center justify-center text-xs md:text-sm font-bold shadow-xs group-hover:bg-[#5C4D3F] transition-colors"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-sm text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                  <span className="text-3xl block mb-2">☕</span>
                  {menuItems.length === 0
                    ? "Đang tải menu..."
                    : `Không tìm thấy món nào trong mục "${category}".`}
                </div>
              )}
            </div>
          </div>

          {/* Cột phải (Desktop Sidebar): Chi tiết đơn hàng */}
          <div className="hidden lg:block w-1/3 sticky top-20 bg-white p-5 rounded-3xl border border-amber-900/10 shadow-sm max-h-[calc(100vh-100px)] flex flex-col">
            {renderOrderContent()}
          </div>
        </div>

        {/* Trợ lý AI */}
        <AiBubble onSendMessage={handelSendAIPrompt} />
      </main>

      {/* 3. THANH FLOATING CART Ở ĐÁY MÀN HÌNH (DÀNH CHO SMARTPHONE) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-900/15 p-3 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div
            onClick={() => setMobileCartOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer flex-1"
          >
            <div className="relative w-10 h-10 rounded-full bg-[#3E2723] text-white flex items-center justify-center text-lg shadow-sm">
              🛒
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D97706] text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                  {totalItemCount}
                </span>
              )}
            </div>
            <div>
              <div className="text-[11px] text-gray-500 font-medium leading-none">Tổng hóa đơn</div>
              <div className="text-sm font-extrabold text-[#3E2723]">{fmt(total)}</div>
            </div>
          </div>

          <button
            onClick={() => setMobileCartOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#3E2723] to-[#5C4033] text-[#E7C9A1] font-bold text-xs rounded-full shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Xem giỏ & Gọi món</span>
            <span>({pendingCount})</span>
          </button>
        </div>
      </div>

      {/* 4. MODAL / BOTTOM SHEET GIỎ HÀNG CHO SMARTPHONE */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div
            className="flex-1"
            onClick={() => setMobileCartOpen(false)}
          />
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500">Chi tiết bàn {tableId}</span>
              <button
                onClick={() => setMobileCartOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            {renderOrderContent()}
          </div>
        </div>
      )}

      {/* 5. CÁC MODALS CHỨC NĂNG */}
      <AddDrinkModal
        item={selectedItem}
        onConfirm={confirmAddItem}
        onClose={() => setSelectedItem(null)}
      />
      <FeedbackModal
        open={feedbackOpen}
        onSubmit={submitFeedback}
        onClose={() => setFeedbackOpen(false)}
        orderedItems={history}
      />
      <CheckoutModal
        open={checkoutOpen}
        invoice={invoice}
        paymentMethod={paymentMethod}
        onChangeMethod={setPaymentMethod}
        onConfirm={confirmCheckout}
        onClose={() => setCheckoutOpen(false)}
        loading={loading}
      />
      <PaypalQrModal
        open={paypalOpen}
        data={paypalData}
        loading={paypalLoading}
        onClose={() => setPaypalOpen(false)}
      />
    </div>
  );
}

export default ClientMenu;