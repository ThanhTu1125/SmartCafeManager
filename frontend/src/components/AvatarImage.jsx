import { useState } from "react";
import { FaUser } from "react-icons/fa";

export default function AvatarImage({ src, alt = "Avatar", className = "", size = "md" }) {
    const [hasError, setHasError] = useState(false);

    const sizeClass = size === "lg" ? "text-5xl" : size === "sm" ? "text-xl" : "text-3xl";

    if (src && !hasError) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                onError={() => setHasError(true)}
            />
        );
    }

    return (
        <div
            className={`flex items-center justify-center bg-[#EFE2D3] text-[#C89A63] ${sizeClass} ${className}`}
            aria-label={alt}
        >
            <FaUser />
        </div>
    );
}
