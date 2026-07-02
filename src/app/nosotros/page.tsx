"use client";

import {
    ArrowRight,
    Clock,
    Instagram,
    ScrollText,
    ShieldCheck,
    Swords,
    Trophy,
    Twitter,
    Users,
} from "lucide-react";
import { useI18n } from "@/i18n";

/* ──────────────────────────────────────────────────────────────────
   Nosotros / Sobre nós — toda la data de la comunidad en un lugar:
   "Por qué entrenar en Major" (antes en la landing), redes oficiales
   y el CTA para unirse al Discord. Mismo lenguaje visual verde que
   la home.
   ────────────────────────────────────────────────────────────────── */

// Iconos por feature (orden fijo; los textos vienen de COPY por índice).
const FEATURE_ICONS = [
    Swords,
    Clock,
    ScrollText,
    ShieldCheck,
    Trophy,
    Users,
];

const DISCORD_URL = "https://discord.com/invite/majorscrims";

const glowBtn = { boxShadow: "var(--glow-btn)" } as React.CSSProperties;

const DiscordIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 127.14 96.36"
        fill="currentColor"
        className={className}
    >
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c2.36-24.44-3-48.42-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

// Redes oficiales (handles confirmados por el cliente).
const SOCIALS = [
    {
        name: "Instagram",
        handle: "@majorscrims",
        url: "https://www.instagram.com/majorscrims/",
        Icon: Instagram,
    },
    {
        name: "TikTok",
        handle: "@majorscrims_",
        url: "https://www.tiktok.com/@majorscrims_",
        Icon: TikTokIcon,
    },
    {
        name: "X (Twitter)",
        handle: "@MajorScrims_",
        url: "https://x.com/MajorScrims_",
        Icon: Twitter,
    },
];

// ── Copy bilingüe (PT default; ES neutro-rioplatense) ──
const COPY = {
    pt: {
        badge: "Sobre nós",
        titlePre: "A comunidade de elite do",
        titleAccent: "Fortnite competitivo",
        subtitle:
            "A Major Scrims é a comunidade líder de treinos competitivos no Brasil e LATAM. Mais de 58.000 jogadores treinam aqui com lobbies equilibrados, regras profissionais e atividade 24 horas por dia.",
        featuresTitle: "Por que treinar na Major?",
        featuresSubtitle:
            "Estrutura profissional pensada para levar o seu jogo ao próximo nível.",
        features: [
            {
                title: "Scrims diárias",
                desc: "Treinos com lobbies equilibrados e nível competitivo real, todos os dias.",
            },
            {
                title: "Customs 24/7",
                desc: "Partidas personalizadas a qualquer hora, com servidores ativos dia e noite.",
            },
            {
                title: "Regras profissionais",
                desc: "Formato e regras alinhados ao cenário competitivo oficial.",
            },
            {
                title: "Moderação ativa",
                desc: "Equipe dedicada garantindo partidas justas e um ambiente saudável.",
            },
            {
                title: "Leaderboard & rankings",
                desc: "Acompanhe sua evolução com estatísticas e rankings atualizados.",
            },
            {
                title: "Comunidade pro",
                desc: "Jogadores profissionais e talentos do Brasil e LATAM treinam aqui.",
            },
        ],
        socialsBadge: "Redes sociais",
        socialsTitle: "Siga a Major nas redes",
        socialsSubtitle:
            "Anúncios, resultados e os bastidores da comunidade, direto do nosso feed.",
        socialsCta: "Seguir",
        ctaTitle: "Junte-se à comunidade",
        ctaSubtitle:
            "Entre no Discord da Major Scrims e comece a treinar com os melhores do Brasil e LATAM hoje mesmo.",
        ctaButton: "Entrar no Discord",
    },
    es: {
        badge: "Nosotros",
        titlePre: "La comunidad de élite del",
        titleAccent: "Fortnite competitivo",
        subtitle:
            "Major Scrims es la comunidad líder de prácticas competitivas en Brasil y LATAM. Más de 58.000 jugadores entrenan acá con lobbies equilibrados, reglas profesionales y actividad las 24 horas.",
        featuresTitle: "¿Por qué entrenar en Major?",
        featuresSubtitle:
            "Estructura profesional pensada para llevar tu juego al siguiente nivel.",
        features: [
            {
                title: "Scrims diarias",
                desc: "Entrenamientos con lobbies equilibrados y nivel competitivo real, todos los días.",
            },
            {
                title: "Customs 24/7",
                desc: "Partidas personalizadas a cualquier hora, con servidores activos día y noche.",
            },
            {
                title: "Reglas profesionales",
                desc: "Formato y reglas alineados con el escenario competitivo oficial.",
            },
            {
                title: "Moderación activa",
                desc: "Equipo dedicado que garantiza partidas justas y un ambiente sano.",
            },
            {
                title: "Leaderboard y rankings",
                desc: "Seguí tu evolución con estadísticas y rankings actualizados.",
            },
            {
                title: "Comunidad pro",
                desc: "Jugadores profesionales y talentos de Brasil y LATAM entrenan acá.",
            },
        ],
        socialsBadge: "Redes sociales",
        socialsTitle: "Seguí a Major en las redes",
        socialsSubtitle:
            "Anuncios, resultados y el detrás de escena de la comunidad, directo de nuestro feed.",
        socialsCta: "Seguir",
        ctaTitle: "Unite a la comunidad",
        ctaSubtitle:
            "Entrá al Discord de Major Scrims y empezá a entrenar con los mejores de Brasil y LATAM hoy mismo.",
        ctaButton: "Entrar al Discord",
    },
} as const;

