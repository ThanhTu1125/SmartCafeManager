# 📘 SmartCafeManager - Payment & Invoice Integration Guide

## 🛠️ Changelog

### 1. Spring Security Configuration

- Mở quyền truy cập công khai cho toàn bộ API khách hàng:

  ```
  /api/v1/customer/**
  ```

  - Khách hàng có thể:
    - Xem thực đơn.
    - Gọi món.
    - Xem hóa đơn.
    - Thanh toán.
  - Không yêu cầu đăng nhập hoặc JWT Token.

- Các API dành cho Nhân viên và Quản trị:

  ```
  /api/v1/staff/**
  /api/v1/admin/**
  ```

  - Bắt buộc xác thực bằng JWT Token (`Bearer Token`).

---

### 2. Fix Hibernate / JPA Enum Query

#### Lỗi

Hibernate không thể biên dịch JPQL do không nhận diện được Enum:

```
InterpretationException:
No enum constant ...
```

#### Nguyên nhân

Sử dụng `@Query` với giá trị Enum được hard-code.

#### Khắc phục

Chuyển sang Derived Query Method:

```java
findByTableTableIdAndStatus(tableId, StatusTableOrder.OPEN)
```

Giúp Repository tự động sinh câu truy vấn chính xác và tránh lỗi Enum.

---

### 3. Bổ sung API cho Staff

Hoàn thiện các API phục vụ quy trình vận hành.

#### Phục vụ

- Xem món theo bàn

```
GET /table/{tableId}/order-details
```

- Xác nhận đơn

```
POST /confirm-order
```

- Đánh dấu món đã phục vụ

```
POST /serve-item
```

- Hủy món

```
POST /cancel-item
```

---

#### Quản lý Order

- Cập nhật món
- Xóa món khỏi đơn

---

#### Thu ngân

Xác nhận thanh toán tiền mặt

```
POST /approve-cash-payment
```

Sau khi xác nhận:

- Chốt hóa đơn.
- Giải phóng bàn.
- Gửi WebSocket thông báo realtime.

---

### 4. Sửa Logic tính Tổng tiền Hóa đơn

#### Lỗi

API:

```
GET /api/v1/customer/invoice-summary/{tableId}
```

trả về:

```json
{
  "totalAmount": 0
}
```

mặc dù bàn đã có món.

#### Nguyên nhân

Hệ thống chỉ tính những món đã xác nhận và bỏ qua các món ở trạng thái `PENDING`.

#### Khắc phục

Backend tính động lại toàn bộ tổng tiền.

Các trạng thái được tính:

- ✅ PENDING
- ✅ ORDERED
- ✅ CONFIRMED
- ✅ SERVED

Không tính:

- ❌ CANCELLED

Nhờ đó:

- `invoice-summary`
- `invoice`
- PayPal
- Các cổng thanh toán khác

đều luôn nhận được số tiền chính xác.

---

# 📜 Payment & Invoice API Integration

## 1. Tổng quan

Frontend **không cần tự tính tổng tiền**.

Backend luôn trả về:

```json
{
    "totalAmount": 180000
}
```

đúng với giá trị thực tế.

Điều này giúp tránh lỗi:

```
Amount cannot be zero
```

khi tích hợp PayPal hoặc các cổng thanh toán khác.

---

## 2. Trạng thái Order Detail

| Status | Ý nghĩa | Tính vào tổng tiền |
|---------|----------|--------------------|
| PENDING | Món trong giỏ tạm | ✅ Có |
| ORDERED | Đã gửi xuống bếp | ✅ Có |
| CONFIRMED | Bếp xác nhận | ✅ Có |
| SERVED | Đã phục vụ | ✅ Có |
| CANCELLED | Đã hủy | ❌ Không |

### Khuyến nghị cho Frontend

Nếu:

```text
status == CANCELLED
```

nên:

- Gạch ngang tên món.
- Làm mờ giá.
- Hiển thị lý do hủy (`note`) nếu có.

---

# 3. API Integration

## 3.1 Xem tóm tắt hóa đơn

### Endpoint

```
GET /api/v1/customer/invoice-summary/{tableId}
```

