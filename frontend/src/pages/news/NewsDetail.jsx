import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  getNewsById,
  getNewsList,
  getApiErrorMessage,
} from "../../services/apiService";
import {
  canManageNews,
  canEditOrDeleteNews,
  formatNewsDate,
} from "../../utils/newsHelpers";
import "../../styles/news.css";

import { getHomePath } from "../../utils/authRedirect";

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const manageNews = canManageNews();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setNews(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 1. Tải chi tiết bài viết hiện tại
    getNewsById(id)
      .then((res) => {
        if (!cancelled) setNews(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Không tìm thấy bài viết."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // 2. Tải thêm 4 bài viết mới nhất để làm "Bài viết liên quan"
    getNewsList(0, 4)
      .then((res) => {
        if (!cancelled) {
          const list = res.data?.content || res.data || [];
          // Loại bỏ bài viết hiện tại
          const otherItems = list.filter(
            (item) => String(item.newsId || item.id) !== String(id),
          );
          setRelatedNews(otherItems.slice(0, 3));
        }
      })
      .catch(() => {
        if (!cancelled) setRelatedNews([]);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <Header />
      <main className="w-full bg-[#FDFBF7] min-h-screen pb-24 font-['Inter',sans-serif]">
        <div className="max-w-4xl mx-auto px-4 pt-6">
          {/* Breadcrumb & Nút Quay lại */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-[#795548]">
              <Link
                to={getHomePath()}
                className="hover:text-[#3E2723] transition-colors"
              >
                Trang chủ
              </Link>
              <span>/</span>
              <Link
                to="/news"
                className="hover:text-[#3E2723] transition-colors"
              >
                Tin tức
              </Link>
              <span>/</span>
              <span className="text-[#3E2723] font-semibold truncate max-w-[200px] md:max-w-xs">
                {news?.title || "Chi tiết"}
              </span>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/news"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-white text-[#3E2723] rounded-full text-xs font-semibold border border-amber-900/15 hover:bg-[#FAF4EC] transition-all shadow-xs"
              >
                <span>←</span>
                <span>Danh sách tin</span>
              </Link>

              {manageNews && (
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/admin/news/${id}`}
                    className="px-3 py-1.5 bg-gray-100 text-[#3E2723] rounded-full text-xs font-semibold hover:bg-gray-200 transition-all"
                  >
                    Xem quản lý
                  </Link>
                  {canEditOrDeleteNews() && (
                    <Link
                      to={`/admin/news/${id}/edit`}
                      className="px-3 py-1.5 bg-[#3E2723] text-white rounded-full text-xs font-semibold hover:bg-[#5C4D3F] transition-all shadow-xs"
                    >
                      Sửa bài
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="py-24 text-center text-sm text-[#795548] flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-[#D2A97B] border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tải nội dung bài viết…</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-8 my-6 bg-red-50 text-red-700 text-sm rounded-3xl border border-red-200 text-center">
              <span className="text-3xl block mb-2">⚠️</span>
              {error}
              <div className="mt-4">
                <Link
                  to="/news"
                  className="text-xs font-bold underline text-red-800"
                >
                  Quay lại trang tin tức
                </Link>
              </div>
            </div>
          )}

          {/* Chi tiết bài viết */}
          {!loading && !error && news && (
            <article className="bg-white rounded-3xl p-5 md:p-10 shadow-xs border border-amber-900/10">
              {/* Header bài viết */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D2A97B]/20 text-[#5C4033] font-semibold text-xs rounded-full mb-3">
                  <span>☕</span>
                  <span>Bản tin NEOCAFÉ</span>
                </div>

                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-[#2E1F14] tracking-tight leading-tight mb-4">
                  {news.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-[#8D6E63] pb-6 border-b border-gray-100">
                  <span className="flex items-center gap-1">
                    📅 {formatNewsDate(news.createdAt)}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">⏱️ 3 phút đọc</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    ✍️ Ban biên tập NEOCAFÉ
                  </span>
                </div>
              </div>

              {/* Ảnh bìa chính của bài viết */}
              {news.imageUrl && (
                <div className="mb-8 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm aspect-video md:aspect-[21/9] bg-gray-100 relative group cursor-pointer">
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    onClick={() => setLightboxOpen(true)}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    🔍 Bấm để phóng to ảnh
                  </div>
                </div>
              )}

              {/* Tóm tắt mở đầu (Lead Summary Callout) */}
              {news.summary && (
                <div className="mb-8 p-4 md:p-5 bg-gradient-to-r from-[#FAF4EC] to-[#F5ECE0] rounded-2xl border-l-4 border-[#C2986A] text-[#4A3B32] font-medium text-sm md:text-base leading-relaxed italic shadow-xs">
                  {news.summary}
                </div>
              )}

              {/* Nội dung chi tiết bài viết (Rich Content) */}
              <div
                className="news-article-content text-sm md:text-base text-[#3E2723] leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: news.content || "" }}
              />

              {/* Khu vực Chia sẻ & Call To Action */}
              <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#FAF4EC] hover:bg-[#F3EAD8] text-[#5C4033] font-semibold text-xs md:text-sm border border-amber-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>🔗</span>
                  <span>
                    {copied ? "Đã sao chép liên kết!" : "Chia sẻ bài viết"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/menu")}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#3E2723] to-[#5C4033] text-[#E7C9A1] font-bold text-xs md:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>☕</span>
                  <span>Xem menu & Đặt món ngay</span>
                </button>
              </div>
            </article>
          )}

          {/* 5. KHU VỰC BÀI VIẾT LIÊN QUAN (RELATED ARTICLES) */}
          {!loading && relatedNews.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">✨</span>
                  <h3 className="text-base md:text-xl font-bold text-[#2E1F14] tracking-tight">
                    Bài viết liên quan khác
                  </h3>
                </div>
                <Link
                  to="/news"
                  className="text-xs md:text-sm font-bold text-[#8D6E63] hover:text-[#3E2723] transition-colors"
                >
                  Xem tất cả →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedNews.map((item) => (
                  <Link
                    key={item.newsId || item.id}
                    to={`/news/${item.newsId || item.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-amber-900/10 flex flex-col justify-between transition-all duration-200 active:scale-[0.98]"
                  >
                    <div>
                      <div className="aspect-video w-full overflow-hidden bg-gray-100">
                        <img
                          src={
                            item.imageUrl ||
                            "https://via.placeholder.com/350x200"
                          }
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3.5">
                        <div className="text-[10px] font-semibold text-[#A4B435] mb-1">
                          {formatNewsDate(item.createdAt)}
                        </div>
                        <h4 className="text-xs md:text-sm font-bold text-[#2E1F14] group-hover:text-[#8D6E63] transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Modal Lightbox Xem ảnh đầy đủ */}
        {news?.imageUrl && lightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={news.imageUrl}
                alt={news.title}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
              <button
                type="button"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white font-bold text-lg flex items-center justify-center hover:bg-black transition-colors"
                onClick={() => setLightboxOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
