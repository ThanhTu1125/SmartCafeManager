import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/staff-news.css";
import NewsEditorModal from "../../components/newsEditorModal";
import {
  getAdminNewsList,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  changeNewsStatus,
  getApiErrorMessage,
  getStaffFeed,
} from "../../services/apiService";
import { ToastService } from "../../services/toastService";
import Logo from "../../components/Logo";
import MenuButton from "../../components/menu-button";
import { getHomePath } from "../../utils/authRedirect";
const PAGE_SIZE = 10;

/* Nhãn + màu cho 4 trạng thái bài viết */
const STATUS_LABEL = {
  PUBLISHED: "Đã đăng",
  PENDING: "Chờ duyệt",
};

/* Đọc role người đang đăng nhập từ localStorage */
const getRole = () => (localStorage.getItem("roleName") || "").toUpperCase();

/* Username người đang đăng nhập — để đối chiếu quyền sở hữu tin.
   Chỉnh key nếu app bạn lưu username dưới tên khác. */
const getUsername = () => localStorage.getItem("userName") || "";

/* Định dạng ISO datetime -> "dd/mm/yyyy HH:MM" (giờ địa phương) */
const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

function StaffNewsManager() {
  const isAdmin = getRole() === "ADMIN";
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [myNewsIds, setMyNewsIds] = useState(() => new Set()); // newsId do staff hiện tại tạo
  const [page, setPage] = useState(0); // API dùng index từ 0
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const notify = (msg, type = "info") => {
    const text = String(msg);
    if (type === "success") ToastService.success(text);
    else if (type === "error") ToastService.error(text);
    else ToastService.info(text);
  };

  /* Hiển thị TẤT CẢ tin (getNewsList), nhưng chỉ thao tác được trên tin
     do chính staff hiện tại tạo. Đối chiếu bằng getStaffNews (/news/my-news).
     Admin thì thấy tất cả và thao tác được hết. */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Cả admin lẫn staff đều xem TẤT CẢ tin; response mới đã kèm field `author`
      // nên không cần gọi thêm /my-news để biết tin của ai.
      const res = isAdmin
        ? await getAdminNewsList(page, PAGE_SIZE)
        : await getStaffFeed(page, PAGE_SIZE);
      const data = res.data || {};
      console.log(res.data);
      const list = Array.isArray(data) ? data : data.content || [];
      setNews(list);
      setTotalPages(Math.max(1, data.totalPages || 1));
      setTotalElements(data.totalElements ?? list.length);

      // Staff: tin được sửa/xoá = tin có author trùng username hiện tại
      if (!isAdmin) {
        const me = getUsername();
        const mineIds = list
          .filter((n) => n.author && n.author === me)
          .map((n) => n.newsId);
        setMyNewsIds(new Set(mineIds));
      }
    } catch (err) {
      setNews([]);
      notify(err, "error");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, page]);

  useEffect(() => {
    load();
  }, [load]);

  /* Lọc phía client trên trang hiện tại (từ khoá + trạng thái) */
  const visible = useMemo(() => {
    return news.filter((n) => {
      const okKw =
        !keyword ||
        (n.title || "").toLowerCase().includes(keyword.toLowerCase());
      const okStatus = !statusFilter || n.status === statusFilter;
      return okKw && okStatus;
    });
  }, [news, keyword, statusFilter]);

  const openAdd = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  /* Mở modal sửa: fetch nội dung đầy đủ bằng getNewsById (danh sách thường chỉ có summary) */
  const openEdit = async (item) => {
    setBusyId(item.newsId);
    try {
      const res = await getNewsById(item.newsId);
      setEditing(res.data || item); // dùng dữ liệu đầy đủ từ API
    } catch (err) {
      notify(
        getApiErrorMessage(err, "Không tải được nội dung bài viết."),
        "error",
      );
      setEditing(item); // fallback: dùng dữ liệu đang có trên bảng
    } finally {
      setBusyId(null);
      setEditorOpen(true);
    }
  };

  /* Bấm vào ảnh/tiêu đề -> mở trang đọc bài (bất kể của ai) */
  const openReader = (id) => navigate(`/news/${id}`);

  const saveNews = async (data) => {
    try {
      const createNewPayload = {
        title: data.title,
        summary: data.summary || "",
        content: data.content,
        image: data.imageFile || null, // file ảnh mới (nếu có)
      };

      const updateNewPayload = {
        title: data.title,
        summary: data.summary || "",
        content: data.content,
        imageUrl: data.imageUrl,
        image: data.imageFile || null, // file ảnh mới (nếu có)
      };

      if (data.newsId) {
        await updateNews(data.newsId, updateNewPayload);
        notify("Cập nhật bài viết thành công.", "success");
      } else {
        await createNews(createNewPayload);
        notify("Tạo bài viết mới thành công.", "success");
      }
      setEditorOpen(false);
      await load();
    } catch (err) {
      notify(getApiErrorMessage(err, "Lưu bài viết thất bại."), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa tin tức này?")) return;
    setBusyId(id);
    try {
      await deleteNews(id);
      await load();
      notify("Xóa bài viết thành công.", "success");
    } catch (err) {
      notify(getApiErrorMessage(err, "Xóa bài viết thất bại."), "error");
    } finally {
      setBusyId(null);
      setEditorOpen(false);
    }
  };

  /* Duyệt / từ chối — chỉ admin */
  const handleStatus = async (id, status) => {
    setBusyId(id);
    try {
      await changeNewsStatus(id, status);
      await load();
      notify(
        status === "PUBLISHED"
          ? "Đã duyệt và đăng bài viết."
          : "Đã từ chối bài viết.",
        "success",
      );
    } catch (err) {
      notify(getApiErrorMessage(err, "Cập nhật trạng thái thất bại."), "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="news-manager">
      <div className="topbar">
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
      </div>

      <div className="wrap">
        <div className="page-header-block">
          <h2 className="page-title">Quản lý Bản tin & Sự kiện</h2>
          <p className="page-subtitle">
            Xem thông báo, cập nhật tin tức nội bộ và quản lý bài viết của quán.
          </p>
        </div>

        <div className="news-toolbar">
          <div className="filter-left">
            <input
              className="news-search"
              placeholder="Tìm theo tiêu đề bài viết..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <select
              className="news-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã đăng (PUBLISHED)</option>
              <option value="PENDING">Chờ duyệt (PENDING)</option>
            </select>
          </div>
          <button className="news-add-btn" onClick={openAdd}>
            ＋ Soạn bài viết mới
          </button>
        </div>

        {error && <div className="news-error">{error}</div>}

        <div className="news-table-wrap">
          <table className="news-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Bài viết</th>
                <th style={{ width: 260 }}>Tóm tắt</th>
                <th style={{ width: 140 }}>Tác giả</th>
                <th style={{ width: 160 }}>Thời gian tạo</th>
                <th style={{ width: 130 }}>Trạng thái</th>
                <th style={{ width: isAdmin ? 220 : 130 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="news-empty">
                    Đang tải danh sách bài viết...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="news-empty">
                    Không tìm thấy bài viết nào phù hợp.
                  </td>
                </tr>
              ) : (
                visible.map((n, i) => (
                  <tr key={n.newsId}>
                    <td>{page * PAGE_SIZE + i + 1}</td>
                    <td>
                      <div
                        className="title-cell clickable"
                        onClick={() => openReader(n.newsId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                          (e.key === "Enter" || e.key === " ") &&
                          openReader(n.newsId)
                        }
                        title="Bấm để xem chi tiết bài viết"
                      >
                        {n.imageUrl && (
                          <img
                            className="title-thumb"
                            src={n.imageUrl}
                            alt=""
                          />
                        )}
                        <span className="title-text">{n.title}</span>
                      </div>
                    </td>
                    <td className="summary-cell">{n.summary || "—"}</td>
                    <td className="author-cell">
                      <span className="author-pill">
                        {n.author || "Quản trị viên"}
                      </span>
                    </td>
                    <td className="time-cell">{formatDateTime(n.createdAt)}</td>
                    <td>
                      <span
                        className={`status-badge status-${(n.status || "").toLowerCase()}`}
                      >
                        {STATUS_LABEL[n.status] || n.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        {/* Chỉ tin do staff hiện tại tạo (hoặc admin) mới thao tác được */}
                        {isAdmin || myNewsIds.has(n.newsId) ? (
                          <>
                            <button
                              className="act-btn edit"
                              onClick={() => openEdit(n)}
                              title="Sửa bài viết"
                              disabled={busyId === n.newsId}
                            >
                              ✎ Sửa
                            </button>
                            <button
                              className="act-btn del"
                              onClick={() => handleDelete(n.newsId)}
                              title="Xóa bài viết"
                              disabled={busyId === n.newsId}
                            >
                              ✕ Xóa
                            </button>
                          </>
                        ) : (
                          <span
                            className="act-none"
                            title="Tin do người khác tạo"
                          >
                            —
                          </span>
                        )}

                        {/* Nút duyệt tin — CHỈ admin thấy */}
                        {isAdmin && n.status !== "PUBLISHED" && (
                          <button
                            className="act-btn approve"
                            onClick={() => handleStatus(n.newsId, "PUBLISHED")}
                            title="Duyệt và đăng bài viết"
                            disabled={busyId === n.newsId}
                          >
                            ✓ Duyệt
                          </button>
                        )}
                        {isAdmin && n.status === "PENDING" && (
                          <button
                            className="act-btn reject"
                            onClick={() => handleStatus(n.newsId, "REJECTED")}
                            title="Từ chối bài viết"
                            disabled={busyId === n.newsId}
                          >
                            Từ chối
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="news-foot">
          <span className="news-count">
            Trang {page + 1} / {totalPages} · Tổng {totalElements}
          </span>
          {totalPages > 1 && (
            <div className="news-pager">
              <button
                className="pg-btn"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`pg-num ${page === i ? "active" : ""}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="pg-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      <NewsEditorModal
        open={editorOpen}
        initial={editing}
        onSave={saveNews}
        onDelete={handleDelete}
        onClose={() => setEditorOpen(false)}
      />
    </div>
  );
}

export default StaffNewsManager;
