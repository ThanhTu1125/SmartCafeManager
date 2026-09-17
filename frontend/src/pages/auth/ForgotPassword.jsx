import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { forgotPassword, getApiErrorMessage } from "../../services/apiService";
import AuthCard from "../../components/AuthCard";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        setErrorMsg("");
        if (!email) {
            setErrorMsg("Vui lòng nhập email.");
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(email);
            navigate("/otp", { state: { email } });
        } catch (err) {
            setErrorMsg(getApiErrorMessage(err, "Không thể gửi mã OTP."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Quên mật khẩu"
            subtitle="Nhập email đã đăng ký để nhận mã OTP đặt lại mật khẩu."
        >
            {errorMsg && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm">
                    {errorMsg}
                </div>
            )}

            <div>
                <label className="block mb-2 font-semibold text-[#5A3726]">Email</label>
                <div className="relative">
                    <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email"
                        className="w-full h-14 rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] pl-14 pr-5 outline-none transition focus:bg-white focus:border-[#C89A63] focus:ring-4 focus:ring-[#C89A63]/20"
                    />
                </div>
            </div>

            <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full h-14 mt-8 rounded-2xl bg-[#C89A63] text-white text-lg font-semibold transition duration-300 hover:bg-[#B78350] hover:shadow-xl hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? "Đang gửi..." : "Gửi mã OTP"}
            </button>

            <div className="mt-8 text-center">
                <Link to="/" className="inline-flex items-center gap-2 text-[#B78350] font-medium hover:underline">
                    <FaArrowLeft /> Quay lại đăng nhập
                </Link>
            </div>
        </AuthCard>
    );
}
