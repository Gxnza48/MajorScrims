"use client";

import { useI18n } from "../i18n";
import { motion } from "framer-motion";

export function Hero() {
    const { t } = useI18n();

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] md:w-[800px] md:h-[800px] bg-primary opacity-[0.15] blur-[150px] md:blur-[200px] rounded-full pointer-events-none animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

                {/* Floating Elements for depth */}
                <motion.div
                    animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 blur-3xl rounded-full"
                />
                <motion.div
                    animate={{ y: [0, 20, 0], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/10 blur-3xl rounded-full"
                />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="inline-flex items-center gap-3 mb-10 px-4 py-1.5 rounded-2xl glass border-primary/20 mx-auto group hover:border-primary/40 transition-colors"
                    >
                        <div className="relative">
                            <img src="/images/flags/br.png" alt="Brazil" className="w-5 h-auto rounded-sm relative z-10" />
                            <div className="absolute inset-0 bg-primary/40 blur-sm rounded-sm animate-pulse"></div>
                        </div>
                        <span className="text-primary text-[11px] font-black tracking-[0.2em] uppercase">Professional Practice</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, filter: "blur(10px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="mb-10 flex justify-center"
                    >
                        <img
                            src="/images/logo_hero_main.png"
                            alt="MAJOR SCRIMS"
                            className="h-28 md:h-40 w-auto object-contain drop-shadow-[0_0_35px_rgba(31,192,88,0.4)] transition-transform duration-700 hover:scale-105"
                        />
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed tracking-tight"
                    >
                        {t.hero.subtitle}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="flex justify-center"
                    >
                        <a
                            href="https://discord.com/invite/majorscrims"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center justify-center"
                        >
                            {/* Glow effect behind button */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

                            <div className="relative flex items-center bg-primary text-black font-black text-xs md:text-sm px-10 py-5 rounded-2xl transition-all duration-300 group-hover:bg-[#15D166] group-hover:scale-105 active:scale-95 shadow-[0_10px_30px_-10px_rgba(31,192,88,0.5)] overflow-hidden">
                                <span className="relative z-10 tracking-[0.15em] uppercase">{t.hero.cta}</span>
                                <div className="ml-4 p-1.5 bg-black/10 rounded-lg group-hover:translate-x-1 transition-transform">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="18"
                                        height="18"
                                        className="text-black"
                                    >
                                        <path fill="currentColor" d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"></path>
                                    </svg>
                                </div>
                            </div>
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