### Authentication

Không yêu cầu JWT.

### Response

```json
{
  "tableOrderId": 7,
  "tableName": "Ban01",
  "totalAmount": 180000,
  "orderStatus": "OPEN",
  "serviceStatus": "NORMAL",
  "openAt": "2026-07-26T05:50:32.889331",
  "orderDetails": [
    {
      "orderDetailId": 15,
      "itemId": 3,
      "itemName": "Trà Đào Cam Sả",
      "quantity": 4,
      "unitPrice": 45000,
      "note": "Ít ngọt",
      "status": "PENDING",
      "imageUrl": "http://domain.com/images/tra-dao.jpg"
    }
  ]
}
```

---

## 3.2 Yêu cầu thanh toán

Khách hàng bấm:

- Thanh toán tiền mặt
- Thanh toán PayPal

### Endpoint

```
POST /api/v1/customer/request-checkout
```

### Parameters

| Parameter | Kiểu |
|-----------|------|
| tableId | Long |
| paymentMethod | CASH hoặc PAYPAL |

### Frontend xử lý

Sau khi gọi thành công:

- Hiển thị màn hình:

```
Đang chờ nhân viên xác nhận thanh toán...
```

hoặc

- Mở PayPal.

Khi đó:

```
serviceStatus = REQUESTING_BILL
```

---

## 3.3 Thanh toán PayPal

### Tạo giao dịch

```
POST /api/v1/customer/payment/paypal
```

### Parameter

| Parameter | Kiểu |
|-----------|------|
| tableId | Long |

### Response

```json
{
    "approvalUrl": "...",
    "qrCodeUrl": "..."
}
```

Frontend:

- Redirect đến `approvalUrl`

hoặc

- Hiển thị QR Code để khách quét.

---

## 3.4 Thanh toán PayPal thành công

```
GET /api/v1/customer/payment/paypal/success
```

### Parameters

| Parameter | Required |
|-----------|----------|
| paymentId | No |
| token | No |
| PayerID | Yes |
| tableId | Yes |

Backend sẽ:

- Execute PayPal Payment.
- Chốt hóa đơn.
- Giải phóng bàn.
- Redirect:

```
http://localhost:3000/payment-success
```

---

## 3.5 Hủy thanh toán PayPal

```
GET /api/v1/customer/payment/paypal/cancel
```

### Parameter

| Parameter |
|-----------|
| tableId |

Backend sẽ redirect về:

```
http://localhost:3000/payment-cancel
```

để Frontend hiển thị màn hình:

> Thanh toán đã bị hủy.

---

## 3.6 Thu ngân xác nhận thanh toán tiền mặt

```
POST /api/v1/staff/approve-cash-payment
```

### Authentication

JWT Token.

### Parameter

| Parameter |
|-----------|
| tableId |

Backend sẽ:

1. Chuyển các món `PENDING` → `ORDERED`.
2. Đóng hóa đơn.
3. Cập nhật trạng thái bàn:

```
isOccupied = false
serviceStatus = NORMAL
```

4. Gửi WebSocket thông báo giải phóng bàn.

---

# 4. WebSocket Integration

Backend sử dụng WebSocket để cập nhật realtime.

## Topic

```
/topic/staff-requests
```

## Sự kiện

Sau khi thanh toán hoàn tất:

```json
{
  "tableId": 1,
  "type": "CHECKOUT_COMPLETED",
  "message": "Bàn 1 đã hoàn tất thanh toán & sẵn sàng đón khách mới."
}
```

Frontend nên subscribe Topic trên để:

- Cập nhật trạng thái bàn.
- Tự động reload danh sách bàn.
- Đồng bộ giao diện Thu ngân và Nhân viên theo thời gian thực.

---

# 📌 Ghi chú

- Toàn bộ API khách hàng (`/api/v1/customer/**`) không yêu cầu JWT.
- Toàn bộ API Staff/Admin yêu cầu JWT hợp lệ.
- `totalAmount` luôn được Backend tính toán và trả về chính xác.
- Frontend không cần tự cộng tổng tiền trước khi hiển thị hoặc gửi sang cổng thanh toán.