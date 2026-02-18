"use client";

import { useI18n } from "../i18n";
import { motion } from "framer-motion";

export function About() {
    const { t } = useI18n();

    return (
        <section id="about" className="py-32 bg-black relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -ml-48 -mb-48 pointer-events-none" />

            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-start gap-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-3/5"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-1.5 rounded-full glass border-primary/20 mb-6"
                        >
                            <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Our Story</span>
                        </motion.div>

                        <h2 className="text-5xl md:text-6xl font-heading font-black mb-8 text-white leading-tight">
                            {t.about.title} <span className="text-primary text-glow">.</span>
                        </h2>

                        <p className="text-lg md:text-xl text-gray-400 leading-relaxed font-medium mb-12 max-w-2xl">
                            {t.about.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-3xl glass border-white/5 relative group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <h3 className="text-5xl font-black text-primary mb-2 tracking-tight">7k+</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Members</p>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-3xl glass border-white/5 relative group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <h3 className="text-5xl font-black text-primary mb-2 tracking-tight">24/7</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Dynamic Activity</p>
                            </motion.div>
                        </div>

                        <div className="pt-12 border-t border-white/10">
                            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] mb-10">Leadership</h4>
                            <div className="flex flex-wrap gap-12">
                                {/* Blxckoutz */}
                                <a href="https://x.com/blxckoutz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110" />
                                        <div className="relative w-20 h-20">
                                            <img src="/images/avatars/blxckoutz.png" alt="Blxckoutz" className="w-full h-full rounded-2xl border-2 border-white/10 group-hover:border-primary transition-all duration-500 object-cover relative z-10" />
                                            <div className="absolute -bottom-2 -right-2 bg-black rounded-lg p-1 z-20 shadow-xl border border-white/10">
                                                <img src="/images/flags/br.png" alt="Brazil" className="w-6 h-auto rounded-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-heading font-black text-xl text-white group-hover:text-primary transition-colors tracking-tight">@BLXCKOUTZ</span>
                                            <img src="/images/icons/verified.png" alt="Verified" className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                                        </div>
                                        <span className="text-xs font-black text-gray-500 group-hover:text-gray-400 transition-colors uppercase tracking-widest">Co-Owner</span>
                                    </div>
                                </a>

                                {/* Gorilon */}
                                <a href="https://x.com/gorilonfn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110" />
                                        <div className="relative w-20 h-20">
                                            <img src="/images/avatars/gorilon.jpg" alt="Gorilon" className="w-full h-full rounded-2xl border-2 border-white/10 group-hover:border-primary transition-all duration-500 object-cover relative z-10" />
                                            <div className="absolute -bottom-2 -right-2 bg-black rounded-lg p-1 z-20 shadow-xl border border-white/10">
                                                <img src="/images/flags/ar.png" alt="Argentina" className="w-6 h-auto rounded-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-heading font-black text-xl text-white group-hover:text-primary transition-colors tracking-tight">@GORILONFN</span>
                                            <img src="/images/icons/verified.png" alt="Verified" className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                                        </div>
                                        <span className="text-xs font-black text-gray-500 group-hover:text-gray-400 transition-colors uppercase tracking-widest">Co-Owner</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="lg:w-2/5 relative"
                    >
                        <div className="relative aspect-square flex items-center justify-center glass rounded-[40px] border-white/10 overflow-hidden shadow-2xl group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <img src="/images/hero_text_logo.png" alt="Major Scrims Logo" className="w-2/3 opacity-20 group-hover:opacity-60 transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-110" />

                            {/* Decorative corner elements */}
                            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-xl" />
                            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-xl" />
                            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-primary/30 rounded-bl-xl" />
                            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-xl" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
