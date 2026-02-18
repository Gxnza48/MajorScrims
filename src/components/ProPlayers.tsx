"use client";

import { useI18n } from "../i18n";
import { motion } from "framer-motion";

const players = [
    { name: "k1nG", img: "/images/pro-players/k1nG.png", role: "proplayer" },
    { name: "Phzin", img: "/images/pro-players/Phzin.png", role: "proplayer" },
    { name: "Fazer", img: "/images/pro-players/Fazer.png", role: "proplayer" },
    { name: "Cadu", img: "/images/pro-players/Cadu.png", role: "proplayer" },
    { name: "Gabzera", img: "/images/pro-players/Gabzera.png", role: "proplayer" },
    { name: "Tisco", img: "/images/pro-players/Tisco.png", role: "proplayer" },
];

export function ProPlayers() {
    const { t } = useI18n();

    // Duplicate list for seamless marquee effect
    const marqueePlayers = [...players, ...players, ...players];

    return (
        <section id="players" className="py-32 bg-black relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

            <div className="container mx-auto px-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full glass border-primary/20 mb-6"
                    >
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Top Talent</span>
                    </motion.div>
                    <h2 className="text-5xl md:text-6xl font-heading font-black text-white mb-6 tracking-tight">
                        {t.players.title}
                    </h2>
                    <div className="w-20 h-1.5 bg-primary mx-auto rounded-full box-glow-primary"></div>
                </motion.div>
            </div>

            {/* Infinite Marquee Container */}
            <div className="relative flex overflow-hidden group/marquee">
                {/* Fade Edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-30 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-30 pointer-events-none" />

                <motion.div
                    animate={{
                        x: [0, "-33.333%"]
                    }}
                    transition={{
                        duration: 40, // Slower for smoother perception
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="flex gap-4 sm:gap-8 px-4 sm:px-8 will-change-transform"
                    style={{ width: "fit-content" }}
                >
                    {marqueePlayers.map((player, index) => (
                        <div
                            key={`${player.name}-${index}`}
                            className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-[320px] group relative"
                        >
                            <div className="relative rounded-[32px] overflow-hidden aspect-[3/4] border border-white/10 bg-[#0a0a0a] transition-all duration-300 group-hover:border-primary/50">
                                {/* Character Gradient Overlay - Optimized */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

                                <img
                                    src={player.img}
                                    alt={player.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover object-center transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105"
                                />

                                <div className="absolute bottom-0 left-0 w-full p-6 z-20 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                                    <h3 className="text-2xl font-heading font-black text-white mb-1 group-hover:text-primary transition-colors tracking-tight uppercase">{player.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{player.role}</p>
                                    </div>
                                </div>

                                {/* Hover interactive element - Simplified */}
                                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
