import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import "../styles/feedback.css";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import StarIcon from "@mui/icons-material/Star";

const EMPTY = { hoten: "", email: "", orderDetailId: "", rating: "", noidung: "", image: null };

/* Schema kiểm tra dữ liệu bằng Yup */
const feedbackSchema = Yup.object({
  hoten: Yup.string().trim().required("Vui lòng nhập họ và tên"),
  email: Yup.string().trim().required("Vui lòng nhập email").email("Email không hợp lệ"),
  orderDetailId: Yup.string().required("Vui lòng chọn món muốn đánh giá"),
  rating: Yup.number()
    .transform((val, orig) => (orig === "" ? undefined : val))
    .required("Vui lòng chọn số sao đánh giá")
    .min(1, "Rating tối thiểu là 1")
    .max(5, "Rating tối đa là 5"),
  noidung: Yup.string().trim().required("Vui lòng nhập nội dung phản hồi")
    .min(5, "Nội dung quá ngắn (tối thiểu 5 ký tự)"),
  image: Yup.mixed().nullable(),
});

/* Props:
   - open, onSubmit, onClose
   - orderedItems: danh sách MÓN ĐÃ GỌI (chỉ những món này mới được chọn để review)
     mỗi phần tử kỳ vọng có { orderDetailId, itemId } */
function FeedbackModal({ open, onSubmit, onClose, orderedItems = [] }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [hover, setHover] = useState(-1); // mức sao đang rê chuột (-1 = không rê)

  // Reset form + lỗi mỗi lần mở lại
  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
      setHover(-1);
    }
  }, [open]);

  // Đóng bằng phím Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    // Xoá lỗi của field khi người dùng bắt đầu sửa
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const setImage = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({ ...f, image: file }));
  };

  const handleSubmit = async () => {
    try {
      const valid = await feedbackSchema.validate(form, { abortEarly: false });
      setErrors({});
      // Đính kèm id món đã chọn để tiện cho phía cha
      const picked = orderedItems.find(
        (it) => String(it.orderDetailId) === String(form.orderDetailId)
      );
      onSubmit({ ...valid, image: form.image, itemId: picked?.itemId });
    } catch (err) {
      // Gom lỗi Yup về dạng { field: message }
      const map = {};
      if (err.inner) err.inner.forEach((e) => { if (!map[e.path]) map[e.path] = e.message; });
      setErrors(map);
    }
  };

  const hasOrdered = orderedItems.length > 0;

  return (
    <div
      className="modal-overlay feedback show"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
        <div className="modal-title" id="feedback-title">Phản Hồi</div>

        <div className="modal-field">
          <label className="modal-label" htmlFor="feedback-hoten">Họ và tên</label>
          <input
            type="text"
            id="feedback-hoten"
            className={`modal-input ${errors.hoten ? "input-error" : ""}`}
            value={form.hoten}
            autoFocus
            onChange={set("hoten")}
          />
          {errors.hoten && <span className="field-error">{errors.hoten}</span>}
        </div>

        <div className="modal-field">
          <label className="modal-label" htmlFor="feedback-email">Email</label>
          <input
            type="email"
            id="feedback-email"
            className={`modal-input ${errors.email ? "input-error" : ""}`}
            value={form.email}
            onChange={set("email")}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        {/* Chọn món muốn đánh giá — CHỈ từ các món đã gọi */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="feedback-mon">Món muốn đánh giá</label>
          <select
            id="feedback-mon"
            className={`modal-input ${errors.orderDetailId ? "input-error" : ""}`}
            value={form.orderDetailId}
            onChange={set("orderDetailId")}
            disabled={!hasOrdered}
          >
            <option value="">
              {hasOrdered ? "-- Chọn món --" : "Chưa có món nào được gọi"}
            </option>
            {orderedItems
              .filter(
                (it, index, self) =>
                  index === self.findIndex((item) => item.itemId === it.itemId)
              )
              .map((it) => (
                <option key={it.orderDetailId} value={it.orderDetailId}>
                  {it.itemName}
                </option>
              ))
            }
          </select>
          {errors.orderDetailId && <span className="field-error">{errors.orderDetailId}</span>}
          {!hasOrdered && (
            <span className="upload-hint">Bạn cần gọi món trước khi đánh giá.</span>
          )}
        </div>

        <div className="modal-field">
          <label className="modal-label" htmlFor="feedback-rating">Rating</label>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Rating
              name="feedback-rating"
              value={Number(form.rating) || 0}
              precision={1}
              onChange={(event, newValue) => {
                setForm((f) => ({ ...f, rating: newValue ?? "" }));
                setErrors((prev) => (prev.rating ? { ...prev, rating: undefined } : prev));
              }}
              onChangeActive={(event, newHover) => setHover(newHover)}
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
          </Box>
          {errors.rating && <span className="field-error">{errors.rating}</span>}
        </div>

        <div className="modal-field">
          <label className="modal-label" htmlFor="feedback-noidung">Phản hồi</label>
          <textarea
            id="feedback-noidung"
            className={`modal-textarea ${errors.noidung ? "input-error" : ""}`}
            value={form.noidung}
            onChange={set("noidung")}
          />
          {errors.noidung && <span className="field-error">{errors.noidung}</span>}
        </div>

        {/* Thêm ảnh (.jpg, .png) theo mockup */}
        <div className="modal-field upload-field">
          <span className="modal-label">Thêm ảnh</span>
          <label className="upload-btn" htmlFor="feedback-anh" title="Tải ảnh lên">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 16V5m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </label>
          <input
            type="file"
            id="feedback-anh"
            className="upload-input"
            accept=".jpg,.jpeg,.png"
            onChange={setImage}
          />
          <span className="upload-hint">
            {form.image ? form.image.name : ".jpg, .png"}
          </span>
        </div>

        <div className="modal-actions">
          <button className="btn-gui" onClick={handleSubmit}>Gửi</button>
          <button className="btn-dong" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;