import React, { useEffect } from "react";
import "../styles/paypal-qr.css";

/* Modal hiển thị QR thanh toán PayPal.
   Props:
   - open        : boolean
   - data        : { qrCodeUrl, approvalUrl } | null — từ API /payment/paypal
   - loading     : boolean — đang tạo phiên thanh toán
   - onClose     : () => void
*/
function PaypalQrModal({ open, data, loading, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const qrCodeUrl = data?.qrCodeUrl;
  const approvalUrl = data?.approvalUrl;

  return (
    <div
      className="modal-overlay paypal-qr show"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="paypal-qr-title">
        <div className="modal-title" id="paypal-qr-title">Thanh toán qua PayPal</div>

        {loading ? (
          <div className="pq-loading">Đang tạo mã QR thanh toán...</div>
        ) : qrCodeUrl || approvalUrl ? (
          <>
            {qrCodeUrl && (
              <>
                <p className="pq-hint">Quét mã QR bằng ứng dụng PayPal để thanh toán</p>
                <div className="pq-qr">
                  <img src={qrCodeUrl} alt="Mã QR thanh toán PayPal" />
                </div>
              </>
            )}

            {approvalUrl && (
              <a
                className="pq-approve"
                href={approvalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Đi đến trang thanh toán
              </a>
            )}
          </>
        ) : (
          <div className="pq-error">
            Không tạo được mã QR. Vui lòng thử lại hoặc chọn phương thức khác.
          </div>
        )}

        <button className="pq-close" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}

export default PaypalQrModal;