"use client";

import { useI18n } from "../i18n";
import { motion } from "framer-motion";

export function Community() {
    const { t } = useI18n();

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -ml-64 pointer-events-none" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -mr-48 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* IMPORTANTE: overflow-visible para que la imagen pueda "tocar" y sobresalir un poco */}
                <div className="glass border-white/5 rounded-[40px] overflow-hidden p-8 md:p-0">
                    <div className="flex flex-col md:flex-row items-center">
                        {/* Image Side - Hidden on mobile */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="hidden md:flex md:w-1/2 relative justify-center items-end order-2 md:order-1"
                        >
                            <img
                                src="/images/sections/community.png"
                                alt="Community"
                                className="
                  w-[115%] md:w-[120%] h-auto object-contain
                  -translate-x-6 md:-translate-x-14
                  translate-y-6 md:translate-y-12
                  drop-shadow-[0_-10px_30px_rgba(31,192,88,0.12)]
                  grayscale transition-all duration-1000
                "
                            />
                        </motion.div>

                        {/* Content Side */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="md:w-1/2 p-12 md:p-20 order-1 md:order-2"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="inline-block px-4 py-1.5 rounded-full glass border-primary/20 mb-8"
                            >
                                <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                                    Join the Squad
                                </span>
                            </motion.div>

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-8 tracking-tight leading-tight uppercase">
                                {t.community.title}
                            </h2>

                            <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed mb-12">
                                {t.community.description}
                            </p>

                            <motion.a
                                href="https://discord.com/invite/majorscrims"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center justify-center bg-primary text-black font-black py-5 px-10 rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(31,192,88,0.5)] group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative z-10 tracking-[0.1em] uppercase text-sm">
                                    {t.community.cta}
                                </span>
                                <div className="ml-4 p-1 bg-black/10 rounded-lg group-hover:translate-x-1 transition-transform relative z-10">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="18"
                                        height="18"
                                        className="text-black"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                                        />
                                    </svg>
                                </div>
                            </motion.a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
