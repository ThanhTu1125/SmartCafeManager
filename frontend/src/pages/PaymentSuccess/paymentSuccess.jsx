import React, {useEffect} from "react";
import { useSearchParams, Link } from "react-router-dom";
import "../../styles/payment-success.css";
import { callService } from "../../services/apiService";

/* PayPal chuyển hướng về đây kèm query:
   /payment-success?tableId=1&paymentId=PAYID-...&token=EC-...&PayerID=...
   Trang này chỉ hiển thị xác nhận cho khách. Việc capture giao dịch
   (nếu cần) do backend xử lý qua paymentId/PayerID. */
function PaymentSuccess() {
  const [params] = useSearchParams();
  const tableId = params.get("tableId");
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");//sửa lại payer id sau
  
  // Có PayerID nghĩa là khách đã duyệt thanh toán trên PayPal
  const approved = Boolean(tableId);
  
  useEffect(() => {
    callService(tableId, "NORMAL"); 
    return;
  }, []);

  return (
    <div className="payment-success">
      <div className="ps-card">
        <div className={`ps-icon ${approved ? "ok" : "warn"}`}>
          {approved ? "✓" : "!"}
        </div>

        <h1 className="ps-title">
          {approved ? "Thanh toán thành công" : "Chưa hoàn tất thanh toán"}
        </h1>

        <p className="ps-desc">
          {approved
            ? "Cảm ơn bạn! Giao dịch PayPal đã được ghi nhận. Nhân viên sẽ đến xác nhận và hoàn tất hóa đơn."
            : "Có vẻ giao dịch chưa được duyệt. Bạn có thể quay lại và thử thanh toán lại."}
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

        <Link className="ps-back" to={tableId ? `/menu` : "/"}>
          Quay lại thực đơn
        </Link>
      </div>
    </div>
  );
}

export default PaymentSuccess;