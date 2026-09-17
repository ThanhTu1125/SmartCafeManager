import { useEffect } from "react";
import { connectCafeSocket, disconnectCafeSocket } from "../services/socketService";
import { applyAccentColor, accentFromSocketPayload, THEME } from "../utils/statusColors";
import { notifyInfo, notifyWarn } from "../utils/toast";

/**
 * Bật socket realtime (public /ws-news): đổi màu accent + toast khi có sự kiện.
 * Không sửa các trang cũ — chỉ lắng nghe và phát CustomEvent.
 */
export default function SocketRealtimeBridge() {
  useEffect(() => {
    applyAccentColor(THEME.idle, { flashMs: 0 });

    connectCafeSocket({
      onNews: (body) => {
        applyAccentColor(accentFromSocketPayload(body));
        if (String(body).startsWith("NEW_NEWS")) {
          notifyInfo("Có tin tức mới trên NEOCAFÉ");
        } else if (String(body).startsWith("NEWS_UPDATED")) {
          notifyInfo("Một bài viết vừa được cập nhật");
        } else if (String(body).startsWith("NEWS_DELETED")) {
          notifyWarn("Một bài viết vừa bị xóa");
        }
        window.dispatchEvent(new CustomEvent("scm:news", { detail: body }));
      },
      onStaff: (body) => {
        applyAccentColor(accentFromSocketPayload(body || "staff"));
        notifyWarn("Có yêu cầu mới từ khách / bàn");
        window.dispatchEvent(new CustomEvent("scm:staff", { detail: body }));
      },
      onTableEvents: (body) => {
        applyAccentColor(accentFromSocketPayload(body || "table"));
        window.dispatchEvent(new CustomEvent("scm:table", { detail: body }));
      },
    });

    return () => disconnectCafeSocket();
  }, []);

  return null;
}
