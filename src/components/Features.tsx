"use client";

import { useI18n } from "../i18n";
import { motion, Variants } from "framer-motion";
import { Trophy, Crosshair, Scale, Shield, Sparkles, ArrowRight } from "lucide-react";

export function Features() {
    const { t } = useI18n();

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    return (
        <section id="features" className="py-32 bg-[#050505] relative overflow-hidden">
            {/* Soft Ambient Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-primary/0 to-transparent pointer-events-none opacity-60" />
            
            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                {/* Advanced Header */}
                <div className="flex flex-col items-center text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-2xl"
                    >
                        <Sparkles size={14} className="text-primary animate-pulse" />
                        <span className="text-white/80 text-[11px] font-bold uppercase tracking-[0.25em]">Premium Experience</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 mb-6 tracking-tighter"
                    >
                        {t.features.title}
                    </motion.h2>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-400/90 max-w-2xl font-medium leading-relaxed"
                    >
                        Built for champions. Experience the gold standard in competitive gaming infrastructure with unparalleled precision and clarity.
                    </motion.p>
                </div>

                {/* Sleek Masonry/Bento Grid Layout */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-8"
                >
                    {/* Feature 1: Scrims (Large Block) */}
                    <motion.div variants={itemVariants} className="md:col-span-8 group relative rounded-[2rem] overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors duration-500 min-h-[400px] flex items-end p-8 md:p-12">
                        {/* Hover Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                        
                        {/* Abstract Background Element */}
                        <div className="absolute top-0 right-0 w-3/4 h-full bg-primary/5 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/4 group-hover:bg-primary/10 transition-colors duration-700" />
                        
                        <div className="relative z-20 w-full max-w-lg">
                            <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 flex flex-col items-center justify-center text-primary mb-8 shadow-[0_0_40px_rgba(31,192,88,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(31,192,88,0.3)] transition-all duration-500">
                                <Trophy size={28} strokeWidth={1.5} />
                            </div>
                            
                            <h3 className="text-3xl md:text-5xl font-heading font-black text-white mb-4 tracking-tight leading-none group-hover:text-primary transition-colors duration-300">
                                {t.features.scrims}
                            </h3>
                            <p className="text-white/60 text-lg leading-relaxed font-medium">
                                {t.features.scrimsDesc}
                            </p>
                        </div>

                        <div className="absolute top-10 right-10 w-12 h-12 rounded-full border border-white/10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 z-20 bg-white/5 backdrop-blur-sm">
                            <ArrowRight size={20} className="text-white" />
                        </div>
                    </motion.div>

                    {/* Feature 2: Customs (Tall Block) */}
                    <motion.div variants={itemVariants} className="md:col-span-4 group relative rounded-[2rem] overflow-hidden bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all duration-500 min-h-[400px] flex flex-col p-8 md:p-10">
                        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white mb-8 group-hover:text-primary group-hover:border-primary/30 group-hover:-translate-y-1 transition-all duration-300 relative z-10">
                            <Crosshair size={26} strokeWidth={1.5} />
                        </div>
                        
                        <div className="mt-auto relative z-10">
                            <h3 className="text-2xl font-heading font-black text-white mb-3 tracking-tight">
                                {t.features.customs}
                            </h3>
                            <p className="text-white/50 text-base leading-relaxed font-medium">
                                {t.features.customsDesc}
                            </p>
                        </div>
                    </motion.div>

                    {/* Feature 3: Rules (Square Block) */}
                    <motion.div variants={itemVariants} className="md:col-span-6 group relative rounded-[2rem] overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors duration-500 p-8 md:p-10 flex gap-6 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white flex-shrink-0 group-hover:bg-white/10 transition-colors duration-300">
                            <Scale size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-heading font-black text-white mb-2 tracking-tight">
                                {t.features.rules}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed font-medium">
                                {t.features.rulesDesc}
                            </p>
                        </div>
                    </motion.div>

                    {/* Feature 4: Moderation (Square Block) */}
                    <motion.div variants={itemVariants} className="md:col-span-6 group relative rounded-[2rem] overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors duration-500 p-8 md:p-10 flex gap-6 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white flex-shrink-0 group-hover:bg-white/10 transition-colors duration-300">
                            <Shield size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-heading font-black text-white mb-2 tracking-tight">
                                {t.features.moderation}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed font-medium">
                                {t.features.moderationDesc}
                            </p>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    );
}
