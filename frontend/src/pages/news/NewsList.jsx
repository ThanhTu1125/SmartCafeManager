import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { getNewsList, getApiErrorMessage } from "../../services/apiService";
import { canManageNews, formatNewsDate } from "../../utils/newsHelpers";
import "../../styles/news.css";

const PAGE_SIZE = 9;

export default function NewsList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const manageNews = canManageNews();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getNewsList(page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        const data = res.data || {};
        setItems(data.content || []);
        setTotalPages(Math.max(1, data.totalPages || 1));
        setTotalElements(data.totalElements ?? (data.content || []).length);
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        setError(getApiErrorMessage(err, "Không tải được danh sách tin tức."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const goTo = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Lọc bài viết theo từ khóa tìm kiếm (ở trang hiện tại)
  const filteredItems = useMemo(() => {
    if (!searchKeyword.trim()) return items;
    const kw = searchKeyword.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(kw) ||
        item.summary?.toLowerCase().includes(kw),
    );
  }, [items, searchKeyword]);

  // Tách bài viết đầu tiên làm Spotlight (nếu không tìm kiếm và ở trang 0)
  const isFirstPage = page === 0 && !searchKeyword.trim();
  const spotlightItem =
    isFirstPage && filteredItems.length > 0 ? filteredItems[0] : null;
  const gridItems = spotlightItem ? filteredItems.slice(1) : filteredItems;

  return (
    <>
      <Header />
      <main className="w-full bg-[#FDFBF7] min-h-screen pb-24 font-['Inter',sans-serif]">
        {/* 1. Header Banner Tin tức */}
        <section className="px-4 pt-6 pb-4 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#F5ECE0] via-[#EFE4D4] to-[#E5D7C2] rounded-3xl p-6 md:p-10 border border-[#D2A97B]/30 shadow-xs relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D2A97B]/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4A3B32]/10 rounded-full text-xs font-semibold text-[#5C4033] mb-2.5">
                  <span>📰</span>
                  <span>Bản tin & Câu chuyện NEOCAFÉ</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-[#2E1F14] tracking-tight leading-tight">
                  Khám phá Hương Vị & Ưu Đãi Mới
                </h1>
                <p className="text-xs md:text-sm text-[#6E5C4A] mt-2 leading-relaxed">
                  Cập nhật các chương trình khuyến mãi đặc quyền, hành trình hạt
                  cà phê và những câu chuyện thú vị từ quán.
                </p>
              </div>

              {/* Ô tìm kiếm nhanh */}
              <div className="w-full md:w-72">
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-gray-400 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white/90 focus:bg-white text-xs md:text-sm rounded-full border border-[#D2A97B]/40 focus:outline-none focus:ring-2 focus:ring-[#8D6E63] shadow-xs transition-all"
                  />
                  {searchKeyword && (
                    <button
                      onClick={() => setSearchKeyword("")}
                      className="absolute right-3 text-xs text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Quản lý tin tức (dành riêng cho Admin) */}
        {manageNews && (
          <div className="px-4 max-w-5xl mx-auto mb-2 flex justify-end">
            <Link
              to="/admin/news"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3E2723] text-white text-xs font-semibold rounded-full hover:bg-[#5C4D3F] transition-all shadow-xs"
            >
              <span>⚙️</span>
              <span>Trang quản lý tin tức (Admin)</span>
            </Link>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4">
          {/* Trạng thái Loading */}
          {loading && (
            <div className="py-16 text-center text-sm text-[#795548] flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-[#D2A97B] border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tải các bài viết mới nhất…</span>
            </div>
          )}

          {/* Trạng thái Lỗi */}
          {!loading && error && (
            <div className="p-6 my-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-200 text-center">
              {error}
            </div>
          )}

          {/* Trạng thái Rỗng */}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-500 bg-white rounded-3xl p-8 border border-amber-900/5 my-4">
              <span className="text-3xl block mb-2">🍃</span>
              {searchKeyword
                ? "Không tìm thấy bài viết nào phù hợp với từ khóa."
                : "Chưa có tin tức nào được đăng tải."}
            </div>
          )}

          {/* Nội dung danh sách tin tức */}
          {!loading && !error && filteredItems.length > 0 && (
            <>
              {/* 3. BÀI VIẾT NỔI BẬT (SPOTLIGHT HERO CARD) */}
              {spotlightItem && (
                <div className="mb-8">
                  <div className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-2.5 flex items-center gap-1">
                    <span>⭐</span>
                    <span>Bài viết nổi bật hôm nay</span>
                  </div>
                  <Link
                    to={`/news/${spotlightItem.newsId || spotlightItem.id}`}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-amber-900/10 flex flex-col md:flex-row transition-all duration-300 active:scale-[0.99]"
                  >
                    <div className="md:w-3/5 relative aspect-video md:aspect-auto overflow-hidden bg-gray-100">
                      <img
                        src={
                          spotlightItem.imageUrl ||
                          "https://via.placeholder.com/600x400"
                        }
                        alt={spotlightItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/600x400";
                        }}
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-[#3E2723]/90 backdrop-blur-md text-[#E7C9A1] text-xs font-bold rounded-full shadow-xs">
                        HOT
                      </div>
                    </div>
                    <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-white to-[#FAF6EE]">
                      <div>
                        <div className="text-xs font-semibold text-[#A4B435] mb-2">
                          📅 {formatNewsDate(spotlightItem.createdAt)}
                        </div>
                        <h2 className="text-lg md:text-2xl font-bold text-[#2E1F14] group-hover:text-[#8D6E63] transition-colors leading-snug line-clamp-2 md:line-clamp-3 mb-3">
                          {spotlightItem.title}
                        </h2>
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-3 md:line-clamp-4">
                          {spotlightItem.summary ||
                            "Bấm vào để đọc toàn bộ bài viết và khám phá các thông tin chi tiết."}
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-amber-900/5 flex items-center gap-2 text-xs md:text-sm font-bold text-[#3E2723] group-hover:translate-x-1 transition-transform">
                        <span>Đọc toàn bộ bài viết</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* 4. LƯỚI CÁC BÀI VIẾT KHÁC (GRID CARDS) */}
              {gridItems.length > 0 && (
                <div className="mb-8">
                  {spotlightItem && (
                    <div className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-3">
                      Các tin tức khác
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {gridItems.map((item) => (
                      <Link
                        key={item.newsId || item.id}
                        to={`/news/${item.newsId || item.id}`}
                        className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg border border-amber-900/10 flex flex-col justify-between transition-all duration-200 active:scale-[0.98]"
                      >
                        <div>
                          <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                            <img
                              src={
                                item.imageUrl ||
                                "https://via.placeholder.com/400x250"
                              }
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/400x250";
                              }}
                            />
                          </div>
                          <div className="p-4 md:p-5">
                            <div className="text-[11px] font-semibold text-[#A4B435] mb-1.5">
                              {formatNewsDate(item.createdAt)}
                            </div>
                            <h3 className="text-sm md:text-base font-bold text-[#2E1F14] group-hover:text-[#8D6E63] transition-colors line-clamp-2 leading-snug mb-2">
                              {item.title}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {item.summary || "Xem chi tiết bài viết."}
                            </p>
                          </div>
                        </div>
                        <div className="px-4 pb-4 md:px-5 md:pb-5 pt-0 flex items-center justify-between text-xs font-bold text-[#8D6E63]">
                          <span>Xem chi tiết</span>
                          <span className="group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. THANH PHÂN TRANG (PAGINATION) */}
              {totalPages > 1 && !searchKeyword && (
                <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => goTo(page - 1)}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-white text-[#3E2723] border border-amber-900/15 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FAF4EC] shadow-xs cursor-pointer transition-all"
                  >
                    ← Trước
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goTo(i)}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          page === i
                            ? "bg-[#3E2723] text-[#E7C9A1] shadow-sm scale-105"
                            : "bg-white text-[#3E2723] border border-amber-900/10 hover:bg-[#FAF4EC]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => goTo(page + 1)}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-white text-[#3E2723] border border-amber-900/15 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FAF4EC] shadow-xs cursor-pointer transition-all"
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* NÚT ĐẶT MÓN NỔI (FLOATING QUICK ORDER) */}
        <div className="fixed bottom-5 right-5 z-50">
          <button
            onClick={() => navigate("/menu")}
            className="bg-gradient-to-r from-[#3E2723] to-[#2E1F14] text-[#E7C9A1] px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-sm hover:scale-105 active:scale-95 transition-all duration-200 border border-[#D2A97B]/40 cursor-pointer backdrop-blur-xs"
            title="Xem Menu & Đặt món"
          >
            <span className="text-base animate-bounce">☕</span>
            <span>Gọi món tại bàn</span>
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
