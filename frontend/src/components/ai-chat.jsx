import React, { useEffect, useRef, useState } from "react";

/* Khung chat AI. Thường được mở bởi <AiBubble />, nhưng dùng độc lập cũng được.
   Props:
   - onSendMessage(text, history) => Promise<string>  (tùy chọn; chưa có thì chạy demo echo)
   - title, greeting, placeholder
   - onClose() */
function AiChat({
  onSendMessage,
  title = "Trợ lý NEOCAFÉ",
  greeting = "Xin chào! Mình có thể giúp gì cho bạn hôm nay?",
  placeholder = "Nhập tin nhắn...",
  onClose,
}) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: greeting },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Luôn cuộn xuống tin mới nhất
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const history = messages;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      let reply;
      if (onSendMessage) {
        reply = await onSendMessage(text, history); // bạn tự nối AI ở đây
      } else {
        // Demo khi chưa nối backend: giả lập trả lời
        await new Promise((r) => setTimeout(r, 700));
        reply = `Bạn vừa nói: "${text}". (Đây là phản hồi demo — hãy nối onSendMessage để dùng AI thật.)`;
      }
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Xin lỗi, có lỗi xảy ra. Bạn thử lại giúp mình nhé.", error: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="ai-chat" role="dialog" aria-label={title}>
      <div className="ai-chat-head">
        <div className="ai-chat-head-info">
          <div className="ai-avatar">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-4 3.5V16H5.5A1.5 1.5 0 0 1 4 14.5v-9Z"
                stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="ai-chat-title">{title}</div>
            <div className="ai-chat-status"><span className="dot" />Đang hoạt động</div>
          </div>
        </div>
        <button className="ai-chat-close" onClick={onClose} aria-label="Đóng">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="ai-chat-body" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role} ${m.error ? "error" : ""}`}>
            <div className="ai-msg-bubble">{m.text}</div>
          </div>
        ))}

        {sending && (
          <div className="ai-msg assistant">
            <div className="ai-msg-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      <div className="ai-chat-input">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          className="ai-send-btn"
          onClick={send}
          disabled={!input.trim() || sending}
          aria-label="Gửi"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <path d="M4 12l16-8-6 16-3-6-7-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default AiChat;