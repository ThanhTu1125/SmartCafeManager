import { useEffect } from "react";
import "../styles/popup.css";

export default function Popup({ open, type = "info", title, message, onClose, confirmText = "Đóng" }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const iconMap = {
        success: "✓",
        error: "✕",
        info: "i",
        warning: "!",
    };

    return (
        <div className="popup-overlay show" onClick={onClose} role="presentation">
            <div
                className={`popup-box popup-${type}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="popup-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="popup-icon">{iconMap[type] || iconMap.info}</div>
                {title && <h3 id="popup-title" className="popup-title">{title}</h3>}
                {message && <p className="popup-message">{message}</p>}
                <button type="button" className="popup-btn" onClick={onClose}>
                    {confirmText}
                </button>
            </div>
        </div>
    );
}
