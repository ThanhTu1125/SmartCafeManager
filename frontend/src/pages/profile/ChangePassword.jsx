import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import { FaLock, FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import { changePassword, getApiErrorMessage } from "../../services/apiService";
import { changePasswordSchema } from "../../validation/profileSchemas";
import Popup from "../../components/Popup";
import Logo from "../../components/Logo";
import MenuButton from "../../components/menu-button";
import { getHomePath } from "../../utils/authRedirect";

const initialValues = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const showFieldError = (errors, touched, submitCount, field) =>
  errors[field] && (touched[field] || submitCount > 0);

export default function ChangePassword() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [popup, setPopup] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
  });
  const navigate = useNavigate();

  const handlePopupClose = () => {
    const shouldLogout =
      popup.type === "success" ||
      popup.message.includes("Phiên đăng nhập") ||
      popup.message.includes("đăng nhập để");
    setPopup((prev) => ({ ...prev, open: false }));
    if (shouldLogout) {
      localStorage.clear();
      navigate("/");
    }
  };

  const showValidationPopup = useCallback((message) => {
    setPopup({
      open: true,
      type: "warning",
      title: "Vui lòng kiểm tra lại",
      message,
    });
  }, []);

  const inputStyle = (hasError) =>
    `w-full h-12 md:h-14 rounded-2xl border ${hasError ? "border-red-400" : "border-amber-900/15"} bg-[#FAF8F5] focus:bg-white pl-12 pr-12 outline-none focus:border-[#C89A63] focus:ring-4 focus:ring-[#C89A63]/20 text-xs md:text-sm transition-all`;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-['Inter',sans-serif] pb-16">
      <header className="sticky top-0 z-30 bg-[#D2A97B] shadow-sm px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MenuButton />
            <Link
              to={getHomePath()}
              className="flex items-center gap-2 no-underline text-inherit"
              title="Trang chủ"
            >
              <Logo className="h-9 w-9" />
              <div className="text-lg font-['Inter'] leading-none">
                <span className="font-bold text-[#000]">NEO</span>
                <span className="font-normal text-[#000]">CAFÉ</span>
              </div>
            </Link>
          </div>
          <div style={{ width: "40px" }} />
        </div>
      </header>

      <div className="max-w-xl mx-auto py-8 px-4 w-full flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl shadow-sm border border-amber-900/10 p-6 md:p-10">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#2E1F14]">
                Đổi mật khẩu
              </h1>
            </div>
            <Link
              to="/profile"
              className="px-5 py-2 rounded-full bg-[#FAF4EC] hover:bg-[#F3EAD8] text-[#5C4033] font-semibold text-xs border border-amber-900/10 transition-all shadow-xs whitespace-nowrap min-w-max flex items-center justify-center cursor-pointer"
            >
              ← Quay lại
            </Link>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={changePasswordSchema}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              if (!localStorage.getItem("token")) {
                setPopup({
                  open: true,
                  type: "error",
                  title: "Chưa đăng nhập",
                  message: "Vui lòng đăng nhập để đổi mật khẩu.",
                });
                setSubmitting(false);
                return;
              }

              setSubmitting(true);
              try {
                await changePassword(values.oldPassword, values.newPassword);
                resetForm();
                setPopup({
                  open: true,
                  type: "success",
                  title: "Thành công",
                  message: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
                });
              } catch (err) {
                const status = err?.response?.status;
                if (status === 401 || status === 403) {
                  setPopup({
                    open: true,
                    type: "error",
                    title: "Phiên đăng nhập hết hạn",
                    message:
                      "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
                  });
                  return;
                }
                setPopup({
                  open: true,
                  type: "error",
                  title: "Đổi mật khẩu thất bại",
                  message: getApiErrorMessage(err, "Đổi mật khẩu thất bại."),
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
                    <label className="block mb-2 font-semibold text-[#5A3726]">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Field
                        name="oldPassword"
                        type={showOld ? "text" : "password"}
                        className={inputStyle(
                          showFieldError(
                            errors,
                            touched,
                            submitCount,
                            "oldPassword",
                          ),
                        )}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOld(!showOld)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showOld ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {showFieldError(
                      errors,
                      touched,
                      submitCount,
                      "oldPassword",
                    ) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.oldPassword}
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block mb-2 font-semibold text-[#5A3726]">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Field
                        name="newPassword"
                        type={showNew ? "text" : "password"}
                        className={inputStyle(
                          showFieldError(
                            errors,
                            touched,
                            submitCount,
                            "newPassword",
                          ),
                        )}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showNew ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {showFieldError(
                      errors,
                      touched,
                      submitCount,
                      "newPassword",
                    ) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block mb-2 font-semibold text-[#5A3726]">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Field
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        className={inputStyle(
                          showFieldError(
                            errors,
                            touched,
                            submitCount,
                            "confirmPassword",
                          ),
                        )}
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
                    {showFieldError(
                      errors,
                      touched,
                      submitCount,
                      "confirmPassword",
                    ) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-5 mt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-14 rounded-2xl bg-[#C89A63] text-white font-semibold hover:bg-[#B78350] transition disabled:opacity-70"
                    >
                      {isSubmitting ? "Đang lưu..." : "Cập nhật"}
                    </button>
                    <Link
                      to="/profile"
                      className="h-14 rounded-2xl border-2 border-[#C89A63] text-[#C89A63] flex items-center justify-center font-semibold hover:bg-[#FFF7EF]"
                    >
                      Hủy
                    </Link>
                  </div>
                </Form>
              </ValidationPopupWatcher>
            )}
          </Formik>
        </div>
      </div>

      <Popup
        open={popup.open}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={handlePopupClose}
      />
    </div>
  );
}

function ValidationPopupWatcher({ submitCount, errors, onShow, children }) {
  const lastShownSubmit = useRef(0);

  useEffect(() => {
    if (
      submitCount > lastShownSubmit.current &&
      Object.keys(errors).length > 0
    ) {
      lastShownSubmit.current = submitCount;
      onShow(Object.values(errors)[0]);
    }
  }, [submitCount, errors, onShow]);

  return children;
}
