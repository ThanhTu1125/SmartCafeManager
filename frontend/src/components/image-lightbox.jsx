import React, { useEffect } from "react";

/* Modal phóng to ảnh phản hồi.
   Props: src (url ảnh, null = ẩn), onClose() */
function ImageLightbox({ src, onClose }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div className="lightbox show" onClick={onClose}>
      <img src={src} alt="Ảnh phản hồi" onClick={(e) => e.stopPropagation()} />
      <button className="lightbox-close" onClick={onClose} aria-label="Đóng">✕</button>
    </div>
  );
}

export default ImageLightbox;