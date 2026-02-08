import { useI18n } from "../i18n";
import { motion } from "framer-motion";
import { Trophy, Crosshair, Scale, Shield } from "lucide-react";

export function Features() {
    const { t } = useI18n();

    const features = [
        {
            icon: <Trophy size={40} className="text-[#1FC058]" />,
            title: t.features.scrims,
            desc: t.features.scrimsDesc,
        },
        {
            icon: <Crosshair size={40} className="text-[#1FC058]" />,
            title: t.features.customs,
            desc: t.features.customsDesc,
        },
        {
            icon: <Scale size={40} className="text-[#1FC058]" />,
            title: t.features.rules,
            desc: t.features.rulesDesc,
        },
        {
            icon: <Shield size={40} className="text-[#1FC058]" />,
            title: t.features.moderation,
            desc: t.features.moderationDesc,
        },
    ];

    return (
        <section id="features" className="py-24 bg-black relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1FC058] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
                        {t.features.title}
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Experience the best competitive environment in the region.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#1FC058]/30 hover:bg-white/10 transition-all duration-300 group"
                        >
                            <div className="mb-6 p-4 rounded-xl bg-black/50 w-fit border border-white/5 group-hover:border-[#1FC058]/50 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#1FC058] transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
