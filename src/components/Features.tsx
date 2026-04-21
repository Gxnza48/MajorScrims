"use client";

import { useI18n } from "../i18n";
import { motion } from "framer-motion";
import { Trophy, Crosshair, Scale, Shield, ArrowUpRight, Plus, Sparkles } from "lucide-react";

export function Features() {
    const { t } = useI18n();

    return (
        <section id="features" className="py-32 bg-black relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -ml-32 pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -mr-32 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 mb-8"
                    >
                        <Sparkles size={12} className="text-primary" />
                        <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em]">Excellence</span>
                    </motion.div>
                    <h2 className="text-5xl md:text-6xl font-heading font-black text-white mb-6 tracking-tight">
                        {t.features.title} <span className="text-primary drop-shadow-[0_0_15px_rgba(13,255,81,0.5)]">.</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Experience the gold standard in competitive gaming infrastructure. Built by pros, for pros.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
                    
                    {/* Feature 1: Scrims (Large 2x2) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="col-span-1 md:col-span-2 md:row-span-2 group relative rounded-[32px] overflow-hidden glass border-white/5 hover:border-primary/40 transition-all duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full translate-y-12 translate-x-12 opacity-0 group-hover:opacity-100 transition-all duration-700" />

                        <div className="h-full flex flex-col justify-end p-10 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary mb-auto group-hover:-translate-y-2 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(31,192,88,0.3)] transition-all duration-500">
                                <Trophy size={32} strokeWidth={1.5} />
                            </div>
                            
                            <h3 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 group-hover:text-primary transition-colors tracking-tight uppercase mt-12">
                                {t.features.scrims}
                            </h3>
                            <p className="text-gray-400 text-lg leading-relaxed font-medium max-w-md">
                                {t.features.scrimsDesc}
                            </p>
                        </div>
                        
                        {/* Decals */}
                        <Plus className="absolute top-8 right-8 text-white/20 group-hover:text-primary/50 transition-colors" size={24} />
                        <div className="absolute bottom-8 right-8 group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform duration-500">
                            <ArrowUpRight className="text-primary opacity-0 group-hover:opacity-100" size={32} />
                        </div>
                    </motion.div>

                    {/* Feature 2: Customs (Wide 2x1) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="col-span-1 md:col-span-2 row-span-1 group relative rounded-[32px] overflow-hidden glass border-white/5 hover:border-primary/30 transition-all duration-500 flex flex-col justify-center p-10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex-shrink-0 flex items-center justify-center text-primary group-hover:rotate-12 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(31,192,88,0.2)] transition-all duration-500">
                                <Crosshair size={32} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-heading font-black text-white mb-3 group-hover:text-primary transition-colors tracking-tight uppercase">
                                    {t.features.customs}
                                </h3>
                                <p className="text-gray-400 text-base leading-relaxed font-medium">
                                    {t.features.customsDesc}
                                </p>
                            </div>
                        </div>
                        
                        <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-white/10 group-hover:bg-primary transition-colors hover:shadow-[0_0_10px_rgba(31,192,88,1)]" />
                    </motion.div>

                    {/* Feature 3: Rules (Square 1x1) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="col-span-1 md:col-span-1 row-span-1 group relative rounded-[32px] overflow-hidden glass border-white/5 hover:border-primary/30 transition-all duration-500 p-8 flex flex-col"
                    >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary mb-auto group-hover:-translate-y-2 group-hover:border-primary/50 transition-all duration-500">
                                <Scale size={24} strokeWidth={1.5} />
                            </div>
                            
                            <h3 className="text-xl font-heading font-black text-white mb-3 group-hover:text-primary transition-colors tracking-tight uppercase mt-8">
                                {t.features.rules}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-3">
                                {t.features.rulesDesc}
                            </p>
                        </div>
                    </motion.div>

                    {/* Feature 4: Moderation (Square 1x1) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="col-span-1 md:col-span-1 row-span-1 group relative rounded-[32px] overflow-hidden glass border-white/5 hover:border-primary/30 transition-all duration-500 p-8 flex flex-col"
                    >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 pointer-events-none">
                            <Shield size={140} strokeWidth={1} className="text-primary" />
                        </div>

                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary mb-auto group-hover:-translate-y-2 group-hover:border-primary/50 transition-all duration-500">
                                <Shield size={24} strokeWidth={1.5} />
                            </div>
                            
                            <h3 className="text-xl font-heading font-black text-white mb-3 group-hover:text-primary transition-colors tracking-tight uppercase mt-8">
                                {t.features.moderation}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-3">
                                {t.features.moderationDesc}
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
