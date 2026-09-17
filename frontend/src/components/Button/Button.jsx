export default function Button({ children }) {
    return (
        <button
            className="
            w-full
            py-3
            rounded-xl
            bg-[#C69A6B]
            text-white
            font-semibold
            hover:bg-[#B5835A]
            duration-300
            "
        >
            {children}
        </button>
    );
}