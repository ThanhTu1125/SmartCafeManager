import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  getAdminItems,
  deleteAdminItem,
  restoreAdminItem,
  getApiErrorMessage,
} from "../../services/apiService";
import {
  formatVnd,
  extractCategories,
  availabilityLabel,
  canEditItems,
} from "../../utils/itemHelpers";
import { notifyError, notifySuccess } from "../../utils/toast";
import "../../styles/admin-items.css";

export default function AdminItemList() {
  const navigate = useNavigate();
  const canEdit = canEditItems();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    getAdminItems()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
        setItems(data);
      })
      .catch((err) => {
        setItems([]);
        setError(getApiErrorMessage(err, "Không tải được danh sách món."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => extractCategories(items), [items]);

  const visible = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter && String(item.categoryId) !== String(categoryFilter)) {
        return false;
      }
      if (statusFilter === "on" && !item.isAvailable) return false;
      if (statusFilter === "off" && item.isAvailable) return false;
      if (!keyword) return true;
      const hay = `${item.itemName || ""} ${item.itemCode || ""} ${item.categoryName || ""}`.toLowerCase();
      return hay.includes(keyword);
    });
  }, [items, q, categoryFilter, statusFilter]);

  const handleDelete = async (item) => {
    const ok = window.confirm(`Ngưng bán món "${item.itemName}"?`);
    if (!ok) return;
    setBusyId(item.itemId);
    try {
      await deleteAdminItem(item.itemId);
      notifySuccess("Đã ngưng bán món thành công.");
      load();
    } catch (err) {
      notifyError(getApiErrorMessage(err, "Xóa món thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async (item) => {
    setBusyId(item.itemId);
    try {
      await restoreAdminItem(item.itemId);
      notifySuccess("Đã chuyển món sang đang bán.");
      load();
    } catch (err) {
      notifyError(getApiErrorMessage(err, "Khôi phục món thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Header />
      <main className="items-page">
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1 className="page-title">Quản lý món</h1>
            </div>
            {canEdit && (
              <Link to="/admin/items/new" className="items-btn items-btn-primary">
                + Thêm món mới
              </Link>
            )}
          </div>

          <div className="items-toolbar">
            <input
              type="search"
              placeholder="Tìm theo tên, mã món, danh mục…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Tìm món"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Lọc danh mục"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Lọc trạng thái"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="on">Đang bán</option>
              <option value="off">Ngưng bán</option>
            </select>
            <button type="button" className="items-btn" onClick={load} disabled={loading}>
              Làm mới
            </button>
          </div>

          {loading && <div className="items-loading">Đang tải danh sách món…</div>}
          {!loading && error && <div className="items-error">{error}</div>}
          {!loading && !error && visible.length === 0 && (
            <div className="items-empty">
              Không có món phù hợp.
              {canEdit && (
                <>
                  {" "}
                  <Link to="/admin/items/new" className="items-back">
                    Thêm món đầu tiên →
                  </Link>
                </>
              )}
            </div>
          )}

          {!loading && !error && visible.length > 0 && (
            <div className="items-table-wrap">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Món</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => (
                    <tr key={item.itemId}>
                      <td>
                        {item.imageUrl ? (
                          <img
                            className="items-thumb"
                            src={item.imageUrl}
                            alt={item.itemName}
                          />
                        ) : (
                          <div className="items-thumb-empty">No img</div>
                        )}
                      </td>
                      <td>
                        <p className="items-name">{item.itemName}</p>
                        <div className="items-code">{item.itemCode}</div>
                      </td>
                      <td>{item.categoryName || "—"}</td>
                      <td>{formatVnd(item.price)}</td>
                      <td>
                        <span
                          className={`items-badge ${
                            item.isAvailable ? "items-badge-on" : "items-badge-off"
                          }`}
                        >
                          {availabilityLabel(item.isAvailable)}
                        </span>
                      </td>
                      <td>
                        <div className="items-actions">
                          {canEdit && (
                            <button
                              type="button"
                              className="items-btn"
                              onClick={() => navigate(`/admin/items/${item.itemId}/edit`)}
                            >
                              Sửa
                            </button>
                          )}
                          {item.isAvailable ? (
                            <button
                              type="button"
                              className="items-btn items-btn-danger"
                              disabled={busyId === item.itemId}
                              onClick={() => handleDelete(item)}
                            >
                              {busyId === item.itemId ? "…" : "Ngưng bán"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="items-btn items-btn-primary"
                              disabled={busyId === item.itemId}
                              onClick={() => handleRestore(item)}
                            >
                              {busyId === item.itemId ? "…" : "Đang bán"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
