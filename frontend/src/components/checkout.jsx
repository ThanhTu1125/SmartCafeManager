import React, { useEffect } from "react";
import "../styles/checkout.css";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

function CheckoutModal({
    open,
    invoice,
    paymentMethod,
    onChangeMethod,
    onConfirm,
    onClose,
    loading,
    }) {
    // Đóng bằng phím Esc
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    /* Hỗ trợ cả DTO phẳng (theo tài liệu) lẫn entity lồng (thực tế backend hiện tại) */
    const details = invoice?.orderDetails ?? [];
    const rows = details.map((d) => ({
        id: d.orderDetailId,
        name: d.itemName ?? d.item?.itemName ?? "—",
        qty: d.quantity,
        price: d.unitPrice,
    }));
    const total = invoice?.totalAmount ?? rows.reduce((s, r) => s + r.price * r.qty, 0);

    return (
        <div
        className="modal-overlay checkout show"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        >
        <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
            <div className="modal-title" id="checkout-title">Thanh toán</div>

            {rows.length === 0 ? (
            <div className="checkout-empty">Chưa có món nào trong hóa đơn.</div>
            ) : (
            <div className="checkout-list">
                {rows.map((r) => (
                <div className="checkout-row" key={r.id}>
                    <span className="checkout-name">{r.name}</span>
                    <span className="checkout-qty">x{r.qty}</span>
                    <span className="checkout-price">{fmt(r.price * r.qty)}</span>
                </div>
                ))}
            </div>
            )}

            <div className="checkout-total">
            <span>Tổng hóa đơn</span>
            <span className="checkout-total-value">{fmt(total)}</span>
            </div>

            <div className="checkout-method">
            <label className="modal-label" htmlFor="checkout-method-select">
                Phương thức thanh toán
            </label>
            <select
                id="checkout-method-select"
                className="checkout-select"
                value={paymentMethod}
                onChange={(e) => onChangeMethod(e.target.value)}
            >
                <option value="CASH">Tiền mặt</option>
                <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
            </select>
            </div>

            <div className="modal-actions">
            <button
                className="btn-xacnhan"
                onClick={onConfirm}
                disabled={loading || rows.length === 0}
            >
                {loading ? "Đang gửi..." : "Xác nhận"}
            </button>
            <button className="btn-huy" onClick={onClose} disabled={loading}>
                Hủy
            </button>
            </div>
        </div>
        </div>
    );
}

export default CheckoutModal;