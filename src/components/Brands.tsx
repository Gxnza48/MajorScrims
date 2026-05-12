"use client";

import { useI18n } from "../i18n";
import { motion } from "framer-motion";

const brands = [
    {
        key: "twitch" as const,
        name: "Twitch",
        logo: "https://m.media-amazon.com/images/I/21kRx-CJsUL.png",
        color: "#9146FF",
        rgb: "145, 70, 255",
        bg: "from-[#9146FF]/20 to-[#6441a5]/10",
        border: "border-[#9146FF]/30",
        hoverBorder: "hover:border-[#9146FF]/60",
    },
    {
        key: "fortnite" as const,
        name: "Fortnite",
        logo: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Fortnite_F_lettermark_logo.png",
        color: "#00C7E4",
        rgb: "0, 199, 228",
        bg: "from-[#00C7E4]/20 to-[#0099b8]/10",
        border: "border-[#00C7E4]/30",
        hoverBorder: "hover:border-[#00C7E4]/60",
    },
];

export function Brands() {
    const { t } = useI18n();

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,217,98,0.04)_0%,_transparent_70%)] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Discord</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 tracking-tight">
                        {t.brands.title}
                    </h2>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        {t.brands.subtitle}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                    {brands.map((brand, i) => (
                        <motion.div
                            key={brand.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.15 }}
                            className={`relative rounded-3xl bg-gradient-to-br ${brand.bg} border ${brand.border} ${brand.hoverBorder} p-8 md:p-10 overflow-hidden group transition-all duration-300 hover:scale-[1.02]`}
                        >
                            <div
                                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -mr-20 -mt-20 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                                style={{ backgroundColor: brand.color }}
                            />

                            <div className="flex items-start gap-6 relative z-10">
                                <div
                                    className="w-16 h-16 flex-shrink-0 p-2.5 rounded-2xl flex items-center justify-center"
                                    style={{
                                        backgroundColor: `rgba(${brand.rgb}, 0.12)`,
                                        border: `1px solid rgba(${brand.rgb}, 0.3)`,
                                    }}
                                >
                                    <img
                                        src={brand.logo}
                                        alt={brand.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="text-2xl font-heading font-black text-white tracking-tight">
                                            {brand.name}
                                        </h3>
                                        <span
                                            className="text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full"
                                            style={{
                                                backgroundColor: `rgba(${brand.rgb}, 0.15)`,
                                                color: brand.color,
                                                border: `1px solid rgba(${brand.rgb}, 0.2)`,
                                            }}
                                        >
                                            {t.brands.partner}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                        {brand.key === "twitch" ? t.brands.twitchDesc : t.brands.fortniteDesc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
