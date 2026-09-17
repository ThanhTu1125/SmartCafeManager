import React, { useEffect, useMemo, useState, useCallback } from "react";
import "../../styles/feedback-manager.css";
import { Link } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import Logo from "../../components/Logo";
import { getAllFeedbacks, getApiErrorMessage } from "../../services/apiService";
import MenuButton from "../../components/menu-button";
import { getHomePath } from "../../utils/authRedirect";

/* Số phản hồi hiển thị mỗi trang */
const PAGE_SIZE = 10;

/* Định dạng ngày giờ: 2026-08-03T15:13:12.875Z -> 03/08/2026 15:13 */
const pad = (n) => String(n).padStart(2, "0");
const fmtTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
};

/* Chuẩn hoá feedback từ API (feedbackId/senderName/imageUrl/sentAt)
   về shape nội bộ (id/name/img/time) dùng trong bảng
   Lưu ý: API trả imageUrl là 1 chuỗi -> mỗi phản hồi tối đa 1 ảnh */
const normalizeFeedback = (f) => ({
  id: f.feedbackId,
  ts: f.sentAt ? new Date(f.sentAt).getTime() : 0, // dùng để sắp xếp
  time: fmtTime(f.sentAt), // dùng để hiển thị
  name: f.senderName || "Khách ẩn danh",
  email: f.email || "—",
  itemId: f.itemId,
  item: f.itemName || "—",
  rating: Number(f.rating) || 0,
  content: f.content || "",
  img: f.imageUrl || "",
});

