import React, { useEffect, useState } from "react";

/* Modal sửa món trong hóa đơn (số lượng + ghi chú).
   Trường tương tự modal thêm món. Nếu số lượng = 0 thì mặc định là 1.
   Props:
   - open
   - item    : { id, name, qty, note, price, ... } (dòng chi tiết đang sửa)
   - loading
   - onSubmit({ quantity, note })
   - onClose */
function EditItemModal({ open, item, loading, onSubmit, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  // Nạp giá trị hiện tại mỗi khi mở modal / đổi món
  useEffect(() => {
    if (open && item) {
      setQuantity(item.qty > 0 ? item.qty : 1); // 0 -> mặc định 1
      setNote(item.note ?? "");
    }
  }, [open, item]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  const dec = () => setQuantity((q) => Math.max(1, q - 1)); // không cho xuống dưới 1
  const inc = () => setQuantity((q) => q + 1);

  const onQtyInput = (e) => {
    const v = e.target.value;
    if (v === "") { setQuantity(""); return; } // cho phép xoá tạm để gõ lại
    const n = Number(v);
    if (!isNaN(n)) setQuantity(n);
  };

  const handleSubmit = () => {
    const qty = Number(quantity) > 0 ? Number(quantity) : 1; // rỗng/0 -> 1
    onSubmit({ quantity: qty, note: note.trim() });
  };

  return (
    <div className="modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box edit-item-modal" role="dialog" aria-modal="true" aria-labelledby="edit-item-title">
        <div className="modal-title" id="edit-item-title">
          Sửa món · <span>{item.name}</span>
        </div>

        <div className="ei-field">
          <label className="ei-label">Số lượng</label>
          <div className="ei-qty">
            <button type="button" className="ei-qty-btn" onClick={dec} aria-label="Giảm">−</button>
            <input
              type="number"
              min="1"
              className="ei-qty-input"
              value={quantity}
              onChange={onQtyInput}
              onBlur={() => { if (!quantity || Number(quantity) < 1) setQuantity(1); }}
            />
            <button type="button" className="ei-qty-btn" onClick={inc} aria-label="Tăng">+</button>
          </div>
        </div>

        <div className="ei-field">
          <label className="ei-label" htmlFor="ei-note">Ghi chú</label>
          <textarea
            id="ei-note"
            className="ei-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: ít đá, nhiều đường..."
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <button className="btn btn-ghost" disabled={loading} onClick={onClose}>Huỷ</button>
        </div>
      </div>
    </div>
  );
}

export default EditItemModal;