"use client";

import { useState } from "react";
import { useI18n } from "../i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { UserMenu } from "./UserMenu";

export function Navbar() {
    const { t, language, setLanguage } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    const toggleLang = () => {
        setLanguage(language === "pt" ? "es" : "pt");
    };

    return (
        <header className="sticky top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/30 backdrop-blur-md">
            <div className="container mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="group flex items-center gap-2">
                    <img
                        src="/images/logo_full.png"
                        alt="Major Scrims"
                        className="h-8 w-auto transition-opacity duration-300 group-hover:opacity-80 md:h-9"
                    />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden items-center gap-8 md:flex">
                    <nav className="flex items-center gap-8">
                        <a
                            href="/#features"
                            className="text-sm font-medium text-white/60 transition-colors hover:text-white"
                        >
                            {t.nav.about}
                        </a>
                        <Link
                            href="/leaderboard"
                            className="text-sm font-medium text-white/60 transition-colors hover:text-white"
                        >
                            {t.nav.leaderboard}
                        </Link>
                        <Link
                            href="/tournaments"
                            className="text-sm font-medium text-white/60 transition-colors hover:text-white"
                        >
                            {t.nav.tournaments}
                        </Link>
                        <Link
                            href="/blog"
                            className="text-sm font-medium text-white/60 transition-colors hover:text-white"
                        >
                            Blog
                        </Link>
                    </nav>

                    <div className="mx-2 h-4 w-[1px] bg-white/10"></div>

                    {/* Language Switcher */}
                    <button
                        onClick={toggleLang}
                        className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 transition-colors hover:border-white/20 hover:bg-white/10"
                        aria-label="Switch Language"
                    >
                        <img
                            src={language === "pt" ? "/images/flags/br.png" : "/images/flags/ar.png"}
                            alt={language === "pt" ? "Brazil Flag" : "Argentina Flag"}
                            className="h-auto w-5 rounded-sm object-cover"
                        />
                        <span className="text-[11px] font-bold uppercase text-white/50 group-hover:text-white">{language}</span>
                    </button>

                    {/* CTA Button or User Menu */}
                    {session ? (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="text-sm font-semibold text-primary transition-colors hover:text-[#43E97B]"
                            >
                                Dashboard
                            </Link>
                            <UserMenu />
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-[#04130A] transition-colors duration-300 hover:bg-[#43E97B]"
                        >
                            <LogIn size={16} />
                            LOGIN
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-colors hover:border-white/20 hover:bg-white/10 md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-x-4 top-[84px] z-50 md:hidden"
                    >
                        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl backdrop-blur-md">
                            <nav className="flex flex-col gap-4">
                                <a
                                    href="/#features"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium text-white/70 transition-colors hover:text-white"
                                >
                                    {t.nav.about}
                                </a>
                                <Link
                                    href="/leaderboard"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-semibold text-primary transition-colors hover:text-[#43E97B]"
                                >
                                    {t.nav.leaderboard}
                                </Link>
                                <Link
                                    href="/tournaments"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-semibold text-primary transition-colors hover:text-[#43E97B]"
                                >
                                    {t.nav.tournaments}
                                </Link>
                                <Link
                                    href="/blog"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-semibold text-primary transition-colors hover:text-[#43E97B]"
                                >
                                    Blog
                                </Link>
                            </nav>

                            <div className="h-[1px] w-full bg-white/10"></div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white/60">Language</span>
                                <button
                                    onClick={toggleLang}
                                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 transition-colors hover:bg-white/10"
                                >
                                    <img
                                        src={language === "pt" ? "/images/flags/br.png" : "/images/flags/ar.png"}
                                        alt={language === "pt" ? "Brazil Flag" : "Argentina Flag"}
                                        className="h-auto w-6 rounded-sm object-cover"
                                    />
                                    <span className="text-sm font-bold uppercase text-white">{language}</span>
                                </button>
                            </div>

                            {session ? (
                                <div className="flex flex-col gap-4">
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="py-2 text-center text-sm font-semibold text-primary transition-colors hover:text-[#43E97B]"
                                    >
                                        Dashboard
                                    </Link>
                                    <div className="flex justify-center">
                                        <UserMenu />
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-bold text-[#04130A] transition-colors duration-300 hover:bg-[#43E97B]"
                                >
                                    <LogIn size={18} />
                                    LOGIN
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
