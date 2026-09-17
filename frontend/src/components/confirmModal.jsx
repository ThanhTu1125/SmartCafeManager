import React, { useEffect } from "react";

/* Modal xác nhận dùng chung (xoá món, và các hành động nguy hiểm khác).
   Props:
   - open
   - title
   - message
   - confirmText (mặc định "Xác nhận")
   - danger      : true -> nút xác nhận màu đỏ
   - loading
   - onConfirm
   - onClose */
function ConfirmModal({ open, title, message, confirmText = "Xác nhận", danger, loading, onConfirm, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="modal-title" id="confirm-title">{title}</div>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
          <button className="btn btn-ghost" disabled={loading} onClick={onClose}>Huỷ</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;