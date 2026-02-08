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

    return (
        <section id="players" className="py-24 bg-gradient-to-b from-black to-[#050505] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#1FC058]/20 to-transparent"></div>

            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
                        {t.players.title}
                    </h2>
                    <div className="w-24 h-1 bg-[#1FC058] mx-auto rounded-full"></div>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {players.map((player, index) => (
                        <motion.div
                            key={player.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group relative"
                        >
                            <div className="relative rounded-xl overflow-hidden aspect-[3/4] border border-white/5 bg-white/5 transition-all duration-300 group-hover:border-[#1FC058]/50 group-hover:shadow-[0_0_20px_rgba(31,192,88,0.2)]">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-10" />
                                <img
                                    src={player.img}
                                    alt={player.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                                    <h3 className="text-xl font-bold text-white group-hover:text-[#1FC058] transition-colors">{player.name}</h3>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">{player.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
