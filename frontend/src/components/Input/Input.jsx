export default function Input({
    label,
    placeholder,
    type = "text",
}) {
    return (
        <div className="mb-6">

            <label className="font-semibold text-[#5D4037]">
                {label}
            </label>

            <input
                type={type}
                placeholder={placeholder}
                className="
                mt-2
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                outline-none
                focus:border-[#C69A6B]
                "
            />

        </div>
    );
}