import { useI18n } from "../i18n";
import { motion } from "framer-motion";

export function Hero() {
    const { t } = useI18n();

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-black">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1FC058] opacity-[0.1] blur-[150px] rounded-full pointer-events-none animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 mb-8 px-3 py-1 rounded-full border border-[#1FC058]/30 bg-[#1FC058]/10 backdrop-blur-sm mx-auto">
                        <img src="/images/flags/br.png" alt="Brazil" className="w-4 h-auto rounded-sm" />
                        <span className="text-[#1FC058] text-xs font-bold tracking-wider uppercase">Tier 1 Practice</span>
                    </div>

                    <div className="mb-8 flex justify-center">
                        <img src="/images/logo_hero_main.png" alt="MAJOR SCRIMS" className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_0_25px_rgba(31,192,88,0.3)]" />
                    </div>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                        {t.hero.subtitle}
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center"
                    >
                        <a
                            href="https://discord.com/invite/majorscrims"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative bg-[#1FC058] text-black font-bold text-[15px] md:text-[17px] px-3 md:px-4 py-[0.35em] pl-6 md:pl-8 h-[2.8em] rounded-[0.9em] flex items-center overflow-hidden cursor-pointer shadow-[inset_0_0_1.6em_-0.6em_#105624] group transition-transform hover:scale-105 active:scale-95"
                        >
                            <span className="mr-8 md:mr-12 tracking-wide uppercase whitespace-nowrap">{t.hero.cta}</span>
                            <div
                                className="absolute right-[0.3em] bg-black h-[2.2em] w-[2.2em] rounded-[0.7em] flex items-center justify-center transition-all duration-300 group-hover:w-[calc(100%-0.6em)] shadow-[0.1em_0.1em_0.6em_0.2em_#105624]"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                    className="w-[1.1em] transition-transform duration-300 text-[#1FC058] group-hover:translate-x-[0.1em]"
                                >
                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                    <path
                                        fill="currentColor"
                                        d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                                    ></path>
                                </svg>
                            </div>
                        </a>
                    </motion.div>
                </motion.div>
            </div>


        </section>
    );
}