function FeedbackManager() {
  const [feedbacks, setFeedbacks] = useState([]); // danh sách lấy từ server
  const [category, setCategory] = useState(""); // lọc theo món ("" = tất cả)
  const [starFilter, setStarFilter] = useState(""); // lọc theo số sao ("" = tất cả)
  const [sortKey, setSortKey] = useState("time"); // "time" | "rating"
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(null); // ảnh đang phóng to
  const [message, setMessage] = useState(""); // thông báo kết quả API
  const [loading, setLoading] = useState(false);

  const notify = (msg) => {
    setMessage(String(msg));
    setTimeout(() => setMessage(""), 4000);
  };

  /* ===== API 16: Lấy toàn bộ phản hồi ===== */
  const loadFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllFeedbacks();
      const list = Array.isArray(res.data)
        ? res.data.map(normalizeFeedback)
        : [];
      setFeedbacks(list);
    } catch (err) {
      setFeedbacks([]);
      notify(getApiErrorMessage(err, "Không tải được danh sách phản hồi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  /* Danh sách món sinh tự động từ dữ liệu phản hồi */
  const categories = useMemo(
    () =>
      [
        ...new Set(feedbacks.map((f) => f.item).filter((v) => v && v !== "—")),
      ].sort(),
    [feedbacks],
  );

  /* Lọc + sắp xếp */
  const filtered = useMemo(() => {
    const rows = feedbacks.filter(
      (f) =>
        (!category || f.item === category) &&
        (!starFilter || f.rating === Number(starFilter)),
    );
    return rows.sort((a, b) => {
      const va = sortKey === "rating" ? a.rating : a.ts;
      const vb = sortKey === "rating" ? b.rating : b.ts;
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [feedbacks, category, starFilter, sortKey, sortDir]);

  /* Phân trang */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  /* Đổi bộ lọc / cách sắp xếp thì quay về trang đầu */
  useEffect(() => {
    setPage(1);
  }, [category, starFilter, sortKey, sortDir]);

  const changeSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc"); // bấm lại đảo chiều
    } else {
      setSortKey(key);
      setSortDir("desc"); // cột mới: mặc định mới nhất / cao nhất trước
    }
  };

  const clearFilter = () => {
    setCategory("");
    setStarFilter("");
  };

  const sortIcon = (key) =>
    sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : "";

  /* Đóng ảnh phóng to bằng phím Esc */
  useEffect(() => {
    if (!preview) return;
    const onKey = (e) => {
      if (e.key === "Escape") setPreview(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [preview]);

  //Thực hiện kết nối WebSocket để nhận thông báo từ server khi có sự kiện mới liên quan đến bàn
  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws", // Đổi thành IP backend thực tế
      reconnectDelay: 5000,
      onConnect: () => {
        console.log(`[WebSocket] Đã kết nối.`);

        // Đăng ký nhận tin nhắn của riêng bàn này
        client.subscribe(`/topic/table-events`, (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            console.log("[WebSocket] Nhận thông báo:", data);
            onMessageReceived(data?.message, "info", data?.type, data?.tableId); // Gọi hàm callback để update UI
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
      console.log(`[WebSocket] Đã ngắt kết nối`);
    };
  }, []);

  const renderStars = (n) => (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? "" : "off"}>
          ★
        </span>
      ))}
      <span className="rating-num">{n}/5</span>
    </div>
  );

  return (
    <div className="feedback-manager">
      <header>
        <div className="header-row">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <MenuButton />
            <Link to={getHomePath()} className="brand" title="Trang chủ">
              <Logo className="brand-logo" />
              <h1 className="brand-name-bold">NEO</h1>
              <h1 className="brand-name-not-bold">CAFÉ</h1>
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
              {(localStorage.getItem("roleName") || "STAFF").toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Thông báo kết quả API */}
      {message && (
        <div className="api-message" role="status">
          {message}
        </div>
      )}

      <main>
        <div className="page-head">
          <h3 className="page-title">Danh sách phản hồi</h3>
          <span className="page-count">
            {loading ? "Đang tải..." : `${filtered.length} phản hồi`}
          </span>
        </div>

        {/* Bộ lọc.
            API FeedbackResponse không trả về thông tin bàn nên không lọc theo bàn được. */}
        <div className="filter-bar">
          <div className="filter-field">
            <label htmlFor="filter-item" className="filter-label">
              Lọc theo món
            </label>
            <select
              id="filter-item"
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Tất cả món</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="filter-star" className="filter-label">
              Lọc theo đánh giá
            </label>
            <select
              id="filter-star"
              className="filter-select"
              value={starFilter}
              onChange={(e) => setStarFilter(e.target.value)}
            >
              <option value="">Tất cả đánh giá</option>
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>
                  {s} sao
                </option>
              ))}
            </select>
          </div>

          <button className="btn-clear" onClick={clearFilter}>
            Xóa lọc
          </button>
        </div>

        <div className="table-scroll">
          <table className="fb-table">
            <thead>
              <tr>
                <th className="th-id">ID</th>
                <th className="sortable" onClick={() => changeSort("time")}>
                  Gửi lúc <span className="sort-ind">{sortIcon("time")}</span>
                </th>
                <th>Người gửi</th>
                <th>Email</th>
                <th>Món</th>
                <th className="sortable" onClick={() => changeSort("rating")}>
                  Đánh giá{" "}
                  <span className="sort-ind">{sortIcon("rating")}</span>
                </th>
                <th>Nội dung</th>
                <th>Hình ảnh</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="table-empty">
                    Đang tải phản hồi...
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="table-empty">
                    {feedbacks.length === 0
                      ? "Chưa có phản hồi nào."
                      : "Không có phản hồi nào khớp bộ lọc."}
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((r) => (
                  <tr key={r.id}>
                    <td className="col-id">#{r.id}</td>
                    <td className="col-time">{r.time}</td>
                    <td className="col-name">{r.name}</td>
                    <td className="col-email">{r.email}</td>
                    <td className="col-item">{r.item}</td>
                    <td>{renderStars(r.rating)}</td>
                    <td className="col-content">{r.content || "—"}</td>
                    <td>
                      {r.img ? (
                        <button
                          className="thumb"
                          onClick={() => setPreview(r.img)}
                          aria-label={`Xem ảnh phản hồi #${r.id}`}
                        >
                          <img src={r.img} alt="" className="thumb-img" />
                        </button>
                      ) : (
                        <span className="no-img">—</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="pagination">
            <button
              className="pg-btn"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              ← Trước
            </button>
            <div className="pg-nums">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`pg-num ${currentPage === n ? "active" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              className="pg-btn"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Sau →
            </button>
          </div>
        )}
      </main>

      <footer>
        <Logo className="brand-logo" />
        <p className="contact-infor">
          Chấp nhận : Visa, MasterCard, Vouchers
          <br />
          Phí giao dịch áp dụng cho thẻ tín dụng
          <br />
          Hotline/Số điện thoại: 19001900
          <br />
          Địa chỉ quán: Số 1 đường Võ Văn Ngân, phường Thủ Đức, thành phố Hồ Chí
          Minh
        </p>
      </footer>

      {/* Ảnh phóng to */}
      {preview && (
        <div className="lightbox" onClick={() => setPreview(null)}>
          <img
            src={preview}
            alt="Ảnh phản hồi"
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-close"
            onClick={() => setPreview(null)}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default FeedbackManager;
