import logo from "../assets/logo.svg";

export { logo };
export const VIETNAM_PHONE_REGEX = /^(0|\+84)[35789][0-9]{8}$/;

export const normalizePhone = (phone = "") => phone.replace(/\s/g, "");
