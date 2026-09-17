import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  getCurrentUserProfile,
  getApiErrorMessage,
} from "../../services/apiService";
import Logo from "../../components/Logo";
import AvatarImage from "../../components/AvatarImage";
import Popup from "../../components/Popup";
import MenuButton from "../../components/menu-button";
import { getHomePath } from "../../utils/authRedirect";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.successMsg) {
      setPopup({
        open: true,
        type: "success",
        title: "Thành công",
        message: location.state.successMsg,
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getCurrentUserProfile();
        setProfile(res.data);
      } catch (err) {
        setPopup({
          open: true,
          type: "error",
          title: "Lỗi",
          message: getApiErrorMessage(
            err,
            "Không tải được thông tin tài khoản.",
          ),
        });
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.clear();
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Chưa cập nhật";
    const p = (n) => String(n).padStart(2, "0");
    return `${p(date.getDate())}/${p(date.getMonth() + 1)}/${date.getFullYear()}`;
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Quản trị viên (Admin)",
          badgeBg: "#2A1E14",
          badgeColor: "#E7C9A1",
        };
      case "STAFF":
        return {
          label: "Nhân viên quán (Staff)",
          badgeBg: "#9C6B3A",
          badgeColor: "#FFFDF9",
        };
      default:
        return {
          label: "Khách hàng thân thiết",
          badgeBg: "#059669",
          badgeColor: "#FFFFFF",
        };
    }
  };

  const roleInfo = getRoleInfo(profile?.roleName);
  const isAdmin = profile?.roleName === "ADMIN";
  const isStaff = profile?.roleName === "STAFF";

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F6EEE1",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          color: "#2A1E14",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>☕</div>
          <div style={{ fontWeight: 700, fontSize: "15px" }}>
            Đang tải thông tin hồ sơ...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        maxHeight: "100vh",
        background: "#F6EEE1",
        color: "#2A1E14",
        fontFamily: "'Be Vietnam Pro', sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ------------------------ TOPBAR ------------------------ */}
      <header className="topbar" style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <MenuButton />
          <Link
            to={getHomePath()}
            className="brand"
            title="Trang chủ"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Logo className="h-8 w-8" />
            <div
              className="brand-name"
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "19px",
                lineHeight: 1,
              }}
            >
              <span style={{ fontWeight: 700, color: "#2A1E14" }}>NEO</span>
              <span style={{ fontWeight: 400, color: "#2A1E14" }}>CAFÉ</span>
            </div>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              padding: "4px 12px",
              background: "#2A1E14",
              color: "#E7C9A1",
              fontWeight: 700,
              fontSize: "12px",
              borderRadius: "9999px",
            }}
          >
            {isAdmin ? "ADMIN" : isStaff ? "STAFF" : "MEMBER"}
          </div>
        </div>
      </header>

      {/* -------------------- THÂN TRANG HỒ SƠ -------------------- */}
      <main
        style={{
          maxWidth: "1120px",
          width: "100%",
          margin: "0 auto",
          padding: "16px 20px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "14px",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        {/* KHỐI 1: HERO BANNER PROFILE */}
        <div
          style={{
            background: "#FFFDF9",
            border: "1px solid #E4D2B8",
            borderRadius: "16px",
            padding: "18px 24px",
            boxShadow: "0 4px 16px rgba(42, 30, 20, 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Cụm Avatar + Tên + Quyền */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <AvatarImage
              src={profile?.imageUrl}
              alt="Avatar"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-3 border-[#E4D2B8] shadow-xs object-cover bg-white"
              size="lg"
            />

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontFamily: "'Fraunces', serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#2A1E14",
                  }}
                >
                  {profile?.fullName || profile?.username}
                </h1>

                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    background: roleInfo.badgeBg,
                    color: roleInfo.badgeColor,
                    fontWeight: 700,
                    fontSize: "11px",
                    borderRadius: "9999px",
                  }}
                >
                  {roleInfo.label}
                </span>

                {/* Điểm tích lũy nếu là Khách hàng */}
                {!isAdmin && !isStaff && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "2px 10px",
                      background: "#FAF3E8",
                      color: "#9C6B3A",
                      border: "1px solid #E4D2B8",
                      fontWeight: 700,
                      fontSize: "11px",
                      borderRadius: "9999px",
                    }}
                  >
                    ⭐ {profile?.loyaltyPoints || 0} pts
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "4px",
                  fontSize: "13px",
                  color: "#6E5C4A",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  Tài khoản:{" "}
                  <strong style={{ color: "#2A1E14" }}>
                    @{profile?.username}
                  </strong>
                </div>
                <span>•</span>
                <div>
                  Email:{" "}
                  <strong style={{ color: "#2A1E14" }}>
                    {profile?.email || "Chưa cập nhật"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Cụm Nút Thao tác */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/edit-profile"
              style={{
                padding: "8px 16px",
                background: "#2A1E14",
                color: "#E7C9A1",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "12.5px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 6px rgba(42,30,20,0.12)",
                transition: "all 0.15s",
              }}
            >
              <span>✎</span>
              <span>Chỉnh sửa</span>
            </Link>

            <Link
              to="/change-password"
              style={{
                padding: "8px 14px",
                background: "#FAF3E8",
                color: "#2A1E14",
                border: "1px solid #E4D2B8",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "12.5px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              <span>🔒</span>
              <span>Đổi mật khẩu</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: "8px 14px",
                background: "#FFF",
                color: "#DC2626",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "12.5px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.15s",
              }}
              title="Đăng xuất tài khoản"
            >
              <span>🚪</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* KHỐI 2: BẢNG THÔNG TIN CHI TIẾT */}
        <section
          style={{
            background: "#FFFDF9",
            border: "1px solid #E4D2B8",
            borderRadius: "16px",
            padding: "20px 24px",
            boxShadow: "0 4px 16px rgba(42, 30, 20, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "12px",
              borderBottom: "1px solid #F0E5D4",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "'Fraunces', serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "#2A1E14",
              }}
            >
              Thông Tin Cá Nhân & Liên Hệ
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px 16px",
            }}
            className="profile-info-compact-grid"
          >
            {/* Họ và tên */}
            <div
              style={{
                padding: "10px 14px",
                background: "#FAF6EE",
                border: "1px solid #EDE2D1",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9C6B3A",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: "2px",
                }}
              >
                Họ và tên
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#2A1E14",
                }}
              >
                {profile?.fullName || "Chưa cập nhật"}
              </div>
            </div>

            {/* Tên đăng nhập */}
            <div
              style={{
                padding: "10px 14px",
                background: "#FAF6EE",
                border: "1px solid #EDE2D1",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9C6B3A",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: "2px",
                }}
              >
                Tên đăng nhập
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#2A1E14",
                }}
              >
                @{profile?.username}
              </div>
            </div>

            {/* Email */}
            <div
              style={{
                padding: "10px 14px",
                background: "#FAF6EE",
                border: "1px solid #EDE2D1",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9C6B3A",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: "2px",
                }}
              >
                Địa chỉ Email
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#2A1E14",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {profile?.email || "Chưa cập nhật"}
              </div>
            </div>

            {/* Số điện thoại */}
            <div
              style={{
                padding: "10px 14px",
                background: "#FAF6EE",
                border: "1px solid #EDE2D1",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9C6B3A",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: "2px",
                }}
              >
                Số điện thoại
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#2A1E14",
                }}
              >
                {profile?.phone || "Chưa cập nhật"}
              </div>
            </div>

            {/* Ngày sinh */}
            <div
              style={{
                padding: "10px 14px",
                background: "#FAF6EE",
                border: "1px solid #EDE2D1",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9C6B3A",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: "2px",
                }}
              >
                Ngày sinh
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#2A1E14",
                }}
              >
                {formatDate(profile?.dateOfBirth)}
              </div>
            </div>

            {/* Giới tính */}
            <div
              style={{
                padding: "10px 14px",
                background: "#FAF6EE",
                border: "1px solid #EDE2D1",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9C6B3A",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: "2px",
                }}
              >
                Giới tính
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#2A1E14",
                }}
              >
                {profile?.gender === "MALE"
                  ? "Nam"
                  : profile?.gender === "FEMALE"
                    ? "Nữ"
                    : "Chưa cập nhật"}
              </div>
            </div>

            {/* Địa chỉ */}
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "10px 14px",
                background: "#FAF6EE",
                border: "1px solid #EDE2D1",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9C6B3A",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: "2px",
                }}
              >
                Địa chỉ cư trú
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#2A1E14",
                }}
              >
                {profile?.address || "Chưa cập nhật địa chỉ"}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Popup
        open={popup.open}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
