import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import RichTextEditor from "./RichTextEditor";

const EMPTY = {
  title: "",
  summary: "",
  content: "",
  imageUrl: "",    // URL ảnh hiện có (khi sửa, từ API field imageUrl)
  imageFile: null, // file ảnh mới upload (gửi multipart)
};

/* Coi nội dung Quill là rỗng nếu chỉ có thẻ trống */
const isEmptyHtml = (html) =>
  !html || html === "<p><br></p>" || html === "<br>" || html.replace(/<[^>]*>/g, "").trim() === "";

/* Schema Yup — validate cả tiêu đề, tóm tắt, nội dung VÀ ảnh.
   Ảnh hợp lệ khi: đang sửa mà đã có imageUrl sẵn, HOẶC vừa chọn file ảnh mới
   (đúng định dạng, dưới 5MB). */
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_MB = 5;

const newsSchema = Yup.object({
  title: Yup.string().trim()
    .required("Vui lòng nhập tiêu đề")
    .max(255, "Tiêu đề tối đa 255 ký tự"),
  summary: Yup.string().max(10000, "Tóm tắt quá dài"),
  content: Yup.string()
    .test("not-empty", "Vui lòng nhập nội dung", (val) => !isEmptyHtml(val))
    .max(1000000, "Nội dung quá dài"),
  imageUrl: Yup.string(),
  imageFile: Yup.mixed()
    .nullable()
    .notRequired()
    .test("file-type", "Ảnh phải là JPG, PNG, WEBP hoặc GIF", (file) => {
      if (!file) return true; // không chọn file mới -> bỏ qua (dùng ảnh cũ imageUrl)
      return IMAGE_TYPES.includes(file.type);
    })
    .test("file-size", `Ảnh không được vượt quá ${MAX_IMAGE_MB}MB`, (file) => {
      if (!file) return true;
      return file.size <= MAX_IMAGE_MB * 1024 * 1024;
    }),
});

/* Modal thêm / sửa tin tức.
   Field khớp API: title, summary, content, imageUrl, image(file).
   Props: open, initial (null = thêm), onSave, onDelete, onClose */
function NewsEditorModal({ open, initial, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  // Đổ dữ liệu vào form mỗi khi mở modal / đổi bài đang sửa.
  // Chỉ lấy đúng các field cần, tránh kéo theo field lạ từ API.
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title ?? "",
        summary: initial.summary ?? "",
        content: initial.content ?? "",
        imageUrl: initial.imageUrl ?? "",
        imageFile: null,
      });
      console.log('Form: ',form);
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isEditing = Boolean(initial?.newsId);
  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const onImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("imageFile", file);
    set("imageUrl", URL.createObjectURL(file)); // xem trước
    setErrors((prev) => ({ ...prev, imageFile: undefined }));
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, imageUrl: "", imageFile: null }));
  };

  const validate = async () => {
    try {
      await newsSchema.validate(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const map = {};
      if (err.inner) err.inner.forEach((e) => { if (!map[e.path]) map[e.path] = e.message; });
      setErrors(map);
      return false;
    }
  };

  const handleSave = async () => {
    if (!(await validate())) return;
    onSave({ ...form, newsId: initial?.newsId });
  };

  return (
    <div className="news-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="news-modal" role="dialog" aria-modal="true" aria-labelledby="news-modal-title">
        <div className="news-modal-head">
          <span id="news-modal-title">{isEditing ? "Sửa tin tức" : "Thêm tin tức"}</span>
          <button className="news-x" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        <div className="news-modal-body">
          {/* Ảnh thumbnail */}
          <div className="news-field">
            <span className="news-label">Ảnh thumbnail <span className="req">*</span></span>
            <div className="thumb-upload">
              {form.imageUrl ? (
                <div className="thumb-preview">
                  <img src={form.imageUrl} alt="thumbnail" />
                  <button className="thumb-remove" onClick={removeImage} aria-label="Xoá ảnh">✕</button>
                </div>
              ) : (
                <label className={`thumb-drop ${errors.imageFile ? "err" : ""}`}>
                  <span>＋ Tải ảnh lên</span>
                  <input type="file" accept="image/*" hidden onChange={onImageFile} />
                </label>
              )}
            </div>
            {errors.imageFile && <span className="news-err">{errors.imageFile}</span>}
          </div>

          {/* Tiêu đề */}
          <div className="news-field">
            <label className="news-label" htmlFor="news-title">Tiêu đề <span className="req">*</span></label>
            <input
              id="news-title"
              className={`news-input ${errors.title ? "err" : ""}`}
              maxLength={255}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
            {errors.title && <span className="news-err">{errors.title}</span>}
          </div>

          {/* Tóm tắt */}
          <div className="news-field">
            <label className="news-label" htmlFor="news-summary">Tóm tắt</label>
            <textarea
              id="news-summary"
              className={`news-input ${errors.summary ? "err" : ""}`}
              rows={2}
              maxLength={10000}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="Mô tả ngắn hiển thị ở danh sách tin..."
            />
            {errors.summary && <span className="news-err">{errors.summary}</span>}
          </div>

          {/* Nội dung rich text — key ép Quill nạp lại value khi đổi bài đang sửa */}
          <div className="news-field">
            <label className="news-label">Nội dung <span className="req">*</span></label>
            <RichTextEditor
              key={open ? (initial?.newsId ?? "new") : "closed"}
              value={form.content}
              onChange={(html) => set("content", html)}
            />
            {errors.content && <span className="news-err">{errors.content}</span>}
          </div>
        </div>

        <div className="news-modal-foot">
          {isEditing ? (
            <button className="news-btn danger" onClick={() => onDelete(initial.newsId)}>Xoá</button>
          ) : <span />}
          <div className="foot-right">
            <button className="news-btn ghost" onClick={onClose}>Bỏ qua</button>
            <button className="news-btn primary" onClick={handleSave}>Lưu</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsEditorModal;