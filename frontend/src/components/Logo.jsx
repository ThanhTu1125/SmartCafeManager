const BRAND_BROWN = "#5A3726";
const BRAND_TAN = "#C89A63";

function LogoMark({ className = "h-12 w-12" }) {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            role="img"
            aria-hidden="true"
        >
            <circle cx="60" cy="60" r="56" fill={BRAND_TAN} />
            <path
                d="M34 78V46C34 40.4772 38.4772 36 44 36H72C77.5228 36 82 40.4772 82 46V78"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
            />
            <path d="M28 78H88" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
            <path
                d="M82 52H90C95.5228 52 100 56.4772 100 62V66C100 71.5228 95.5228 76 90 76H82"
                stroke={BRAND_BROWN}
                strokeWidth="5"
                strokeLinecap="round"
            />
            <path
                d="M48 28C48 28 52 22 60 22C68 22 72 28 72 28"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.95"
            />
            <circle cx="48" cy="58" r="4" fill={BRAND_BROWN} />
            <circle cx="60" cy="52" r="4" fill={BRAND_BROWN} />
            <circle cx="72" cy="58" r="4" fill={BRAND_BROWN} />
        </svg>
    );
}

export default function Logo({
    className = "h-12 w-12",
    showText = false,
    iconClassName = "h-20 w-20",
}) {
    if (!showText) {
        return <LogoMark className={className} />;
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <LogoMark className={`shrink-0 ${iconClassName}`} />
            <div className="text-center">
                <p className="text-2xl font-bold tracking-wide text-[#5A3726]">Smart Cafe</p>
                <p className="mt-1 text-xs tracking-[0.18em] text-[#B78350] uppercase">
                    Coffee · Smart · Simple
                </p>
            </div>
        </div>
    );
}
