import React, { useState } from "react";
import "../styles/ai-chat.css";
import AiChat from "./ai-chat";

/* Nút bong bóng nổi góc phải dưới + khung chat AI.
   Đây là component "bọc": đặt <AiBubble /> một lần ở layout/trang khách là xong.

   Props (đều tùy chọn):
   - onSendMessage(text, history) => Promise<string>
       Hàm bạn tự cài để gọi AI. Nhận câu người dùng + lịch sử, trả về câu trả lời.
       Chưa truyền thì khung vẫn chạy demo (echo) để xem giao diện.
   - title       : tiêu đề khung chat (mặc định "Trợ lý NEOCAFÉ")
   - greeting    : lời chào đầu tiên của AI
   - placeholder : chữ mờ trong ô nhập */
function AiBubble({ onSendMessage = () => {}, title = "AI chat", greeting = "Chào bạn", placeholder = "Lorent ipsum" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <AiChat
          title={title}
          greeting={greeting}
          placeholder={placeholder}
          onSendMessage={onSendMessage}
          onClose={() => setOpen(false)}
        />
      )}

      <button
        className={`ai-bubble ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng trợ lý" : "Mở trợ lý"}
        aria-expanded={open}
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
            <path
              d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-4 3.5V16H5.5A1.5 1.5 0 0 1 4 14.5v-9Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}

export default AiBubble;