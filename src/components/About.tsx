import { useI18n } from "../i18n";
import { motion } from "framer-motion";

export function About() {
    const { t } = useI18n();

    return (
        <section id="about" className="py-24 bg-black relative">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="md:w-1/2"
                    >
                        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
                            {t.about.title} <span className="text-[#1FC058]">.</span>
                        </h2>
                        <p className="text-lg text-gray-400 leading-relaxed">
                            {t.about.description}
                        </p>
                        <div className="mt-8 grid grid-cols-2 gap-6">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <h3 className="text-3xl font-bold text-[#1FC058] mb-1">7k+</h3>
                                <p className="text-sm text-gray-400">Members</p>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <h3 className="text-3xl font-bold text-[#1FC058] mb-1">24/7</h3>
                                <p className="text-sm text-gray-400">Activity</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Owners</h4>
                            <div className="flex flex-wrap gap-10">
                                {/* Blxckoutz */}
                                <a href="https://x.com/blxckoutz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[#1FC058]/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img src="/images/avatars/blxckoutz.png" alt="Blxckoutz" className="w-16 h-16 rounded-full border-2 border-white/10 group-hover:border-[#1FC058] transition-colors object-cover relative z-10" />
                                        <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 z-20">
                                            <img src="/images/flags/br.png" alt="Brazil" className="w-5 h-auto rounded-[2px]" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-body font-semibold text-lg text-white group-hover:text-[#1FC058] transition-colors">@blxckoutz</span>
                                            <img src="/images/icons/verified.png" alt="Verified" className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">Co-Owner</span>
                                    </div>
                                </a>

                                {/* Gorilon */}
                                <a href="https://x.com/gorilonfn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[#1FC058]/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img src="/images/avatars/gorilon.jpg" alt="Gorilon" className="w-16 h-16 rounded-full border-2 border-white/10 group-hover:border-[#1FC058] transition-colors object-cover relative z-10" />
                                        <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 z-20">
                                            <img src="/images/flags/ar.png" alt="Argentina" className="w-5 h-auto rounded-[2px]" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-body font-semibold text-lg text-white group-hover:text-[#1FC058] transition-colors">@gorilonfn</span>
                                            <img src="/images/icons/verified.png" alt="Verified" className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">Co-Owner</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="md:w-1/2 relative"
                    >

                        {/* Placeholder for an actual image or video, using a gradient for now or the logo */}
                        <div className="flex items-center justify-center">
                            <img src="/images/hero_text_logo.png" alt="Major Scrims Logo" className="w-1/3 opacity-80" />
                        </div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}
