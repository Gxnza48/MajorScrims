"use client";

import { useI18n } from "../i18n";
import { motion, useInView, useMotionValue, useTransform, animate, useSpring, MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import { Users, Activity, ShieldCheck, Trophy } from "lucide-react";

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        if (inView) {
            animate(count, value, { duration: 2.5, ease: [0.22, 1, 0.36, 1] });
        }
    }, [count, inView, value]);

    return (
        <span ref={ref} className="flex items-center">
            <motion.span>{rounded}</motion.span>
            <span>{suffix}</span>
        </span>
    );
}

function TiltLogo({ mouseX, mouseY }: { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
    const springConfig = { damping: 25, stiffness: 250 };
    const xSpring = useSpring(mouseX, springConfig);
    const ySpring = useSpring(mouseY, springConfig);

    const rotateX = useTransform(ySpring, [0, 1], [20, -20]);
    const rotateY = useTransform(xSpring, [0, 1], [-20, 20]);

    return (
        <div 
            className="relative flex items-center justify-center w-full h-full overflow-visible"
            style={{ perspective: 1200 }}
        >
            <motion.div 
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="w-full flex items-center justify-center pointer-events-none"
            >
                <img 
                    src="/images/hero_text_logo.png" 
                    alt="Major Scrims Logo" 
                    className="w-[85%] drop-shadow-[0_0_40px_rgba(13,255,81,0.25)] transition-transform duration-300"
                    style={{ transform: "translateZ(80px)" }} 
                />
            </motion.div>
        </div>
    );
}

export function About() {
    const { t } = useI18n();

    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    }

    function handleMouseLeave() {
        mouseX.set(0.5);
        mouseY.set(0.5);
    }

    return (
        <section 
            id="about" 
            className="py-32 bg-black relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full -ml-48 -mb-48 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-24">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 mb-8"
                        >
                            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(13,255,81,0.5)]"></span>
                            <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em]">Our Story</span>
                        </motion.div>

                        <h2 className="text-5xl md:text-6xl font-heading font-black mb-8 text-white leading-[1.1]">
                            {t.about.title} <span className="text-primary drop-shadow-[0_0_15px_rgba(13,255,81,0.4)]">.</span>
                        </h2>

                        <p className="text-lg text-gray-400 leading-relaxed font-medium mb-12 max-w-xl">
                            {t.about.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
                            <motion.div
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 border border-primary/20 group-hover:shadow-[0_0_20px_rgba(13,255,81,0.2)] transition-all">
                                        <Users size={24} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-5xl font-black text-white tracking-tight flex items-center gap-1 group-hover:text-primary transition-colors duration-300">
                                        <AnimatedCounter value={46} suffix="k+" />
                                    </h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] group-hover:text-gray-300 transition-colors">Active Members</p>
                                </div>
                                {/* Animated background glow */}
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2 border border-blue-500/20 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                                        <Activity size={24} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-5xl font-black text-white tracking-tight flex items-center gap-1 group-hover:text-blue-400 transition-colors duration-300">
                                        24/7
                                    </h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] group-hover:text-gray-300 transition-colors">Dynamic Activity</p>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </motion.div>
                        </div>

                        <div className="pt-10 border-t border-white/5">
                            <div className="flex items-center gap-3 mb-8">
                                <ShieldCheck className="text-primary/70" size={18} />
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Leadership</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Blxckoutz */}
                                <a href="https://x.com/blxckoutz" target="_blank" rel="noopener noreferrer" 
                                    className="flex items-center gap-5 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-300 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative w-14 h-14 shrink-0">
                                        <img src="/images/avatars/blxckoutz.png" alt="Blxckoutz" className="w-full h-full rounded-2xl object-cover border border-white/10 group-hover:border-primary/50 transition-colors z-10 relative" />
                                        <div className="absolute -bottom-1.5 -right-1.5 bg-black rounded-md p-1 shadow-xl border border-white/10 z-20">
                                            <img src="/images/flags/br.png" alt="Brazil" className="w-4 h-auto rounded-sm" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center relative z-10">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-heading font-black text-base text-white tracking-tight">@BLXCKOUTZ</span>
                                            <img src="/images/icons/verified.png" alt="Verified" className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-primary/80 transition-colors">Co-Owner</span>
                                    </div>
                                </a>

                                {/* Gorilon */}
                                <a href="https://x.com/gorilonfn" target="_blank" rel="noopener noreferrer" 
                                    className="flex items-center gap-5 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#00a6ff]/30 hover:bg-white/[0.04] transition-all duration-300 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a6ff]/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative w-14 h-14 shrink-0">
                                        <img src="/images/avatars/gorilon.jpg" alt="Gorilon" className="w-full h-full rounded-2xl object-cover border border-white/10 group-hover:border-[#00a6ff]/50 transition-colors z-10 relative" />
                                        <div className="absolute -bottom-1.5 -right-1.5 bg-black rounded-md p-1 shadow-xl border border-white/10 z-20">
                                            <img src="/images/flags/ar.png" alt="Argentina" className="w-4 h-auto rounded-sm" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center relative z-10">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-heading font-black text-base text-white tracking-tight">@GORILONFN</span>
                                            <img src="/images/icons/verified.png" alt="Verified" className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#00a6ff]/80 transition-colors">Co-Owner</span>
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
                        className="lg:w-2/5 relative flex items-center justify-center p-8"
                    >
                        <TiltLogo mouseX={mouseX} mouseY={mouseY} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
