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
            whileHover={{ y: -2 }}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-primary/35"
        >
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-wider text-white/50">{title}</h3>

            <div className="mb-4 flex items-end gap-3">
                <span className="text-4xl font-bold tracking-tight text-white transition-colors group-hover:text-primary md:text-5xl">
                    {value}
                </span>
                {subtitle && (
                    <span className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                        {subtitle}
                    </span>
                )}
            </div>

            {trend && (
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold ${trend.positive
                            ? 'border border-primary/20 bg-primary/10 text-primary'
                            : 'border border-red-500/20 bg-red-500/10 text-red-500'
                        }`}>
                        <span>{trend.positive ? '↑' : '↓'}</span>
                        <span>{trend.value}%</span>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                        {trend.label}
                    </span>
                </div>
            )}
        </motion.div>
    );
}
