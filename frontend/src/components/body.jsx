import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import coffeeBeans from "../assets/coffee-beans.jpg";
import {
  getLatestItems,
  getBestSellerItems,
  addItemToCart,
  getNewsList,
} from "../services/apiService";
import { canManageNews, formatNewsDate } from "../utils/newsHelpers";
import "../styles/news.css";

function Body() {
  const { tableId: urlTableId } = useParams();
  const navigate = useNavigate();
  const newsTrackRef = useRef(null);
  const [latestItems, setLatestItems] = useState([]);
  const [bestSellerItems, setBestSellerItems] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [newsTotal, setNewsTotal] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const roleName = (localStorage.getItem("roleName") || "").toUpperCase();
  const isAdmin = roleName === "ADMIN";
  const isStaff = roleName === "STAFF";
  const manageNews = canManageNews();

  const updateNewsScrollState = () => {
    const el = newsTrackRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  };

  const scrollNews = (dir) => {
    const el = newsTrackRef.current;
    if (!el) return;
    const step = Math.min(340, el.clientWidth * 0.85);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // --- BƯỚC 1: Bắt số bàn từ URL (nếu khách quét QR vào trang chủ) và lưu vào localStorage ---
  useEffect(() => {
    if (urlTableId) {
      localStorage.setItem("tableId", urlTableId);
    } else if (!localStorage.getItem("tableId")) {
      localStorage.setItem("tableId", "1");
    }
  }, [urlTableId]);

  // Lấy ra tableId đang lưu trong máy (mặc định là "1" nếu chưa quét QR)
  const currentTableId = localStorage.getItem("tableId") || "1";

  useEffect(() => {
    getLatestItems().then((res) => {
      setLatestItems(res.data || []);
    });
    getBestSellerItems().then((res) => {
      setBestSellerItems(res.data || []);
    });

    // Gọi API lấy tin tức công khai an toàn cho mọi role (Lấy 6 bài mới nhất cho Dashboard)
    getNewsList(0, 6)
      .then((res) => {
        const list = res.data?.content || res.data || [];
        setLatestNews(list);
        setNewsTotal(res.data?.totalElements ?? list.length);
      })
      .catch(() => {
        setLatestNews([]);
        setNewsTotal(0);
      });
  }, []);

  useEffect(() => {
    const el = newsTrackRef.current;
    if (!el) return undefined;
    updateNewsScrollState();
    el.addEventListener("scroll", updateNewsScrollState, { passive: true });
    window.addEventListener("resize", updateNewsScrollState);
    return () => {
      el.removeEventListener("scroll", updateNewsScrollState);
      window.removeEventListener("resize", updateNewsScrollState);
    };
  }, [latestNews]);

  const handleItemClick = async (item) => {
    const itemId = item.itemId || item.id;
    const tableId = currentTableId || 1;

    try {
      await addItemToCart(tableId, itemId, 1, "");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
    }
    window.scrollTo(0, 0);
    navigate(`/menu`);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="w-full bg-[#FDFBF7] min-h-screen pb-20 font-['Inter',sans-serif]">
      {/* 1. Phần Hero Banner - Phong cách Card bo góc mềm mại */}
      <section className="px-4 pt-4 pb-2 max-w-5xl mx-auto">
        <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-lg min-h-[220px] md:min-h-[260px] flex items-center p-6 md:p-10">
          <img
            src={coffeeBeans}
            alt="Coffee Beans"
            className="absolute inset-0 w-full h-full object-cover transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40"></div>

          <div className="relative z-10 text-white max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D2A97B]/25 backdrop-blur-md border border-[#D2A97B]/40 rounded-full text-xs font-semibold text-[#E7C9A1] mb-2.5">
              <span>☕</span>
              <span>Chào mừng bạn đến Bàn {currentTableId}</span>
            </div>

            <h1 className="text-xl md:text-3xl font-bold tracking-tight leading-tight text-white mb-2">
              Trải nghiệm Cà Phê Thông Minh
            </h1>

            <div className="flex flex-wrap gap-2.5 mt-3 items-center">
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-[#D2A97B] to-[#C2986A] text-[#241711] px-5 py-2.5 rounded-full font-bold text-sm cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 shadow-md flex items-center gap-1.5"
              >
                <span>🎁</span>
                <span>Đăng kí nhận ưu đãi</span>
              </button>
            </div>

            <p className="text-xs md:text-sm text-white/85 mt-2.5 font-normal flex items-center gap-1">
              <span>✨</span>
              <span>
                Đăng kí ngay để nhận voucher khuyến mãi 15%! và nhiều ưu đãi
                khác!
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* 2. Thanh Phím Tắt Nhanh (Quick Actions) dạng 4 nút tròn */}
      <section className="px-4 py-3 max-w-5xl mx-auto">
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          <button
            onClick={() => navigate("/menu")}
            className="flex flex-col items-center justify-center p-2.5 md:p-3.5 bg-white rounded-2xl border border-amber-900/10 shadow-xs hover:shadow-md hover:border-[#D2A97B] active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 md:w-13 md:h-13 rounded-full bg-[#F5ECE0] text-[#5C4033] flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform mb-1.5 shadow-inner">
              ☕
            </div>
            <span className="text-[11px] md:text-xs font-bold text-[#3E2723] text-center leading-tight">
              Gọi món
            </span>
          </button>

          <button
            onClick={() => scrollToSection("best-sellers-section")}
            className="flex flex-col items-center justify-center p-2.5 md:p-3.5 bg-white rounded-2xl border border-amber-900/10 shadow-xs hover:shadow-md hover:border-[#D2A97B] active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 md:w-13 md:h-13 rounded-full bg-[#FEEEDD] text-[#D97706] flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform mb-1.5 shadow-inner">
              🔥
            </div>
            <span className="text-[11px] md:text-xs font-bold text-[#3E2723] text-center leading-tight">
              Bán chạy
            </span>
          </button>

          <button
            onClick={() => scrollToSection("latest-items-section")}
            className="flex flex-col items-center justify-center p-2.5 md:p-3.5 bg-white rounded-2xl border border-amber-900/10 shadow-xs hover:shadow-md hover:border-[#D2A97B] active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 md:w-13 md:h-13 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform mb-1.5 shadow-inner">
              ✨
            </div>
            <span className="text-[11px] md:text-xs font-bold text-[#3E2723] text-center leading-tight">
              Món mới
            </span>
          </button>

          <button
            onClick={() => navigate("/news")}
            className="flex flex-col items-center justify-center p-2.5 md:p-3.5 bg-white rounded-2xl border border-amber-900/10 shadow-xs hover:shadow-md hover:border-[#D2A97B] active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 md:w-13 md:h-13 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform mb-1.5 shadow-inner">
              📰
            </div>
            <span className="text-[11px] md:text-xs font-bold text-[#3E2723] text-center leading-tight">
              Tin tức
            </span>
          </button>
        </div>
      </section>

      {/* 3. Phần Món Bán Chạy Nhất (Best Sellers) */}
      <section
        id="best-sellers-section"
        className="px-4 py-4 max-w-5xl mx-auto scroll-mt-6"
      >
        <div className="bg-gradient-to-br from-[#FAF6EE] to-[#F3EAD8] rounded-2xl md:rounded-3xl p-4 md:p-6 border border-amber-900/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg md:text-xl">🔥</span>
                <h2 className="text-base md:text-xl font-bold text-[#3E2723] tracking-tight">
                  Món bán chạy nhất
                </h2>
              </div>
              <p className="text-xs text-[#795548] mt-0.5">
                Được thực khách yêu thích và gọi nhiều nhất
              </p>
            </div>
            <button
              onClick={() => navigate("/menu")}
              className="text-xs md:text-sm font-bold text-[#8D6E63] hover:text-[#3E2723] transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <span>Xem menu</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {bestSellerItems.map((item, idx) => (
              <div
                key={item.itemId || item.id}
                onClick={() => handleItemClick(item)}
                className="bg-white rounded-xl md:rounded-2xl p-2.5 md:p-3 shadow-xs hover:shadow-md border border-amber-900/5 flex flex-col justify-between cursor-pointer hover:border-[#D2A97B]/50 transition-all duration-200 group active:scale-[0.98]"
              >
                <div className="relative aspect-square w-full rounded-lg md:rounded-xl overflow-hidden bg-gray-100 mb-2.5">
                  <img
                    src={
                      item.imageUrl && item.imageUrl.trim() !== ""
                        ? item.imageUrl
                        : "https://via.placeholder.com/150"
                    }
                    alt={item.itemName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#D97706]/90 backdrop-blur-xs text-white text-[10px] md:text-xs font-bold rounded-full shadow-xs">
                    TOP {idx + 1}
                  </div>
                </div>

                <div className="flex flex-col flex-grow justify-between">
                  <h3 className="font-bold text-xs md:text-sm text-[#2E1F14] line-clamp-1 group-hover:text-[#A4B435] transition-colors">
                    {item.itemName}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                    <span className="text-xs md:text-sm font-bold text-[#5C4033]">
                      {item.price
                        ? `${item.price.toLocaleString()}đ`
                        : "Liên hệ"}
                    </span>
                    <button
                      type="button"
                      aria-label={`Thêm ${item.itemName}`}
                      className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#3E2723] text-white flex items-center justify-center text-xs md:text-sm font-bold shadow-xs group-hover:bg-[#5C4D3F] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Phần Top Món Mới Nhất */}
      <section
        id="latest-items-section"
        className="px-4 py-3 max-w-5xl mx-auto scroll-mt-6"
      >
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-amber-900/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg md:text-xl">✨</span>
                <h2 className="text-base md:text-xl font-bold text-[#3E2723] tracking-tight">
                  Món mới lên kệ
                </h2>
              </div>
              <p className="text-xs text-[#795548] mt-0.5">
                Khám phá những công thức sáng tạo mới nhất
              </p>
            </div>
            <button
              onClick={() => navigate("/menu")}
              className="text-xs md:text-sm font-bold text-[#8D6E63] hover:text-[#3E2723] transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {latestItems.map((item) => (
              <div
                key={item.itemId || item.id}
                onClick={() => handleItemClick(item)}
                className="bg-[#FDFBF7] rounded-xl md:rounded-2xl p-2.5 md:p-3 shadow-xs hover:shadow-md border border-amber-900/5 flex flex-col justify-between cursor-pointer hover:border-[#D2A97B]/50 transition-all duration-200 group active:scale-[0.98]"
              >
                <div className="relative aspect-square w-full rounded-lg md:rounded-xl overflow-hidden bg-gray-100 mb-2.5">
                  <img
                    src={
                      item.imageUrl && item.imageUrl.trim() !== ""
                        ? item.imageUrl
                        : "https://via.placeholder.com/150"
                    }
                    alt={item.itemName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#2E7D32]/90 backdrop-blur-xs text-white text-[10px] md:text-xs font-bold rounded-full shadow-xs">
                    MỚI
                  </div>
                </div>

                <div className="flex flex-col flex-grow justify-between">
                  <h3 className="font-bold text-xs md:text-sm text-[#2E1F14] line-clamp-1 group-hover:text-[#A4B435] transition-colors">
                    {item.itemName}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                    <span className="text-xs md:text-sm font-bold text-[#5C4033]">
                      {item.price
                        ? `${item.price.toLocaleString()}đ`
                        : "Liên hệ"}
                    </span>
                    <button
                      type="button"
                      aria-label={`Thêm ${item.itemName}`}
                      className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#3E2723] text-white flex items-center justify-center text-xs md:text-sm font-bold shadow-xs group-hover:bg-[#5C4D3F] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Phần Tin Tức NEOCAFÉ */}
      <section className="px-4 py-4 max-w-5xl mx-auto">
        <div className="home-news-inner bg-[#FBF7F0] rounded-2xl md:rounded-3xl p-4 md:p-6 border border-amber-900/10">
          <div className="home-news-head mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg md:text-xl">📰</span>
                <h2 className="text-base md:text-xl font-bold text-[#3E2723] tracking-tight">
                  Tin tức & Khuyến mãi
                </h2>
              </div>
              <p className="text-xs text-[#795548] mt-0.5">
                Cập nhật thông tin ưu đãi và hoạt động mới nhất
                {newsTotal > 0 ? ` · ${newsTotal} bài viết` : ""}.
              </p>
            </div>
            <div className="home-news-actions">
              {latestNews.length > 0 && (
                <div className="home-news-nav hidden sm:flex">
                  <button
                    type="button"
                    className="home-news-nav-btn"
                    aria-label="Lướt trái"
                    disabled={!canScrollLeft}
                    onClick={() => scrollNews(-1)}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="home-news-nav-btn"
                    aria-label="Lướt phải"
                    disabled={!canScrollRight}
                    onClick={() => scrollNews(1)}
                  >
                    →
                  </button>
                </div>
              )}
              <Link
                to="/news"
                className="news-btn news-btn-primary text-xs md:text-sm"
              >
                Xem tất cả
              </Link>
              {manageNews && (
                <Link
                  to="/admin/news"
                  className="news-btn news-btn-ghost text-xs md:text-sm"
                >
                  Quản lý
                </Link>
              )}
            </div>
          </div>

          {latestNews.length === 0 ? (
            <div className="home-news-empty text-center py-8 text-sm text-gray-500">
              Chưa có tin tức công khai.
              {manageNews ? (
                <div>
                  <Link
                    to="/admin/news/new"
                    className="news-card-more inline-block mt-2 font-bold text-[#3E2723]"
                  >
                    Thêm bài viết đầu tiên →
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="home-news-carousel">
              <div
                className="home-news-track"
                ref={newsTrackRef}
                onScroll={updateNewsScrollState}
              >
                {latestNews.map((item) => (
                  <Link
                    key={item.newsId || item.id}
                    to={`/news/${item.newsId || item.id}`}
                    className="news-card home-news-card rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition-all border border-amber-900/5"
                  >
                    <div className="news-card-media aspect-video">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="news-card-body p-3">
                      <div className="news-card-time text-[11px] text-[#A4B435] font-semibold">
                        {formatNewsDate(item.createdAt)}
                      </div>
                      <h3 className="news-card-title text-sm font-bold text-[#3E2723] line-clamp-1 mt-1">
                        {item.title}
                      </h3>
                      <p className="news-card-summary text-xs text-gray-600 line-clamp-2 mt-1">
                        {item.summary || "Xem chi tiết bài viết."}
                      </p>
                      <span className="news-card-more text-xs font-bold text-[#8D6E63] mt-2 inline-block">
                        Đọc tiếp →
                      </span>
                    </div>
                  </Link>
                ))}
                <Link
                  to="/news"
                  className="home-news-see-all-card rounded-xl bg-white/70 border border-dashed border-[#D2A97B] p-4 flex flex-col items-center justify-center text-center"
                >
                  <span className="home-news-see-all-title text-sm font-bold text-[#3E2723]">
                    Xem tất cả
                  </span>
                  <span className="home-news-see-all-sub text-xs text-gray-500 mt-1">
                    Danh sách đầy đủ
                  </span>
                  <span className="home-news-see-all-arrow text-lg text-[#8D6E63] mt-2">
                    →
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. NÚT ĐẶT MÓN NỔI (FLOATING ACTION BUTTON) LUÔN HIỆN Ở GÓC DƯỚI */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => navigate("/menu")}
          className="bg-gradient-to-r from-[#3E2723] to-[#2E1F14] text-[#E7C9A1] px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-sm hover:scale-105 active:scale-95 transition-all duration-200 border border-[#D2A97B]/40 cursor-pointer backdrop-blur-xs"
          title="Xem Menu & Đặt món ngay"
        >
          <span className="text-base animate-bounce">☕</span>
          <span>Gọi món tại bàn</span>
        </button>
      </div>
    </main>
  );
}

export default Body;
