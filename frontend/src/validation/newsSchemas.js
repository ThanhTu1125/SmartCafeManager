import * as Yup from "yup";
import { stripHtml } from "../utils/newsHelpers";

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const newsFormSchema = Yup.object({
  title: Yup.string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .required("Tiêu đề không được để trống")
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(255, "Tiêu đề tối đa 255 ký tự"),
  summary: Yup.string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .max(500, "Tóm tắt tối đa 500 ký tự")
    .nullable(),
  content: Yup.string()
    .required("Nội dung không được để trống")
    .test(
      "min-text",
      "Nội dung phải có ít nhất 20 ký tự",
      (value) => stripHtml(value).length >= 20
    )
    .test(
      "max-text",
      "Nội dung tối đa 10.000 ký tự",
      (value) => stripHtml(value).length <= 10000
    ),
  image: Yup.mixed()
    .nullable()
    .test("fileSize", "Ảnh tối đa 5MB", (file) => {
      if (!file) return true;
      return file.size <= MAX_IMAGE_BYTES;
    })
    .test("fileType", "Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF", (file) => {
      if (!file) return true;
      return IMAGE_TYPES.includes(file.type);
    }),
});
