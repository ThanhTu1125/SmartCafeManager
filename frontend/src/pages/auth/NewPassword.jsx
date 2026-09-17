import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { resetPassword, getApiErrorMessage } from "../../services/apiService";
import { resetPasswordSchema } from "../../validation/profileSchemas";
import AuthCard from "../../components/AuthCard";
import Popup from "../../components/Popup";

const RESET_OTP_KEY = "resetOtpToken";

const initialValues = {
    newPassword: "",
    confirmPassword: "",
};

const showFieldError = (errors, touched, submitCount, field) =>
    errors[field] && (touched[field] || submitCount > 0);

export default function NewPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [popup, setPopup] = useState({ open: false, type: "info", title: "", message: "" });
    const navigate = useNavigate();
    const location = useLocation();

    const otpToken = location.state?.token || sessionStorage.getItem(RESET_OTP_KEY);

    useEffect(() => {
        if (location.state?.token) {
            sessionStorage.setItem(RESET_OTP_KEY, location.state.token);
        }
    }, [location.state?.token]);

    useEffect(() => {
        if (!otpToken) {
            setPopup({
                open: true,
                type: "warning",
                title: "Thiếu mã OTP",
                message: "Không tìm thấy mã OTP. Vui lòng thực hiện lại quy trình quên mật khẩu.",
            });
        }
    }, [otpToken]);

    const showValidationPopup = useCallback((message) => {
        setPopup({
            open: true,
            type: "warning",
            title: "Vui lòng kiểm tra lại",
            message,
        });
    }, []);

    const handlePopupClose = () => {
        const goForgot = popup.title === "Thiếu mã OTP";
        const goLogin = popup.type === "success";
        setPopup((prev) => ({ ...prev, open: false }));
        if (goForgot) {
            navigate("/forgot-password");
        } else if (goLogin) {
            sessionStorage.removeItem(RESET_OTP_KEY);
            navigate("/");
        }
    };

    const inputStyle = (hasError) =>
        `w-full h-14 rounded-2xl border ${hasError ? "border-red-400" : "border-[#E5E5E5]"} bg-[#FAFAFA] pl-14 pr-14 outline-none transition focus:bg-white focus:border-[#C89A63] focus:ring-4 focus:ring-[#C89A63]/20`;

    return (
        <>
            <AuthCard title="Mật khẩu mới" subtitle="Tạo mật khẩu mới cho tài khoản của bạn.">
                <Formik
                    initialValues={initialValues}
                    validationSchema={resetPasswordSchema}
                    validateOnChange={false}
                    validateOnBlur={false}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        if (!otpToken) {
                            setPopup({
                                open: true,
                                type: "warning",
                                title: "Thiếu mã OTP",
                                message: "Không tìm thấy mã OTP. Vui lòng thực hiện lại quy trình quên mật khẩu.",
                            });
                            setSubmitting(false);
                            return;
                        }

                        setSubmitting(true);
                        try {
                            await resetPassword(otpToken, values.newPassword);
                            resetForm();
                            sessionStorage.removeItem(RESET_OTP_KEY);
                            setPopup({
                                open: true,
                                type: "success",
                                title: "Thành công",
                                message: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
                            });
                        } catch (err) {
                            setPopup({
                                open: true,
                                type: "error",
                                title: "Đổi mật khẩu thất bại",
                                message: getApiErrorMessage(err, "Không thể đổi mật khẩu. Phiên có thể đã hết hạn."),
                            });
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, errors, touched, submitCount }) => (
                        <ValidationPopupWatcher
                            submitCount={submitCount}
                            errors={errors}
                            onShow={showValidationPopup}
                        >
                            <Form noValidate>
                                <div className="mb-6">
                                    <label className="block mb-2 font-semibold text-[#5A3726]">Mật khẩu mới</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <Field
                                            name="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            className={inputStyle(showFieldError(errors, touched, submitCount, "newPassword"))}
                                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {showFieldError(errors, touched, submitCount, "newPassword") && (
                                        <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold text-[#5A3726]">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <Field
                                            name="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            autoComplete="new-password"
                                            className={inputStyle(showFieldError(errors, touched, submitCount, "confirmPassword"))}
                                            placeholder="Nhập lại mật khẩu mới"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {showFieldError(errors, touched, submitCount, "confirmPassword") && (
                                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !otpToken}
                                    className="w-full h-14 mt-8 rounded-2xl bg-[#C89A63] hover:bg-[#B78350] hover:shadow-xl transition duration-300 text-white text-lg font-semibold disabled:opacity-70"
                                >
                                    {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
                                </button>

                                <div className="text-center mt-8">
                                    <Link
                                        to="/otp"
                                        state={{ email: location.state?.email }}
                                        className="inline-flex items-center gap-2 text-[#B78350] hover:underline"
                                    >
                                        <FaArrowLeft /> Quay lại
                                    </Link>
                                </div>
                            </Form>
                        </ValidationPopupWatcher>
                    )}
                </Formik>
            </AuthCard>

            <Popup
                open={popup.open}
                type={popup.type}
                title={popup.title}
                message={popup.message}
                onClose={handlePopupClose}
            />
        </>
    );
}

function ValidationPopupWatcher({ submitCount, errors, onShow, children }) {
    const lastShownSubmit = useRef(0);

    useEffect(() => {
        if (submitCount > lastShownSubmit.current && Object.keys(errors).length > 0) {
            lastShownSubmit.current = submitCount;
            onShow(Object.values(errors)[0]);
        }
    }, [submitCount, errors, onShow]);

    return children;
}
