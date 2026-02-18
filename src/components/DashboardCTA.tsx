"use client";

import { useI18n } from "../i18n";
import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";

export function DashboardCTA() {
    const { t } = useI18n();

    return (
        <section className="py-32 bg-black relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="relative glass border-white/5 rounded-[48px] overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
                    {/* Immersive background glow */}
                    <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

                    {/* KEY: stretch so image side gets full panel height on desktop */}
                    <div className="flex flex-col lg:flex-row items-stretch">
                        {/* Content Side */}
                        <div className="lg:w-3/5 p-12 md:p-20 order-2 lg:order-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                                        <BarChart3 size={24} />
                                    </div>
                                    <span className="text-primary text-xs font-black uppercase tracking-[0.4em]">
                                        Analytics Engine
                                    </span>
                                </div>

                                <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black text-white mb-8 tracking-tight leading-none uppercase">
                                    {t.stats.title}
                                </h2>

                                <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed mb-12 max-w-xl">
                                    {t.stats.subtitle}
                                </p>

                                <div className="flex flex-wrap gap-6">
                                    <Link href="/login" className="group relative inline-flex items-center justify-center">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
                                        <div className="relative flex items-center bg-primary text-black font-black text-sm px-10 py-5 rounded-2xl transition-all duration-300 group-hover:scale-105 active:scale-95">
                                            <span className="tracking-widest uppercase">{t.stats.cta}</span>
                                            <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={20} />
                                        </div>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="
    hidden lg:block
    lg:w-2/5 relative overflow-hidden
    mt-12 lg:mt-0
    order-1 lg:order-2
    lg:min-h-0
  "
                        >
                            <img
                                src="/images/sections/dashboard_cta.png"
                                alt="Dashboard"
                                className="
    absolute bottom-0 left-1/2 -translate-x-1/2
    w-[165%] sm:w-[170%] lg:w-[180%]
    h-auto object-contain
    translate-y-10 md:translate-y-12 lg:translate-y-14
    pointer-events-none select-none
  "
                                style={{
                                    filter: "grayscale(100%) drop-shadow(0 0 40px rgba(31,192,88,0.35))"
                                }}
                            />

                        </motion.div>

                    </div>
                </div>
            </div>
        </section>
    );
}
