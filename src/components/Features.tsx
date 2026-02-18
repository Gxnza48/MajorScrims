"use client";

import { useI18n } from "../i18n";
import { motion } from "framer-motion";
import { Trophy, Crosshair, Scale, Shield } from "lucide-react";

export function Features() {
    const { t } = useI18n();

    const features = [
        {
            icon: <Trophy size={40} className="text-[#1FC058]" />,
            title: t.features.scrims,
            desc: t.features.scrimsDesc,
        },
        {
            icon: <Crosshair size={40} className="text-[#1FC058]" />,
            title: t.features.customs,
            desc: t.features.customsDesc,
        },
        {
            icon: <Scale size={40} className="text-[#1FC058]" />,
            title: t.features.rules,
            desc: t.features.rulesDesc,
        },
        {
            icon: <Shield size={40} className="text-[#1FC058]" />,
            title: t.features.moderation,
            desc: t.features.moderationDesc,
        },
    ];

    return (
        <section id="features" className="py-32 bg-black relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -ml-48 pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full glass border-primary/20 mb-6"
                    >
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Excellence</span>
                    </motion.div>
                    <h2 className="text-5xl md:text-6xl font-heading font-black text-white mb-8 tracking-tight">
                        {t.features.title}
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Experience the gold standard in competitive gaming infrastructure. Built by pros, for pros.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            whileHover={{ y: -8 }}
                            className="p-10 rounded-[32px] glass border-white/5 hover:border-primary/40 hover:bg-white/[0.05] transition-all duration-500 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="mb-8 p-5 rounded-2xl bg-black/40 w-fit border border-white/10 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(31,192,88,0.3)] transition-all duration-500 transform group-hover:scale-110">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-heading font-black text-white mb-4 group-hover:text-primary transition-colors tracking-tight uppercase">
                                {feature.title}
                            </h3>
                            <p className="text-gray-400 text-[15px] leading-relaxed font-medium">
                                {feature.desc}
                            </p>

                            {/* Decorative corner accent */}
                            <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-white/10 group-hover:bg-primary transition-colors" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
