"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
            <div className="min-h-[calc(100dvh-72px)] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100dvh-72px)] flex items-center justify-center px-4 py-16 relative overflow-hidden">
            {/* Soft verde orbs */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-[480px]"
            >
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur-md md:p-14">
                    <div className="mb-12 text-center">
                        <div className="mb-10 inline-block">
                            <img
                                src="/images/logo_full.png"
                                alt="Major Scrims"
                                className="mx-auto h-14 w-auto md:h-16"
                            />
                        </div>

                        <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                            {t.login.welcome}
                        </h1>
                        <p className="text-base leading-relaxed text-white/70">
                            {t.login.subtitle}
                        </p>
                    </div>

                    <button
                        onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
                        className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#5865F2] px-8 py-3.5 font-bold text-white transition-colors duration-300 hover:bg-[#4752C4]"
                    >
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 127.14 96.36">
                            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c2.36-24.44-2.54-46.77-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                        </svg>
                        <span>{t.login.cta}</span>
                    </button>

                    <div className="mt-12 border-t border-white/10 pt-10">
                        <p className="px-2 text-center text-xs leading-relaxed text-white/40">
                            {t.login.agree}{" "}
                            <a
                                href="/terms"
                                className="text-white/60 transition-colors hover:text-primary"
                            >
                                {t.login.terms}
                            </a>{" "}
                            {t.login.and}{" "}
                            <a
                                href="/privacy"
                                className="text-white/60 transition-colors hover:text-primary"
                            >
                                {t.login.privacy}
                            </a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
