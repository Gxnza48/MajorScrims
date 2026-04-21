"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n";

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();
    const { t } = useI18n();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#1FC058] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0">
                {/* Mesh Gradient */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

                {/* Animated Particles (CSS implementation for performance) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0,
                                x: Math.random() * 100 + "%",
                                y: Math.random() * 100 + "%",
                                scale: 0
                            }}
                            animate={{
                                opacity: [0, 0.4, 0],
                                y: ["0%", "-20%"],
                                scale: [0, 1, 0.5]
                            }}
                            transition={{
                                duration: Math.random() * 5 + 5,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 5
                            }}
                            className="absolute w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_#1FC058]"
                        />
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[480px]"
            >
                {/* Glow Effect behind the card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/0 rounded-[42px] blur-2xl opacity-50 z-[-1]" />

                <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 md:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                    {/* Animated Border Line */}
                    <motion.div
                        animate={{
                            left: ["-100%", "100%"]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-0 left-[-100%] w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                    />

                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="mb-10 relative inline-block"
                        >
                            <img
                                src="/images/logo_full.png"
                                alt="Major Scrims"
                                className="h-14 md:h-16 mx-auto drop-shadow-[0_0_20px_rgba(31,192,88,0.5)] group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                            {/* Decorative elements around logo */}
                            <motion.div

                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h1 className="text-4xl font-heading font-black mb-4 tracking-tighter text-white uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                                {t.login.welcome}
                            </h1>
                            <p className="text-gray-400 font-medium text-sm md:text-base leading-relaxed px-4">
                                {t.login.subtitle}
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-6"
                    >
                        <button
                            onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
                            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-black py-5 px-8 rounded-2xl transition-all shadow-[0_15px_30px_-5px_rgba(88,101,242,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(88,101,242,0.5)] transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-5 group relative overflow-hidden"
                        >
                            <motion.div
                                className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"
                                style={{ skewX: "-20deg" }}
                            />

                            <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors shadow-inner">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 127.14 96.36">
                                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c2.36-24.44-2.54-46.77-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                                </svg>
                            </div>
                            <span className="tracking-widest uppercase text-base font-black">
                                {t.login.cta}
                            </span>
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12 pt-10 border-t border-white/5"
                    >
                        <p className="text-[11px] text-center text-gray-500 font-bold uppercase tracking-widest leading-relaxed px-2">
                            {t.login.agree} <br className="hidden sm:block" />
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors hover:underline underline-offset-4">{t.login.terms}</a> {t.login.and} <a href="#" className="text-gray-400 hover:text-primary transition-colors hover:underline underline-offset-4">{t.login.privacy}</a>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
