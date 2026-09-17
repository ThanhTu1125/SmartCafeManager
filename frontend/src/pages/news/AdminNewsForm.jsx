import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  createNews,
  updateNews,
  getAdminNewsById,
  getApiErrorMessage,
} from "../../services/apiService";
import { isAdminRole, stripHtml } from "../../utils/newsHelpers";
import { newsFormSchema } from "../../validation/newsSchemas";
import NewsEditor from "../../components/NewsEditor";
import "../../styles/news.css";

const emptyValues = {
  title: "",
  summary: "",
  content: "",
  image: null,
};

export default function AdminNewsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(emptyValues);
  const [preview, setPreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!isEdit) return undefined;
    let cancelled = false;
    setLoading(true);
    getAdminNewsById(id)
      .then((res) => {
        if (cancelled) return;
        const n = res.data || {};
        if (!isAdminRole()) {
          setLoadError("Chỉ admin được sửa bài viết tin tức.");
          return;
        }
        setInitialValues({
          title: n.title || "",
          summary: n.summary || "",
          content: n.content || "",
          image: null,
        });
        setExistingImageUrl(n.imageUrl || "");
        setPreview(n.imageUrl || "");
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(err, "Không tải được bài viết."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  return (
    <>
      <Header />
      <main className="news-page">
        <div className="wrap">
          <Link to="/admin/news" className="news-detail-back">
            ← Quay lại danh sách
          </Link>

          <div className="page-head">
            <h1 className="page-title">
              {isEdit ? "Sửa tin tức" : "Tạo tin mới"}
            </h1>
          </div>

          {loading && <div className="news-loading">Đang tải…</div>}

          {!loading && loadError && (
            <div className="news-error">
              {loadError}{" "}
              <Link to="/admin/news" className="news-card-more">
                Quay lại danh sách
              </Link>
            </div>
          )}

          {!loading && !loadError && (
            <Formik
              initialValues={initialValues}
              enableReinitialize
              validationSchema={newsFormSchema}
              validateOnBlur
              validateOnChange={false}
              onSubmit={async (values, { setSubmitting, setFieldError }) => {
                setSubmitError("");
                try {
                  const payload = {
                    title: values.title.trim(),
                    summary: (values.summary || "").trim(),
                    content: values.content,
                    image: values.image || null,
                  };
                  if (isEdit) {
                    await updateNews(id, payload);
                    navigate(`/admin/news/${id}`);
                  } else {
                    const res = await createNews(payload);
                    const newId = res.data?.newsId;
                    navigate(newId ? `/admin/news/${newId}` : "/admin/news");
                  }
                } catch (err) {
                  const validationErrors =
                    err?.response?.data?.validationErrors;
                  if (
                    validationErrors &&
                    typeof validationErrors === "object"
                  ) {
                    Object.entries(validationErrors).forEach(([field, msg]) => {
                      setFieldError(field, msg);
                    });
                  }
                  setSubmitError(
                    getApiErrorMessage(err, "Lưu tin tức thất bại."),
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                errors,
                touched,
                isSubmitting,
                setFieldValue,
                values,
                submitCount,
              }) => {
                const showErr = (name) =>
                  Boolean(errors[name] && (touched[name] || submitCount > 0));

                return (
                  <Form className="news-form" noValidate>
                    {submitError && (
                      <div className="news-error">{submitError}</div>
                    )}

                    <label className="news-form-field">
                      <span className="news-form-label">
                        Tiêu đề <em>*</em>
                      </span>
                      <Field
                        name="title"
                        type="text"
                        className={`news-input news-input-title ${showErr("title") ? "is-invalid" : ""}`}
                        placeholder="Ví dụ: Ra mắt menu mùa hè NEOCAFÉ"
                        maxLength={255}
                      />
                      <span className="news-form-hint">
                        5–255 ký tự · {(values.title || "").trim().length}/255
                      </span>
                      {showErr("title") && (
                        <span className="news-field-error">{errors.title}</span>
                      )}
                    </label>

                    <label className="news-form-field">
                      <span className="news-form-label">Tóm tắt</span>
                      <Field
                        as="textarea"
                        name="summary"
                        rows={3}
                        className={`news-input ${showErr("summary") ? "is-invalid" : ""}`}
                        placeholder="Mô tả ngắn để hiện trên danh sách tin (tùy chọn)"
                        maxLength={500}
                      />
                      <span className="news-form-hint">
                        Tối đa 500 ký tự ·{" "}
                        {(values.summary || "").trim().length}/500
                      </span>
                      {showErr("summary") && (
                        <span className="news-field-error">
                          {errors.summary}
                        </span>
                      )}
                    </label>

                    <div className="news-form-field">
                      <span className="news-form-label">
                        Nội dung <em>*</em>
                      </span>
                      <NewsEditor
                        value={values.content}
                        onChange={(html) => setFieldValue("content", html)}
                        className={showErr("content") ? "is-invalid" : ""}
                      />
                      <span className="news-form-hint">
                        Có thể in đậm, nghiêng, danh sách… ·{" "}
                        {stripHtml(values.content).length}/10000 ký tự
                      </span>
                      {showErr("content") && (
                        <span className="news-field-error">
                          {errors.content}
                        </span>
                      )}
                    </div>

                    <div className="news-form-field">
                      <span className="news-form-label">
                        Hình ảnh {isEdit ? "(để trống nếu giữ ảnh cũ)" : ""}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className={`news-input news-input-file ${showErr("image") ? "is-invalid" : ""}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFieldValue("image", file);
                          if (file) {
                            setPreview(URL.createObjectURL(file));
                          } else {
                            setPreview(existingImageUrl || "");
                          }
                        }}
                      />
                      <span className="news-form-hint">
                        JPG, PNG, WEBP, GIF · tối đa 5MB
                      </span>
                      {showErr("image") && (
                        <span className="news-field-error">{errors.image}</span>
                      )}
                    </div>

                    {preview ? (
                      <div className="news-form-preview">
                        <img src={preview} alt="Xem trước" />
                      </div>
                    ) : null}

                    <div className="news-form-actions">
                      <button
                        type="button"
                        className="news-btn news-btn-ghost"
                        onClick={() => navigate("/admin/news")}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="news-btn news-btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? "Đang lưu…"
                          : isEdit
                            ? "Cập nhật"
                            : "Tạo bài viết"}
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
