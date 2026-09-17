import { toast } from "react-toastify";

/** Toast helpers — dùng chung, không thay Popup/alert cũ. */
export const notifySuccess = (message) => {
  toast.success(message, { autoClose: 2800 });
};

export const notifyError = (message) => {
  toast.error(message || "Đã có lỗi xảy ra.", { autoClose: 4000 });
};

export const notifyInfo = (message) => {
  toast.info(message, { autoClose: 3000 });
};

export const notifyWarn = (message) => {
  toast.warn(message, { autoClose: 3500 });
};
