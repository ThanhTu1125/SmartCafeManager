import React, { useEffect } from "react";

/* Modal danh sách nhân viên đã xem tin.
   Props: open, title, viewers[], onClose */
function ViewersModal({ open, title, viewers = [], onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="news-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="viewers-modal" role="dialog" aria-modal="true" aria-labelledby="viewers-title">
        <div className="news-modal-head">
          <span id="viewers-title">Danh sách nhân viên đã xem tin tức</span>
          <button className="news-x" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        <div className="viewers-body">
          {viewers.length === 0 ? (
            <div className="viewers-empty">Chưa có nhân viên nào xem tin này.</div>
          ) : (
            <table className="viewers-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nhân viên</th>
                  <th>Chức danh</th>
                  <th>Số điện thoại</th>
                  <th>Số lần xem</th>
                  <th>Xem lần đầu</th>
                  <th>Xem lần cuối</th>
                </tr>
              </thead>
              <tbody>
                {viewers.map((v, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="v-name">{v.name}</td>
                    <td>{v.role}</td>
                    <td>{v.phone}</td>
                    <td>{v.views}</td>
                    <td>{v.first}</td>
                    <td>{v.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewersModal;