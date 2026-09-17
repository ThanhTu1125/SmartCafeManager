import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import "../styles/menu-button.css";

/* Danh sách mục điều hướng + điều kiện hiển thị theo quyền */
const MENU_ITEMS = [
  { name: "Thực đơn", path: "/menu", hideForStaffAndAdmin: true },
  { name: "Tin tức", path: "/news", hideForStaffAndAdmin: true },
  {
    name: "Bảng điều khiển",
    path: "/admin/revenue",
    requireAuth: true,
    requireAdmin: true,
  },
  {
    name: "Quản lý bàn",
    path: "/sale-manager",
    requireAuth: true,
    requireStaffOrAdmin: true,
  },
  {
    name: "Quản lý hóa đơn",
    path: "/admin/invoices",
    requireAuth: true,
    requireStaffOrAdmin: true,
  },
  {
    name: "Quản lý món",
    path: "/admin/items",
    requireAuth: true,
    requireAdmin: true,
  },
  {
    name: "Quản lý nhân viên",
    path: "/admin/employees",
    requireAuth: true,
    requireAdmin: true,
  },
  {
    name: "Quản lý khách hàng",
    path: "/admin/customers",
    requireAuth: true,
    requireAdmin: true,
  },
  {
    name: "Quản lý tin tức",
    path: "/admin/news",
    requireAuth: true,
    requireAdmin: true,
  },
  {
    name: "Tin tức nhân viên",
    path: "/staff-news",
    requireAuth: true,
    requireStaff: true,
  },
  {
    name: "Quản lý phản hồi",
    path: "/feedback-manager",
    requireAuth: true,
    requireStaffOrAdmin: true,
  },
  { name: "Hồ sơ cá nhân", path: "/profile", requireAuth: true },
];

/* Nút menu điều hướng (☰) + Drawer trượt từ bên trái.
   Dùng chung cho toàn bộ các trang (Admin, Staff, Customer).
   Tự đọc trạng thái đăng nhập / quyền từ localStorage và tự lo đăng xuất. */
function MenuButton({ className = "", onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );
  const [roleName, setRoleName] = useState(() =>
    (localStorage.getItem("roleName") || "").toUpperCase(),
  );
  const location = useLocation();
  const navigate = useNavigate();

  // Đồng bộ trạng thái đăng nhập khi localStorage đổi
  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("token")));
      setRoleName((localStorage.getItem("roleName") || "").toUpperCase());
    };
    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // Nhấn phím Esc thì đóng Drawer
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const isAdmin = roleName === "ADMIN";
  const isStaff = roleName === "STAFF";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roleName");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setRoleName("");
    setIsOpen(false);
    navigate("/");
  };

  const visibleItems = MENU_ITEMS.filter((item) => {
    if (item.hideForStaffAndAdmin && (isStaff || isAdmin)) return false;
    if (item.requireAuth && !isLoggedIn) return false;
    if (item.requireStaffOrAdmin && !isAdmin && !isStaff) return false;
    if (item.requireAdmin && !isAdmin) return false;
    if (item.requireStaff && !isStaff) return false;
    return true;
  });

  const handlePick = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`menu-button-toggle ${className}`}
        aria-label="Mở menu điều hướng"
        aria-expanded={isOpen}
      >
        <Menu size={26} />
      </button>

      {isOpen && (
        <div className="menu-drawer-backdrop" onClick={() => setIsOpen(false)}>
          <aside
            className="menu-drawer-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header của Drawer */}
            <div className="menu-drawer-head">
              <div className="menu-drawer-brand">
                <Logo className="h-8 w-8" />
                <div className="menu-drawer-brand-text">
                  <span className="menu-drawer-brand-name">NEOCAFÉ</span>
                  <span className="menu-drawer-brand-badge">
                    {isAdmin ? "ADMIN" : isStaff ? "STAFF" : "MENU"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="menu-drawer-close"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Danh sách liên kết điều hướng */}
            <nav className="menu-drawer-nav">
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`menu-drawer-link ${isActive ? "active" : ""}`}
                    onClick={handlePick}
                  >
                    <span>{item.name}</span>
                    {isActive && <span className="active-dot">›</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Chân Drawer: Nút đăng xuất */}
            {isLoggedIn && (
              <div className="menu-drawer-foot">
                <button
                  type="button"
                  className="menu-drawer-logout-btn"
                  onClick={handleLogout}
                >
                  Đăng xuất tài khoản
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

export default MenuButton;
