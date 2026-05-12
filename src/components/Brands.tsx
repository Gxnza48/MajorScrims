"use client";

import { useI18n } from "../i18n";
import { motion } from "framer-motion";

const TwitchLogo = () => (
    <svg viewBox="0 0 24 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M2.149 0L0.537 4.119V22.966H5.633V25.885H8.552L11.465 22.966H15.949L21.919 16.996V0H2.149ZM19.77 15.896L16.398 19.267H10.904L7.991 22.18V19.267H3.506V2.148H19.77V15.896ZM16.398 8.168V14.797H14.25V8.168H16.398ZM10.901 8.168V14.797H8.753V8.168H10.901Z" />
    </svg>
);

const FortniteLogo = () => (
    <svg viewBox="0 0 60 70" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M5 0H55L60 10V55L30 70L0 55V10L5 0ZM10 12V52L30 62L50 52V12H10ZM15 18H45V28H32V35H44V45H32V58H15V18Z" />
    </svg>
);

const brands = [
    {
        key: "twitch" as const,
        name: "Twitch",
        Icon: TwitchLogo,
        color: "#9146FF",
        rgb: "145, 70, 255",
        bg: "from-[#9146FF]/20 to-[#6441a5]/10",
        border: "border-[#9146FF]/30",
        hoverBorder: "hover:border-[#9146FF]/60",
    },
    {
        key: "fortnite" as const,
        name: "Fortnite",
        Icon: FortniteLogo,
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
                                    className="w-16 h-16 flex-shrink-0 p-3 rounded-2xl"
                                    style={{
                                        backgroundColor: `rgba(${brand.rgb}, 0.15)`,
                                        color: brand.color,
                                        border: `1px solid rgba(${brand.rgb}, 0.3)`,
                                    }}
                                >
                                    <brand.Icon />
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
