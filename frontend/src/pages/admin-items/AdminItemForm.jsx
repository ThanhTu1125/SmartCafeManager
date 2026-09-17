import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  getAdminItems,
  getAdminItemById,
  createAdminItem,
  updateAdminItem,
  getApiErrorMessage,
} from "../../services/apiService";
import { extractCategories } from "../../utils/itemHelpers";
import { itemCreateSchema, itemUpdateSchema } from "../../validation/itemSchemas";
import { notifyError, notifySuccess } from "../../utils/toast";
import "../../styles/admin-items.css";

const emptyValues = {
  itemCode: "",
  itemName: "",
  price: "",
  description: "",
  categoryMode: "existing",
  categoryId: "",
  newCategoryName: "",
  isAvailable: true,
  image: null,
  existingImageUrl: "",
};

export default function AdminItemForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(emptyValues);
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const listRes = await getAdminItems();
        const list = Array.isArray(listRes.data)
          ? listRes.data
          : listRes.data?.content || [];
        if (!cancelled) setCategories(extractCategories(list));

        if (isEdit) {
          const res = await getAdminItemById(id);
          const item = res.data || {};
          if (!cancelled) {
            setInitialValues({
              itemCode: item.itemCode || "",
              itemName: item.itemName || "",
              price: item.price != null ? Number(item.price) : "",
              description: item.description || "",
              categoryMode: item.categoryId != null ? "existing" : "new",
              categoryId: item.categoryId != null ? String(item.categoryId) : "",
              newCategoryName: "",
              isAvailable: item.isAvailable !== false,
              image: null,
              existingImageUrl: item.imageUrl || "",
            });
            setPreview(item.imageUrl || "");
          }
        } else if (!cancelled) {
          setInitialValues(emptyValues);
          setPreview("");
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(err, "Không tải được dữ liệu món."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const schema = useMemo(
    () => (isEdit ? itemUpdateSchema : itemCreateSchema),
    [isEdit]
  );

  return (
    <>
      <Header />
      <main className="items-page">
        <div className="wrap">
          <Link to="/admin/items" className="items-back">
            ← Quay lại danh sách món
          </Link>

          <div className="page-head centered">
            <div>
              <h1 className="page-title">{isEdit ? "Sửa thông tin món" : "Tạo món mới"}</h1>
            </div>
          </div>

          {loading && <div className="items-loading">Đang tải…</div>}
          {!loading && loadError && (
            <div className="items-error">
              {loadError}{" "}
              <Link to="/admin/items" className="items-back">
                Quay lại
              </Link>
            </div>
          )}

          {!loading && !loadError && (
            <div className="items-form-shell">
            <Formik
              initialValues={initialValues}
              enableReinitialize
              validationSchema={schema}
              validateOnBlur
              validateOnChange={false}
              onSubmit={async (values, { setSubmitting, setFieldError }) => {
                setSubmitError("");
                try {
                  const payload = {
                    itemCode: values.itemCode.trim(),
                    itemName: values.itemName.trim(),
                    price: Number(values.price),
                    description: (values.description || "").trim(),
                    image: values.image || null,
                  };

                  if (values.categoryMode === "new") {
                    payload.newCategoryName = values.newCategoryName.trim();
                  } else {
                    payload.categoryId = Number(values.categoryId);
                  }

                  if (isEdit) {
                    payload.isAvailable = Boolean(values.isAvailable);
                    await updateAdminItem(id, payload);
                    notifySuccess("Cập nhật món thành công.");
                    navigate("/admin/items");
                  } else {
                    await createAdminItem(payload);
                    notifySuccess("Thêm món mới thành công.");
                    navigate("/admin/items");
                  }
                } catch (err) {
                  const validationErrors = err?.response?.data?.validationErrors;
                  if (validationErrors && typeof validationErrors === "object") {
                    Object.entries(validationErrors).forEach(([field, msg]) => {
                      setFieldError(field, msg);
                    });
                  }
                  const raw = err?.response?.data;
                  const msg =
                    typeof raw === "string" && /upload size|Maximum upload/i.test(raw)
                      ? "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB."
                      : getApiErrorMessage(err, "Lưu món thất bại.");
                  setSubmitError(msg);
                  notifyError(msg);
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
                  <Form className="items-form" noValidate>
                    {submitError && <div className="items-error">{submitError}</div>}
                    {submitCount > 0 && Object.keys(errors).length > 0 && !submitError && (
                      <div className="items-error">
                        {typeof Object.values(errors)[0] === "string"
                          ? Object.values(errors)[0]
                          : "Vui lòng kiểm tra lại thông tin."}
                      </div>
                    )}

                    <div className="items-form-row">
                      <label className="items-form-field">
                        <span className="items-form-label">
                          Mã món <em>*</em>
                        </span>
                        <Field
                          name="itemCode"
                          className={`items-input ${showErr("itemCode") ? "is-invalid" : ""}`}
                          placeholder="VD: CF-LATTE-01"
                          maxLength={50}
                        />
                        {showErr("itemCode") && (
                          <span className="items-field-error">{errors.itemCode}</span>
                        )}
                      </label>

                      <label className="items-form-field">
                        <span className="items-form-label">
                          Giá (VNĐ) <em>*</em>
                        </span>
                        <Field
                          name="price"
                          type="number"
                          min={1000}
                          step={1000}
                          className={`items-input ${showErr("price") ? "is-invalid" : ""}`}
                          placeholder="45000"
                        />
                        {showErr("price") && (
                          <span className="items-field-error">{errors.price}</span>
                        )}
                      </label>
                    </div>

                    <label className="items-form-field">
                      <span className="items-form-label">
                        Tên món <em>*</em>
                      </span>
                      <Field
                        name="itemName"
                        className={`items-input ${showErr("itemName") ? "is-invalid" : ""}`}
                        placeholder="Cà phê Latte"
                        maxLength={100}
                      />
                      {showErr("itemName") && (
                        <span className="items-field-error">{errors.itemName}</span>
                      )}
                    </label>

                    <label className="items-form-field">
                      <span className="items-form-label">Mô tả</span>
                      <Field
                        as="textarea"
                        name="description"
                        className={`items-textarea ${showErr("description") ? "is-invalid" : ""}`}
                        placeholder="Mô tả ngắn về món"
                        maxLength={1000}
                      />
                      {showErr("description") && (
                        <span className="items-field-error">{errors.description}</span>
                      )}
                    </label>

                    <div className="items-form-field">
                      <span className="items-form-label">
                        Danh mục <em>*</em>
                      </span>
                      <div className="items-mode-tabs">
                        <button
                          type="button"
                          className={values.categoryMode === "existing" ? "is-active" : ""}
                          onClick={() => setFieldValue("categoryMode", "existing")}
                        >
                          Danh mục có sẵn
                        </button>
                        <button
                          type="button"
                          className={values.categoryMode === "new" ? "is-active" : ""}
                          onClick={() => setFieldValue("categoryMode", "new")}
                        >
                          Danh mục mới
                        </button>
                      </div>

                      {values.categoryMode === "existing" ? (
                        <>
                          <Field
                            as="select"
                            name="categoryId"
                            className={`items-select ${showErr("categoryId") ? "is-invalid" : ""}`}
                          >
                            <option value="">— Chọn danh mục —</option>
                            {categories.map((c) => (
                              <option key={c.categoryId} value={c.categoryId}>
                                {c.categoryName}
                              </option>
                            ))}
                          </Field>
                          {showErr("categoryId") && (
                            <span className="items-field-error">{errors.categoryId}</span>
                          )}
                        </>
                      ) : (
                        <>
                          <Field
                            name="newCategoryName"
                            className={`items-input ${showErr("newCategoryName") ? "is-invalid" : ""}`}
                            placeholder="Tên danh mục mới"
                            maxLength={80}
                          />
                          {showErr("newCategoryName") && (
                            <span className="items-field-error">{errors.newCategoryName}</span>
                          )}
                        </>
                      )}
                    </div>

                    {isEdit && (
                      <label className="items-check">
                        <Field type="checkbox" name="isAvailable" />
                        Đang bán
                      </label>
                    )}

                    <div className="items-form-field">
                      <span className="items-form-label">
                        Ảnh món {isEdit ? "" : <em>*</em>}
                      </span>
                      <div className="items-file-row">
                        <input
                          id="item-image-input"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="items-file-input"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setFieldValue("image", file);
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setPreview(url);
                            } else {
                              setPreview(values.existingImageUrl || "");
                            }
                          }}
                        />
                        <label
                          htmlFor="item-image-input"
                          className={`items-file-btn ${showErr("image") ? "is-invalid" : ""}`}
                        >
                          Chọn tệp ảnh
                        </label>
                        <span className="items-file-name">
                          {values.image?.name ||
                            (preview ? "Đã có ảnh" : "Chưa chọn tệp")}
                        </span>
                      </div>
                      {showErr("image") && (
                        <span className="items-field-error">{errors.image}</span>
                      )}
                      {preview ? (
                        <img className="items-preview" src={preview} alt="Xem trước món" />
                      ) : null}
                    </div>

                    <div className="items-form-actions">
                      <button
                        type="submit"
                        className="items-btn items-btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Tạo món"}
                      </button>
                      <Link to="/admin/items" className="items-btn">
                        Hủy
                      </Link>
                    </div>
                  </Form>
                );
              }}
            </Formik>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
