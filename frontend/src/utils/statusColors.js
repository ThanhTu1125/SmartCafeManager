import { colord } from "colord";

/** Màu trạng thái theo sự kiện realtime — đổi CSS variables trên :root */
const THEME = {
  idle: "#C89A63",
  news: "#5B8C5A",
  staff: "#D97706",
  table: "#2563EB",
  danger: "#DC2626",
};

export function applyAccentColor(hex, { flashMs = 2200 } = {}) {
  const root = document.documentElement;
  const base = THEME.idle;
  const next = colord(hex).isValid() ? colord(hex).toHex() : base;
  const soft = colord(next).lighten(0.28).toHex();

  root.style.setProperty("--scm-accent", next);
  root.style.setProperty("--scm-accent-soft", soft);
  root.style.transition = "background-color 0.45s ease";

  window.clearTimeout(applyAccentColor._timer);
  if (flashMs > 0) {
    applyAccentColor._timer = window.setTimeout(() => {
      root.style.setProperty("--scm-accent", THEME.idle);
      root.style.setProperty("--scm-accent-soft", colord(THEME.idle).lighten(0.28).toHex());
    }, flashMs);
  }
}

export function accentFromSocketPayload(payload) {
  const text = String(payload || "");
  if (text.startsWith("NEW_NEWS") || text.startsWith("NEWS_UPDATED")) return THEME.news;
  if (text.startsWith("NEWS_DELETED") || text.includes("REMOVED")) return THEME.danger;
  if (text.includes("staff") || text.includes("REQUEST") || text.includes("CALL")) return THEME.staff;
  if (text.includes("table") || text.includes("TABLE") || text.includes("ORDER")) return THEME.table;
  return THEME.idle;
}

export { THEME };
