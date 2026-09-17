import * as Yup from "yup";

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const imageSchema = Yup.mixed()
  .nullable()
  .test("fileSize", "Ảnh tối đa 10MB", (file) => {
    if (!file) return true;
    return file.size <= MAX_IMAGE_BYTES;
  })
  .test("fileType", "Chỉ chấp nhận JPG, PNG, WEBP hoặc GIF", (file) => {
    if (!file) return true;
    return IMAGE_TYPES.includes(file.type);
  });

const baseItemFields = {
  itemCode: Yup.string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .required("Mã món không được để trống")
    .min(2, "Mã món tối thiểu 2 ký tự")
    .max(50, "Mã món tối đa 50 ký tự")
    .matches(
      /^[A-Za-z0-9_-]+$/,
      "Mã món chỉ gồm chữ, số, gạch ngang (-) hoặc gạch dưới (_)"
    ),
  itemName: Yup.string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .required("Tên món không được để trống")
    .min(2, "Tên món tối thiểu 2 ký tự")
    .max(100, "Tên món tối đa 100 ký tự"),
  price: Yup.number()
    .transform((value, original) => {
      if (original === "" || original == null) return undefined;
      return typeof original === "number" ? original : Number(original);
    })
    .typeError("Giá phải là số")
    .required("Giá không được để trống")
    .integer("Giá phải là số nguyên (VNĐ)")
    .min(1000, "Giá tối thiểu 1.000đ")
    .max(10_000_000, "Giá tối đa 10.000.000đ"),
  description: Yup.string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .max(1000, "Mô tả tối đa 1.000 ký tự")
    .nullable(),
  categoryMode: Yup.string().oneOf(["existing", "new"]).required(),
  categoryId: Yup.mixed().when("categoryMode", {
    is: "existing",
    then: (schema) =>
      schema
        .required("Vui lòng chọn danh mục")
        .test("valid-id", "Danh mục không hợp lệ", (v) => v !== "" && v != null && !Number.isNaN(Number(v))),
    otherwise: (schema) => schema.nullable(),
  }),
  newCategoryName: Yup.string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .when("categoryMode", {
      is: "new",
      then: (schema) =>
        schema
          .required("Vui lòng nhập tên danh mục mới")
          .min(2, "Tên danh mục tối thiểu 2 ký tự")
          .max(80, "Tên danh mục tối đa 80 ký tự"),
      otherwise: (schema) => schema.nullable(),
    }),
};

/** Tạo món: bắt buộc có ảnh (Cloudinary) */
export const itemCreateSchema = Yup.object({
  ...baseItemFields,
  image: imageSchema
    .required("Vui lòng chọn ảnh món")
    .test("required-file", "Vui lòng chọn ảnh món", (file) => Boolean(file)),
});

/** Sửa món: ảnh tùy chọn nếu đã có ảnh cũ */
export const itemUpdateSchema = Yup.object({
  ...baseItemFields,
  isAvailable: Yup.boolean().required(),
  image: imageSchema,
  existingImageUrl: Yup.string().nullable(),
}).test(
  "image-or-existing",
  "Món cần có ảnh — tải ảnh mới hoặc giữ ảnh hiện có",
  function (values) {
    const hasNew = Boolean(values?.image);
    const hasOld = Boolean(values?.existingImageUrl);
    if (hasNew || hasOld) return true;
    return this.createError({ path: "image", message: "Vui lòng tải ảnh món lên" });
  }
);

export { IMAGE_TYPES, MAX_IMAGE_BYTES };
