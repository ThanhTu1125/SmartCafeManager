import React, { useEffect, useState } from "react";
import "../styles/add-drink.css";

function AddDrinkModal({ item, onConfirm, onClose }) {
    const [qty, setQty] = useState(1);
    const [orderNote, setOrderNote] = useState("");
    
    // Reset số lượng mỗi khi mở modal với món khác
    useEffect(() => {
        setQty(1);
    }, [item]);

    // Đóng bằng phím Esc
    useEffect(() => {
        if (!item) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [item, onClose]);

    if (!item) return null;

    const handleConfirm = () => {
        const n = Math.max(1, Number(qty) || 1);
        onConfirm(item, n, orderNote);
        setOrderNote(""); // Reset ghi chú sau khi thêm món
    };

    return (
        <div
        className="modal-overlay add-drink show"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        >
        <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="add-drink-title">
            <div className="modal-title" id="add-drink-title">Thêm món</div>

            <div className="modal-field-row">
                <span className="modal-label">Tên món:</span>
                <span className="modal-value">{item.name}</span>
            </div>

            <div className="modal-field">
                <label className="modal-label" htmlFor="add-drink-soluong">Số lượng:</label>
                <input
                    type="number"
                    id="add-drink-soluong"
                    className="modal-input"
                    min="1"
                    value={qty}
                    autoFocus
                    onChange={(e) => setQty(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                />
            </div>

            <div className="order-note">
              <label htmlFor="order-note-input" className="order-note-label">
                Ghi chú:
              </label>
              <textarea
                id="order-note-input"
                className="order-note-input"
                placeholder="Ví dụ: ít đá, không đường..."
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
            </div>

            <div className="modal-actions">
            <button className="btn-them" onClick={handleConfirm}>Thêm</button>
            <button className="btn-dong" onClick={onClose}>Đóng</button>
            </div>
        </div>
        </div>
    );
}

export default AddDrinkModal;