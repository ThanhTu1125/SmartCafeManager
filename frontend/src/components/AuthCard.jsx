import Logo from "./Logo";

export default function AuthCard({ title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8F4EF] to-[#EFE2D3] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[36px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden px-10 py-12">
                <div className="flex justify-center mb-8">
                    <Logo showText iconClassName="h-24 w-24" />
                </div>

                <h1 className="text-3xl font-bold text-[#5A3726] text-center">{title}</h1>
                {subtitle && (
                    <p className="text-gray-400 mt-2 mb-6 text-center leading-relaxed">{subtitle}</p>
                )}

                {children}
            </div>
        </div>
    );
}
