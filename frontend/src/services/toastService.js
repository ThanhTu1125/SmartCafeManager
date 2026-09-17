import { toast } from 'react-toastify';

// Cấu hình mặc định chuẩn chỉ cho toàn hệ thống
const defaultOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored", // Nhất quán 1 theme
};

export const ToastService = {
    success: (message, options = {}) => {
        toast.success(message, { ...defaultOptions, ...options });
    },
    error: (message, options = {}) => {
        toast.error(message, { ...defaultOptions, ...options });
    },
    info: (message, options = {}) => {
        toast.info(message, { ...defaultOptions, ...options });
    },
    warning: (message, options = {}) => {
        toast.warning(message, { ...defaultOptions, ...options });
    }
};
