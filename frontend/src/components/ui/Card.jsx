export default function Card({ children }) {
    return (
        <div className="bg-[#07101f] rounded-2xl p-4 h-64 shadow-xl flex items-center justify-center">
            {children}
        </div>
    )
}
