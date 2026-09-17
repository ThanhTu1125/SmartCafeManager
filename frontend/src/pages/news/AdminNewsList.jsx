import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  getAdminNewsList,
  deleteNews,
  changeNewsStatus,
  getApiErrorMessage,
} from "../../services/apiService";
import { formatNewsDate, NEWS_STATUS_LABEL } from "../../utils/newsHelpers";
import { notifyError, notifySuccess } from "../../utils/toast";
import "../../styles/news.css";

const PAGE_SIZE = 10;

export default function AdminNewsList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortKey, setSortKey] = useState("time");
  const [sortDir, setSortDir] = useState("desc");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    getAdminNewsList(page, PAGE_SIZE)
      .then((res) => {
        const data = res.data || {};
        setItems(data.content || []);
        setTotalPages(Math.max(1, data.totalPages || 1));
        setTotalElements(data.totalElements ?? (data.content || []).length);
      })
      .catch((err) => {
        setItems([]);
        setError(getApiErrorMessage(err, "Không tải được danh sách tin tức."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const visible = useMemo(() => {
    let rows = [...items];
    if (filterStatus) {
      rows = rows.filter((r) => r.status === filterStatus);
    }
    rows.sort((a, b) => {
      const va =
        sortKey === "title"
          ? a.title || ""
          : new Date(a.createdAt || 0).getTime();
      const vb =
        sortKey === "title"
          ? b.title || ""
          : new Date(b.createdAt || 0).getTime();
      if (typeof va === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return rows;
  }, [items, filterStatus, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa tin tức này?")) return;
    setBusyId(id);
    try {
      await deleteNews(id);
      load();
    } catch (err) {
      notifyError(getApiErrorMessage(err, "Xóa tin thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  const handleStatus = async (id, status) => {
    setBusyId(id);
    try {
      await changeNewsStatus(id, status);
      notifySuccess("Cập nhật trạng thái thành công");
      load();
    } catch (err) {
      notifyError(getApiErrorMessage(err, "Đổi trạng thái thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Header />
      <main className="news-page">
        <div className="wrap wrap-wide">
          <div className="page-head">
            <div>
              <h1 className="page-title">Quản lý tin tức</h1>
              <p className="page-sub">
                Thêm, sửa, xóa và duyệt bài viết NEOCAFÉ (chỉ Admin).
              </p>
            </div>
            <div className="page-head-actions">
              <span className="page-count">
                {loading ? "Đang tải…" : `${totalElements} bài viết`}
              </span>
              <Link to="/admin/news/new" className="news-btn news-btn-primary">
                + Tạo tin mới
              </Link>
            </div>
          </div>

          <div className="filter-bar">
            <div className="filter-field">
              <label htmlFor="filterStatus">Lọc theo trạng thái</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PUBLISHED">Đã đăng</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
            <button
              type="button"
              className="filter-clear"
              onClick={() => setFilterStatus("")}
            >
              Xóa lọc
            </button>
          </div>

          {loading && <div className="news-loading">Đang tải…</div>}
          {!loading && error && <div className="news-error">{error}</div>}

          {!loading && !error && (
            <div className="table-scroll">
              <table className="fb-table">
                <thead>
                  <tr>
                    <th style={{ width: 56 }}>STT</th>
                    <th className="sortable" onClick={() => toggleSort("time")}>
                      Thời gian đăng{" "}
                      <span className="sort-ind">
                        {sortKey === "time"
                          ? sortDir === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </span>
                    </th>
                    <th
                      className="sortable"
                      onClick={() => toggleSort("title")}
                    >
                      Tiêu đề{" "}
                      <span className="sort-ind">
                        {sortKey === "title"
                          ? sortDir === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </span>
                    </th>
                    <th>Người đăng</th>
                    <th>Tóm tắt</th>
                    <th>Trạng thái</th>
                    <th>Ảnh</th>
                    <th style={{ width: 220 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-empty">
                        Không có tin tức nào khớp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    visible.map((row, index) => (
                      <tr key={row.newsId}>
                        <td className="col-id">
                          {page * PAGE_SIZE + index + 1}
                        </td>
                        <td className="col-time">
                          {formatNewsDate(row.createdAt)}
                        </td>
                        <td className="col-name">{row.title}</td>
                        <td className="col-author">
                          {row.authorUsername || "—"}
                        </td>
                        <td className="col-content">{row.summary || "—"}</td>
                        <td>
                          <span
                            className={`status-badge status-${(row.status || "").toLowerCase()}`}
                          >
                            {NEWS_STATUS_LABEL[row.status] || row.status}
                          </span>
                        </td>
                        <td>
                          {row.imageUrl ? (
                            <div className="thumbs">
                              <button
                                type="button"
                                className="thumb"
                                onClick={() =>
                                  navigate(`/admin/news/${row.newsId}`)
                                }
                              >
                                <img src={row.imageUrl} alt="" />
                              </button>
                            </div>
                          ) : (
                            <span className="no-img">—</span>
                          )}
                        </td>
                        <td>
                          <div className="action-row">
                            <button
                              type="button"
                              className="news-btn news-btn-sm"
                              onClick={() =>
                                navigate(`/admin/news/${row.newsId}`)
                              }
                            >
                              Xem
                            </button>
                            <button
                              type="button"
                              className="news-btn news-btn-sm"
                              onClick={() =>
                                navigate(`/admin/news/${row.newsId}/edit`)
                              }
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="news-btn news-btn-sm news-btn-danger"
                              disabled={busyId === row.newsId}
                              onClick={() => handleDelete(row.newsId)}
                            >
                              Xóa
                            </button>
                            {row.status !== "PUBLISHED" && (
                              <button
                                type="button"
                                className="news-btn news-btn-sm news-btn-primary"
                                disabled={busyId === row.newsId}
                                onClick={() =>
                                  handleStatus(row.newsId, "PUBLISHED")
                                }
                              >
                                Duyệt
                              </button>
                            )}
                            {row.status === "PUBLISHED" && (
                              <button
                                type="button"
                                className="news-btn news-btn-sm"
                                disabled={busyId === row.newsId}
                                onClick={() =>
                                  handleStatus(row.newsId, "REJECTED")
                                }
                              >
                                Ẩn
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
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="news-pagination">
              <button
                type="button"
                className="news-pg-btn"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <div className="news-pg-nums">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`news-pg-num ${page === i ? "active" : ""}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="news-pg-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
