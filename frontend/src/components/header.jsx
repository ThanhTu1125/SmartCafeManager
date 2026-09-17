import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import MenuButton from "./menu-button";
import { getHomePath } from "../utils/authRedirect";

function Header({ title }) {
  const [userName, setUserName] = useState(
    () => localStorage.getItem("userName") || "",
  );
  const [roleName, setRoleName] = useState(() =>
    (localStorage.getItem("roleName") || "").toUpperCase(),
  );

  useEffect(() => {
    const syncAuth = () => {
      setUserName(localStorage.getItem("userName") || "");
      setRoleName((localStorage.getItem("roleName") || "").toUpperCase());
    };
    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const isAdmin = roleName === "ADMIN";
  const isStaff = roleName === "STAFF";

  return (
    <nav className="relative w-full bg-[#D2A97B] px-4 py-3 flex items-center justify-between shadow-md z-50">
      {/* Khối bên trái: Nút 3 gạch (☰) + Logo chuẩn */}
      <div className="flex items-center gap-3">
        <MenuButton />
        <Link
          to={getHomePath()}
          className="flex items-center gap-2 cursor-pointer no-underline text-inherit"
          title="Trang chủ quản trị"
        >
          <Logo className="h-9 w-9" />
          <div className="text-[20px] font-['Fraunces',serif] tracking-wide">
            <span className="font-bold text-[#2A1E14]">NEO</span>
            <span className="font-normal text-[#2A1E14]">CAFÉ</span>
          </div>
        </Link>
      </div>

      {/* Khối ở giữa: Tiêu đề trang (nếu có) hoặc Bàn (chỉ dành cho khách hàng) */}
      {title ? (
        <div className="header-title font-semibold text-sm md:text-base text-[#2A1E14]">
          {title}
        </div>
      ) : !isAdmin && !isStaff ? (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/30 backdrop-blur-sm text-[#2A1E14] font-semibold text-xs md:text-sm rounded-full border border-white/40 shadow-xs">
          <span>📍</span>
          <span>Bàn {localStorage.getItem("tableId") || "1"}</span>
        </div>
      ) : (
        <div />
      )}

      {/* Khối bên phải: Badge quyền ADMIN / STAFF gọn gàng */}
      <div className="flex items-center gap-2">
        {isAdmin ? (
          <div className="px-3 py-1 bg-[#2A1E14] text-[#E7C9A1] font-bold text-xs rounded-full shadow-xs">
            ADMIN
          </div>
        ) : isStaff ? (
          <div className="px-3 py-1 bg-[#2A1E14] text-[#E7C9A1] font-bold text-xs rounded-full shadow-xs">
            STAFF
          </div>
        ) : userName ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#2A1E14] text-[#E7C9A1] font-bold text-xs rounded-full">
            <span>●</span>
            <span>{userName}</span>
          </div>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </nav>
  );
}

export default Header;
