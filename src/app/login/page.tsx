"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#1FC058] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
            {/* Immersive Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-primary opacity-[0.08] blur-[150px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-10" />

                {/* Dynamic light streaks */}
                <motion.div
                    animate={{ x: [-500, 1500], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-0 w-96 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent rotate-12"
                />
                <motion.div
                    animate={{ x: [1500, -500], opacity: [0, 0.3, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 2 }}
                    className="absolute bottom-1/4 right-0 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent -rotate-12"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-[440px]"
            >
                <div className="glass-dark border-white/10 rounded-[40px] p-10 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    {/* Background glow for the card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-8"
                        >
                            <img src="/images/logo_full.png" alt="Major Scrims" className="h-10 md:h-12 mx-auto drop-shadow-[0_0_15px_rgba(31,192,88,0.3)] hover:scale-105 transition-transform duration-500" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-heading font-black mb-3 tracking-tight text-white uppercase"
                        >
                            Welcome Back
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-gray-400 font-medium"
                        >
                            Sign in to access your dashboard and stats
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <button
                            onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
                            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-black py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-4 group shadow-xl active:scale-95"
                        >
                            <div className="p-1 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
                                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c2.36-24.44-2.54-46.77-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                                </svg>
                            </div>
                            <span className="tracking-widest uppercase text-sm">Continue with Discord</span>
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-10 pt-8 border-t border-white/5"
                    >
                        <p className="text-[10px] text-center text-gray-500 font-black uppercase tracking-widest leading-loose">
                            By continuing, you agree to our <br />
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</a> & <a href="#" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</a>
                        </p>
                    </motion.div>
                </div>

                {/* Decorative version number or simple footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 1 }}
                    className="mt-6 text-center"
                >
                    <span className="text-[10px] font-black tracking-[0.5em] text-white uppercase">Version 2.0 Redesign</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
