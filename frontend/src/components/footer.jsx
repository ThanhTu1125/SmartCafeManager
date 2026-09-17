import React from "react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-[#333333] text-gray-300 py-10">
      <div className="container mx-auto px-6">
        <Logo className="h-16 w-16" />

        <div className="space-y-3">
          <p>Chấp nhận : Visa, MasterCard, Vouchers</p>
          <p>Phí giao dịch áp dụng cho thẻ tín dụng</p>
          {/* Đã bỏ font-semibold và text-white ở đây */}
          <p className="mt-4">Hotline/Số điện thoại: 19001900</p>
          <p className="max-w-md">
            Địa chỉ quán: Số 1 đường Võ Văn Ngân, phường Thủ Đức, Thành Phố Hồ
            Chí Minh
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
