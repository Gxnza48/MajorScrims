import { useState, useEffect } from "react";
import { useI18n } from "../i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const { t, language, setLanguage } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-md py-4 border-b border-white/10" : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center gap-2 group">
                    <img src="/images/logo_full.png" alt="Major Scrims" className="h-10 w-auto transition-transform group-hover:scale-105" />
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t.nav.about}</a>
                    <a href="#players" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t.nav.players}</a>
                    <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t.nav.community}</a>

                    {/* Language Switcher */}
                    <button
                        onClick={toggleLang}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                        aria-label="Switch Language"
                    >
                        <img
                            src={language === "pt" ? "/images/flags/br.png" : "/images/flags/ar.png"}
                            alt={language === "pt" ? "Brazil Flag" : "Argentina Flag"}
                            className="w-5 h-auto rounded-sm object-cover"
                        />
                        <span className="text-xs font-medium uppercase text-gray-300">{language}</span>
                    </button>

                    {/* CTA Button */}
                    <a
                        href="https://discord.com/invite/majorscrims"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#1FC058] hover:bg-[#105624] text-black font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(31,192,88,0.4)]"
                    >
                        {t.nav.join}
                    </a>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black border-t border-white/10 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            <a href="#about" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-300 hover:text-[#1FC058]">{t.nav.about}</a>
                            <a href="#players" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-300 hover:text-[#1FC058]">{t.nav.players}</a>
                            <a href="#features" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-300 hover:text-[#1FC058]">{t.nav.community}</a>

                            <div className="flex items-center justify-between py-4 border-t border-white/10">
                                <span className="text-gray-400">Language</span>
                                <button
                                    onClick={toggleLang}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5"
                                >
                                    <img
                                        src={language === "pt" ? "/images/flags/br.png" : "/images/flags/ar.png"}
                                        alt={language === "pt" ? "Brazil Flag" : "Argentina Flag"}
                                        className="w-6 h-auto rounded-sm object-cover"
                                    />
                                    <span className="text-sm font-bold uppercase">{language.toUpperCase()}</span>
                                </button>
                            </div>

                            <a
                                href="https://discord.com/invite/majorscrims"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#1FC058] text-center text-black font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(31,192,88,0.3)]"
                            >
                                {t.nav.join}
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
