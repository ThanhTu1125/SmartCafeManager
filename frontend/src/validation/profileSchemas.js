import * as Yup from "yup";
import { VIETNAM_PHONE_REGEX, normalizePhone } from "../constants/assets";
import { checkPhoneAvailable } from "../services/apiService";

export const editProfileSchema = (originalPhone = "") =>
    Yup.object({
        fullName: Yup.string()
            .trim()
            .required("Họ và tên không được để trống")
            .min(2, "Họ và tên phải có ít nhất 2 ký tự"),
        email: Yup.string()
            .trim()
            .required("Email không được để trống")
            .email("Email không đúng định dạng"),
        phoneNumber: Yup.string()
            .trim()
            .required("Số điện thoại không được để trống")
            .test("phone-format", "Số điện thoại không đúng định dạng Việt Nam", (value) => {
                if (!value) return false;
                return VIETNAM_PHONE_REGEX.test(normalizePhone(value));
            })
            .test(
                "phone-duplicate",
                "Số điện thoại này đã được sử dụng bởi tài khoản khác",
                async function (value) {
                    if (!value) return true;
                    const normalized = normalizePhone(value);
                    const original = normalizePhone(originalPhone);
                    if (normalized === original) return true;
                    try {
                        const res = await checkPhoneAvailable(value.trim());
                        return res.data.available;
                    } catch {
                        // Backend chưa có API check-phone → bỏ qua, backend sẽ validate khi lưu
                        return true;
                    }
                }
            ),
        address: Yup.string().trim().max(255, "Địa chỉ tối đa 255 ký tự"),
        dateOfBirth: Yup.string().nullable(),
        gender: Yup.string().oneOf(["MALE", "FEMALE"], "Giới tính không hợp lệ"),
    });

export const changePasswordSchema = Yup.object({
    oldPassword: Yup.string().required("Vui lòng nhập mật khẩu hiện tại"),
    newPassword: Yup.string()
        .required("Vui lòng nhập mật khẩu mới")
        .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
        .notOneOf([Yup.ref("oldPassword")], "Mật khẩu mới không được trùng mật khẩu cũ"),
    confirmPassword: Yup.string()
        .required("Vui lòng xác nhận mật khẩu mới")
        .oneOf([Yup.ref("newPassword")], "Xác nhận mật khẩu không khớp"),
});

export const resetPasswordSchema = Yup.object({
    newPassword: Yup.string()
        .required("Vui lòng nhập mật khẩu mới")
        .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: Yup.string()
        .required("Vui lòng xác nhận mật khẩu mới")
        .oneOf([Yup.ref("newPassword")], "Xác nhận mật khẩu không khớp"),
});