export default function Nosotros() {
    const { language } = useI18n();
    const c = COPY[language];

    return (
        <div className="min-h-screen text-white">
            <style>{`
                @keyframes nmRise {
                    from { opacity: 0; transform: translateY(14px); }
                    to { opacity: 1; transform: none; }
                }
                .nm-rise { animation: nmRise .7s cubic-bezier(.22,1,.36,1) both; }
                .nm-d1 { animation-delay: .08s; }
                .nm-d2 { animation-delay: .16s; }
            `}</style>

            {/* ── Intro ──────────────────────────────────────────── */}
            {/* Sin overflow-hidden: los orbs se funden detrás de la
                sección siguiente en vez de cortarse en el borde. */}
            <section className="relative pb-10 pt-24 md:pt-32">
                <div className="absolute inset-x-0 top-0 z-0 h-[55vh]">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(ellipse at 50% 0%, var(--amb), transparent 65%)",
                        }}
                    />
                    <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-[var(--orb1)] blur-3xl" />
                    <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-[var(--orb2)] blur-3xl" />
                </div>

                <div className="container relative z-10 mx-auto max-w-4xl px-6 text-center">
                    <div className="nm-rise mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                        <Users size={16} className="text-[var(--acc)]" />
                        <span className="text-sm font-medium text-[var(--acc)]">
                            {c.badge}
                        </span>
                    </div>

                    <h1 className="nm-rise nm-d1 mb-6 text-4xl font-bold leading-tight text-[var(--h1)] md:text-5xl">
                        {c.titlePre}{" "}
                        <span
                            className="text-[var(--acc)]"
                            style={{ textShadow: "var(--glow-h1)" }}
                        >
                            {c.titleAccent}
                        </span>
                    </h1>

                    <p className="nm-rise nm-d2 mx-auto max-w-2xl text-lg text-white/70 md:text-xl">
                        {c.subtitle}
                    </p>
                </div>
            </section>

            {/* ── Por qué entrenar en Major (antes en la landing) ── */}
            <section id="features" className="py-20">
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <h2 className="mb-5 text-3xl font-bold md:text-4xl">
                            {c.featuresTitle}
                        </h2>
                        <p className="text-lg text-white/70">
                            {c.featuresSubtitle}
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {c.features.map((feat, i) => {
                            const Icon = FEATURE_ICONS[i];
                            return (
                                <div
                                    key={feat.title}
                                    className="rounded-xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-[rgb(var(--acc-rgb)_/_0.35)]"
                                >
                                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[rgb(var(--acc-rgb)_/_0.12)]">
                                        <Icon size={22} className="text-[var(--acc)]" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold">
                                        {feat.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-white/60">
                                        {feat.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Redes oficiales ────────────────────────────────── */}
            <section className="py-4">
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
                        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[rgb(var(--acc-rgb)_/_0.10)] blur-3xl" />
                        <div className="relative z-10">
                            <div className="mb-8">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                    <Instagram size={16} className="text-[var(--acc)]" />
                                    <span className="text-sm font-medium text-[var(--acc)]">
                                        {c.socialsBadge}
                                    </span>
                                </div>
                                <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                                    {c.socialsTitle}
                                </h2>
                                <p className="text-white/70">{c.socialsSubtitle}</p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-3">
                                {SOCIALS.map(({ name, handle, url, Icon }) => (
                                    <a
                                        key={name}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-5 rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-300 hover:border-[rgb(var(--acc-rgb)_/_0.35)]"
                                    >
                                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--acc-rgb)_/_0.12)]">
                                            <Icon className="h-[22px] w-[22px] text-[var(--acc)]" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="mb-0.5 font-bold">{name}</h3>
                                            <p className="truncate text-sm text-white/60">
                                                {handle}
                                            </p>
                                        </div>
                                        <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--acc)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            {c.socialsCta}
                                            <ArrowRight size={14} />
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Discord CTA ────────────────────────────────────── */}
            <section className="pb-32 pt-20">
                <div className="container mx-auto max-w-4xl px-6">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-16 text-center md:px-16">
                        <div className="absolute left-1/2 top-0 h-48 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--acc-rgb)_/_0.10)] blur-3xl" />
                        <div className="relative z-10">
                            <DiscordIcon className="mx-auto mb-6 h-12 w-12 text-[var(--acc)]" />
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                {c.ctaTitle}
                            </h2>
                            <p className="mx-auto mb-9 max-w-xl text-lg text-white/70">
                                {c.ctaSubtitle}
                            </p>
                            <a
                                href={DISCORD_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-[var(--acc)] px-8 py-3.5 font-bold text-[var(--on-acc)] transition-colors duration-300 hover:bg-[var(--acc-hover)]"
                                style={glowBtn}
                            >
                                <DiscordIcon className="h-5 w-5" />
                                {c.ctaButton}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
