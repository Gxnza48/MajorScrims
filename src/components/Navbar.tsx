"use client";

import { useState, useEffect } from "react";
import { useI18n } from "../i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { UserMenu } from "./UserMenu";

export function Navbar() {
    const { t, language, setLanguage } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleLang = () => {
        setLanguage(language === "pt" ? "es" : "pt");
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "pt-4" : "pt-6"
                }`}
        >
            <div className={`container mx-auto px-6 transition-all duration-500 ${scrolled ? "max-w-6xl" : "max-w-7xl"}`}>
                <div className={`flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-500 ${scrolled ? "glass-dark shadow-2xl border-white/10" : "bg-transparent border-transparent"}`}>
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/images/logo_full.png" alt="Major Scrims" className="h-9 md:h-10 w-auto transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(31,192,88,0.5)]" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            <a href="/#about" className="text-[13px] font-semibold text-gray-400 hover:text-white transition-all hover:tracking-wider">{t.nav.about}</a>
                            <a href="/#players" className="text-[13px] font-semibold text-gray-400 hover:text-white transition-all hover:tracking-wider">{t.nav.players}</a>
                            <Link href="/tournaments" className="text-[13px] font-bold text-primary hover:text-primary/80 transition-all uppercase tracking-widest group">
                                {t.nav.tournaments}
                                <span className="block h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-300"></span>
                            </Link>
                            <a href="/#features" className="text-[13px] font-semibold text-gray-400 hover:text-white transition-all hover:tracking-wider">{t.nav.community}</a>
                        </div>

                        <div className="h-4 w-[1px] bg-white/10 mx-2"></div>

                        {/* Language Switcher */}
                        <button
                            onClick={toggleLang}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group"
                            aria-label="Switch Language"
                        >
                            <img
                                src={language === "pt" ? "/images/flags/br.png" : "/images/flags/ar.png"}
                                alt={language === "pt" ? "Brazil Flag" : "Argentina Flag"}
                                className="w-5 h-auto rounded-sm object-cover transition-transform group-hover:scale-110"
                            />
                            <span className="text-[11px] font-bold uppercase text-gray-400 group-hover:text-white">{language}</span>
                        </button>

                        {/* CTA Button or User Menu */}
                        {session ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="text-[13px] font-bold text-primary hover:underline transition-all"
                                >
                                    Dashboard
                                </Link>
                                <UserMenu />
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-primary hover:bg-[#15D166] text-black font-black text-[13px] px-6 py-2.5 rounded-xl transition-all transform hover:scale-105 hover:shadow-[0_0_25px_rgba(31,192,88,0.5)] flex items-center gap-2 active:scale-95"
                            >
                                <LogIn size={16} strokeWidth={3} />
                                LOGIN
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-white p-2 rounded-xl bg-white/5 border border-white/10 active:scale-90 transition-transform" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-4 top-24 z-50 md:hidden"
                    >
                        <div className="glass-dark border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <a href="/#about" onClick={() => setIsOpen(false)} className="text-lg font-bold text-gray-300 hover:text-primary transition-colors">{t.nav.about}</a>
                                <a href="/#players" onClick={() => setIsOpen(false)} className="text-lg font-bold text-gray-300 hover:text-primary transition-colors">{t.nav.players}</a>
                                <Link href="/tournaments" onClick={() => setIsOpen(false)} className="text-xl font-black text-primary hover:text-primary/80 transition-colors tracking-tight">{t.nav.tournaments}</Link>
                                <a href="/#features" onClick={() => setIsOpen(false)} className="text-lg font-bold text-gray-300 hover:text-primary transition-colors">{t.nav.community}</a>
                            </div>

                            <div className="h-[1px] bg-white/10 w-full"></div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Language</span>
                                <button
                                    onClick={toggleLang}
                                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/10"
                                >
                                    <img
                                        src={language === "pt" ? "/images/flags/br.png" : "/images/flags/ar.png"}
                                        alt={language === "pt" ? "Brazil Flag" : "Argentina Flag"}
                                        className="w-6 h-auto rounded-sm object-cover"
                                    />
                                    <span className="text-sm font-black uppercase text-white">{language}</span>
                                </button>
                            </div>

                            {session ? (
                                <div className="flex flex-col gap-4">
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="text-center text-primary font-black py-2 tracking-widest text-sm"
                                    >
                                        DASHBOARD
                                    </Link>
                                    <div className="flex justify-center">
                                        <UserMenu />
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="bg-primary text-center text-black font-black py-4 px-6 rounded-2xl shadow-[0_0_20px_rgba(31,192,88,0.4)] flex items-center justify-center gap-3 active:scale-95 transition-transform"
                                >
                                    <LogIn size={20} strokeWidth={3} />
                                    LOGIN
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
