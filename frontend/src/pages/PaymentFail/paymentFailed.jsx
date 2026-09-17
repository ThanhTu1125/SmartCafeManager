import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import "../../styles/payment-success.css";

/* PayPal / backend chuyển hướng về đây khi thanh toán thất bại hoặc bị huỷ:
   /payment-fail?tableId=1&paymentId=PAYID-...&reason=...
   Trang này báo cho khách biết giao dịch chưa hoàn tất và cho quay lại thực đơn. */
function PaymentFail() {
  const [params] = useSearchParams();
  const tableId = params.get("tableId");
  const paymentId = params.get("paymentId");
  const reason = params.get("reason");

  return (
    <div className="payment-success">
      <div className="ps-card">
        <div className="ps-icon fail">✕</div>

        <h1 className="ps-title">Thanh toán thất bại</h1>

        <p className="ps-desc">
          {reason
            ? reason
            : "Giao dịch chưa được hoàn tất hoặc đã bị huỷ. Bạn có thể quay lại thực đơn và thử thanh toán lại."}
        </p>

        {(tableId || paymentId) && (
          <div className="ps-detail">
            {tableId && (
              <div className="ps-row">
                <span>Bàn</span>
                <span>{tableId}</span>
              </div>
            )}
            {paymentId && (
              <div className="ps-row">
                <span>Mã giao dịch</span>
                <span className="ps-mono">{paymentId}</span>
              </div>
            )}
          </div>
        )}

        <Link className="ps-back" to={tableId ? `/menu/table/${tableId}` : "/"}>
          Quay lại thực đơn
        </Link>
      </div>
    </div>
  );
}

export default PaymentFail;