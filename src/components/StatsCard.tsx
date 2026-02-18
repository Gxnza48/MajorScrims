import { motion } from "framer-motion";

export function StatsCard({
    title,
    value,
    subtitle,
    trend
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: { value: number; label: string; positive: boolean };
}) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass border-white/5 p-8 rounded-[32px] relative group overflow-hidden transition-all duration-500 hover:border-primary/30"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

            <h3 className="text-gray-500 text-xs font-black uppercase tracking-[0.3em] mb-6 relative z-10">{title}</h3>

            <div className="flex items-end gap-3 mb-4 relative z-10">
                <span className="text-4xl md:text-5xl font-heading font-black text-white group-hover:text-primary transition-colors tracking-tight">
                    {value}
                </span>
                {subtitle && (
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                        {subtitle}
                    </span>
                )}
            </div>

            {trend && (
                <div className="flex items-center gap-2 relative z-10">
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 ${trend.positive
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                        <span>{trend.positive ? '↑' : '↓'}</span>
                        <span>{trend.value}%</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        {trend.label}
                    </span>
                </div>
            )}

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-primary/30 transition-all" />
        </motion.div>
    );
}
