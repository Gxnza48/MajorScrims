"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Clock,
    ScrollText,
    ShieldCheck,
    Star,
    Swords,
    Trophy,
    Users,
} from "lucide-react";
import { useI18n } from "@/i18n";

/* ──────────────────────────────────────────────────────────────────
   Home — diseño "verde" aprobado (antes en /newmodel), adaptado a prod.
   Usa la Navbar/Footer globales (Chrome) y los tokens verdes de :root.
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

const PRO_PLAYERS = ["Cadu", "Fazer", "Gabzera", "k1nG", "Phzin", "Tisco"];

// Logos de marcas (orden fijo; descripciones vienen de COPY por índice).
const BRAND_LOGOS = [
    {
        name: "Twitch",
        logo: "https://m.media-amazon.com/images/I/21kRx-CJsUL.png",
    },
    {
        name: "Fortnite",
        logo: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Fortnite_F_lettermark_logo.png",
    },
];

type Player = {
    name: string;
    xp: number;
    kills: number;
    games: number;
    rank: number;
};

const FALLBACK_TOP: Player[] = [
    { rank: 1, name: "AURA LeoS2", xp: 248, kills: 62, games: 46 },
    { rank: 2, name: "2two Keyxity", xp: 168, kills: 62, games: 27 },
    { rank: 3, name: "shinnzx1", xp: 164, kills: 24, games: 16 },
    { rank: 4, name: "manya", xp: 162, kills: 29, games: 26 },
    { rank: 5, name: "astrx 67", xp: 140, kills: 50, games: 43 },
];

type BlogPost = {
    _id: string;
    slug: string;
    createdAt: string;
    title?: Record<string, string>;
    content?: Record<string, string>;
};

type PostCard = {
    key: string;
    href: string;
    date: string;
    title: string;
    snippet: string;
    example: boolean;
};

const DISCORD_URL = "https://discord.com/invite/majorscrims";

const glowBtn = { boxShadow: "var(--glow-btn)" } as React.CSSProperties;

// ── Copy bilingüe (PT exacto al boceto aprobado; ES neutro-rioplatense) ──
const COPY = {
    pt: {
        heroBadge: "Mais de 46.000 jogadores confiam na Major",
        heroTitlePre: "Scrims & customs de elite para",
        heroTitleAccent: "Fortnite competitivo",
        heroSubtitle:
            "A comunidade líder de treinos competitivos no Brasil e LATAM. Lobbies equilibrados, regras profissionais e atividade 24 horas por dia.",
        heroCtaDiscord: "Entrar no Discord",
        heroCtaLeaderboard: "Ver leaderboard",
        stats: [
            ["46k+", "Membros ativos"],
            ["", "Jogadores ranqueados"],
            ["24/7", "Customs e scrims"],
        ] as [string, string][],
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
        lbBadge: "Leaderboard",
        lbTitle: "Os melhores da temporada",
        lbSubtitle:
            "Rankings atualizados com o desempenho real das sessões.",
        lbCols: {
            rank: "#",
            player: "Jogador",
            xp: "XP",
            kills: "Kills",
            games: "Partidas",
        },
        lbLink: "Ver leaderboard completo",
        dashBadge: "Estatísticas",
        dashTitle: "Acompanhe a sua evolução",
        dashSubtitle:
            "Dashboard pessoal com XP, kills, partidas e ranking da temporada. Conecte a sua conta e veja o seu progresso sessão a sessão.",
        dashImgAlt: "Dashboard da Major Scrims",
        dashCta: "Acessar o dashboard",
        brandsBadge: "Parcerias",
        brandsTitle: "Marcas que confiam na Major",
        brandsSubtitle: "Parcerias e colaborações oficiais da comunidade.",
        brandsDesc: [
            "Parceria oficial para transmissões e eventos da comunidade.",
            "Scrims e customs dentro do ecossistema competitivo oficial.",
        ],
        prosBadge: "Comunidade pro",
        prosTitle: "Quem treina na Major",
        prosSubtitle:
            "Jogadores profissionais e criadores de conteúdo escolhem os nossos servidores.",
        proLabel: "Pro player",
        proPrev: "Jogador anterior",
        proNext: "Próximo jogador",
        proDot: (name: string) => `Ver ${name}`,
        blogTitle: "Últimas atualizações",
        blogSubtitle: "Anúncios, mudanças e novidades da comunidade.",
        blogReadMore: "Ler mais",
        blogExample: "exemplo",
        blogAll: "Ver todas as atualizações",
        examplePosts: [
            {
                date: "10/06/2026",
                title: "Nova temporada do leaderboard",
                snippet:
                    "O split atual foi resetado e a nova temporada já está valendo. Confira como funciona a pontuação e os tiers.",
            },
            {
                date: "05/06/2026",
                title: "Atualização das regras de scrims",
                snippet:
                    "Ajustes no formato das sessões noturnas e novas diretrizes de moderação para as lobbies competitivas.",
            },
            {
                date: "28/05/2026",
                title: "Major Cup: inscrições abertas",
                snippet:
                    "O torneio interno da comunidade está de volta. Garanta a sua vaga e dispute contra os melhores da região.",
            },
        ],
        ctaTitle: "Pronto para evoluir?",
        ctaSubtitle:
            "Entre no Discord da Major Scrims e comece a treinar com os melhores do Brasil e LATAM hoje mesmo.",
        ctaButton: "Entrar no Discord",
    },
    es: {
        heroBadge: "Más de 46.000 jugadores confían en Major",
        heroTitlePre: "Scrims y customs de élite para",
        heroTitleAccent: "Fortnite competitivo",
        heroSubtitle:
            "La comunidad líder de prácticas competitivas en Brasil y LATAM. Lobbies equilibrados, reglas profesionales y actividad las 24 horas.",
        heroCtaDiscord: "Entrar al Discord",
        heroCtaLeaderboard: "Ver leaderboard",
        stats: [
            ["46k+", "Miembros activos"],
            ["", "Jugadores rankeados"],
            ["24/7", "Customs y scrims"],
        ] as [string, string][],
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
        lbBadge: "Leaderboard",
        lbTitle: "Los mejores de la temporada",
        lbSubtitle:
            "Rankings actualizados con el rendimiento real de las sesiones.",
        lbCols: {
            rank: "#",
            player: "Jugador",
            xp: "XP",
            kills: "Kills",
            games: "Partidas",
        },
        lbLink: "Ver leaderboard completo",
        dashBadge: "Estadísticas",
        dashTitle: "Seguí tu evolución",
        dashSubtitle:
            "Dashboard personal con XP, kills, partidas y ranking de la temporada. Conectá tu cuenta y mirá tu progreso sesión a sesión.",
        dashImgAlt: "Dashboard de Major Scrims",
        dashCta: "Acceder al dashboard",
        brandsBadge: "Alianzas",
        brandsTitle: "Marcas que confían en Major",
        brandsSubtitle: "Alianzas y colaboraciones oficiales de la comunidad.",
        brandsDesc: [
            "Alianza oficial para transmisiones y eventos de la comunidad.",
            "Scrims y customs dentro del ecosistema competitivo oficial.",
        ],
        prosBadge: "Comunidad pro",
        prosTitle: "Quiénes entrenan en Major",
        prosSubtitle:
            "Jugadores profesionales y creadores de contenido eligen nuestros servidores.",
        proLabel: "Pro player",
        proPrev: "Jugador anterior",
        proNext: "Jugador siguiente",
        proDot: (name: string) => `Ver ${name}`,
        blogTitle: "Últimas novedades",
        blogSubtitle: "Anuncios, cambios y novedades de la comunidad.",
        blogReadMore: "Leer más",
        blogExample: "ejemplo",
        blogAll: "Ver todas las novedades",
        examplePosts: [
            {
                date: "10/06/2026",
                title: "Nueva temporada del leaderboard",
                snippet:
                    "El split actual fue reseteado y la nueva temporada ya está en juego. Mirá cómo funciona el puntaje y los tiers.",
            },
            {
                date: "05/06/2026",
                title: "Actualización de las reglas de scrims",
                snippet:
                    "Ajustes en el formato de las sesiones nocturnas y nuevas directrices de moderación para los lobbies competitivos.",
            },
            {
                date: "28/05/2026",
                title: "Major Cup: inscripciones abiertas",
                snippet:
                    "El torneo interno de la comunidad está de vuelta. Asegurá tu lugar y competí contra los mejores de la región.",
            },
        ],
        ctaTitle: "¿Listo para evolucionar?",
        ctaSubtitle:
            "Entrá al Discord de Major Scrims y empezá a entrenar con los mejores de Brasil y LATAM hoy mismo.",
        ctaButton: "Entrar al Discord",
    },
} as const;

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

function stripMarkup(html: string): string {
    return html
        .replace(/<[^>]+>/g, " ")
        .replace(/[#_*\[\]]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export default function Home() {
    const { language } = useI18n();
    const c = COPY[language];

    const [topPlayers, setTopPlayers] = useState<Player[]>(FALLBACK_TOP);
    const [totalPlayers, setTotalPlayers] = useState(7700);
    const [posts, setPosts] = useState<PostCard[] | null>(null);
    const [proIndex, setProIndex] = useState(0);
    const [proPaused, setProPaused] = useState(false);

    useEffect(() => {
        fetch("/data.json")
            .then((r) => r.json())
            .then((d) => {
                if (Array.isArray(d?.players) && d.players.length > 0) {
                    setTopPlayers(d.players.slice(0, 5));
                    setTotalPlayers(d.players.length);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        fetch("/api/blog")
            .then((r) => r.json())
            .then((d) => {
                if (Array.isArray(d?.posts) && d.posts.length > 0) {
                    setPosts(
                        d.posts.slice(0, 3).map((p: BlogPost) => ({
                            key: p._id,
                            href: `/blog/${p.slug}`,
                            date: new Date(p.createdAt).toLocaleDateString(
                                language === "es" ? "es-AR" : "pt-BR"
                            ),
                            title: p.title?.pt || p.title?.es || "Sem título",
                            snippet: stripMarkup(
                                p.content?.pt || p.content?.es || ""
                            ).substring(0, 140),
                            example: false,
                        }))
                    );
                }
            })
            .catch(() => {});
    }, [language]);

    // Autoplay: avanza solo cada 4s; pausa en hover y reinicia el timer
    // siempre que cambia el índice (incluso al usar flechas/dots).
    useEffect(() => {
        if (proPaused) return;
        const id = setInterval(() => {
            setProIndex((i) => (i + 1) % PRO_PLAYERS.length);
        }, 4000);
        return () => clearInterval(id);
    }, [proPaused, proIndex]);

    const prevPro = () =>
        setProIndex((i) => (i - 1 + PRO_PLAYERS.length) % PRO_PLAYERS.length);
    const nextPro = () => setProIndex((i) => (i + 1) % PRO_PLAYERS.length);

    // Posts reales del blog o ejemplos del COPY bilingüe mientras no haya.
    const displayPosts: PostCard[] =
        posts ??
        c.examplePosts.map((p, i) => ({
            key: `ex-${i + 1}`,
            href: "/blog",
            date: p.date,
            title: p.title,
            snippet: p.snippet,
            example: true,
        }));

    const totalPlayersLabel = totalPlayers.toLocaleString(
        language === "es" ? "es-AR" : "pt-BR"
    );

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
                .nm-d3 { animation-delay: .24s; }
                .nm-d4 { animation-delay: .32s; }
                @keyframes nmFade { from { opacity: 0; } to { opacity: 1; } }
                .nm-fade { animation: nmFade .5s ease both; }
            `}</style>

            {/* ── Hero ───────────────────────────────────────────── */}
            <section className="relative flex min-h-[calc(100dvh-72px)] items-center justify-center overflow-hidden py-20">
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute inset-x-0 top-0 h-[55vh]"
                        style={{
                            background:
                                "radial-gradient(ellipse at 50% 0%, var(--amb), transparent 65%)",
                        }}
                    />
                    <div className="absolute left-10 top-1/4 h-96 w-96 rounded-full bg-[var(--orb1)] blur-3xl" />
                    <div className="absolute bottom-1/4 right-10 h-96 w-96 rounded-full bg-[var(--orb2)] blur-3xl" />
                </div>

                <div className="container relative z-10 mx-auto max-w-4xl px-6 text-center">
                    <div className="nm-rise mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                        <Star size={16} className="text-[var(--acc)]" />
                        <span className="text-sm font-medium text-[var(--acc)]">
                            {c.heroBadge}
                        </span>
                    </div>

                    <h1 className="nm-rise nm-d1 mb-6 text-4xl font-bold leading-tight text-[var(--h1)] md:text-6xl">
                        {c.heroTitlePre}{" "}
                        <span
                            className="text-[var(--acc)]"
                            style={{ textShadow: "var(--glow-h1)" }}
                        >
                            {c.heroTitleAccent}
                        </span>
                    </h1>

                    <p className="nm-rise nm-d2 mx-auto mb-10 max-w-2xl text-lg text-white/70 md:text-xl">
                        {c.heroSubtitle}
                    </p>

                    <div className="nm-rise nm-d3 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <a
                            href={DISCORD_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--acc)] px-8 py-3.5 font-bold text-[var(--on-acc)] transition-colors duration-300 hover:bg-[var(--acc-hover)] sm:w-auto"
                            style={glowBtn}
                        >
                            {c.heroCtaDiscord}
                            <ArrowRight size={18} />
                        </a>
                        <Link
                            href="/leaderboard"
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-8 py-3.5 font-bold text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/5 sm:w-auto"
                        >
                            {c.heroCtaLeaderboard}
                        </Link>
                    </div>

                    <div className="nm-rise nm-d4 mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                        {c.stats.map(([value, label], i) => (
                            <div key={label} className="text-center">
                                <div className="text-2xl font-bold text-white md:text-3xl">
                                    {i === 1 ? totalPlayersLabel : value}
                                </div>
                                <div className="mt-1 text-sm text-white/50">
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ───────────────────────────────────────── */}
            <section id="features" className="py-24">
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

            {/* ── Leaderboard + Dashboard (uma só box) ───────────── */}
            <section className="py-24">
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[rgb(var(--acc-rgb)_/_0.10)] blur-3xl" />
                        <div className="relative z-10 grid items-stretch lg:grid-cols-[3fr_2fr] lg:divide-x lg:divide-white/10">
                            {/* Metade 1 — Tabela das customs */}
                            <div className="flex flex-col p-8 md:p-10">
                                <div className="mb-6">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                        <Trophy size={16} className="text-[var(--acc)]" />
                                        <span className="text-sm font-medium text-[var(--acc)]">
                                            {c.lbBadge}
                                        </span>
                                    </div>
                                    <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                                        {c.lbTitle}
                                    </h2>
                                    <p className="text-white/70">{c.lbSubtitle}</p>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                                    <div className="grid grid-cols-[3rem_1fr_4rem_4rem] gap-4 border-b border-white/10 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/40 sm:grid-cols-[3rem_1fr_5rem_5rem_5rem]">
                                        <span>{c.lbCols.rank}</span>
                                        <span>{c.lbCols.player}</span>
                                        <span className="text-right">{c.lbCols.xp}</span>
                                        <span className="text-right">{c.lbCols.kills}</span>
                                        <span className="hidden text-right sm:block">
                                            {c.lbCols.games}
                                        </span>
                                    </div>
                                    {topPlayers.map((p) => (
                                        <div
                                            key={p.rank}
                                            className="grid grid-cols-[3rem_1fr_4rem_4rem] items-center gap-4 border-b border-white/5 px-5 py-3.5 last:border-b-0 sm:grid-cols-[3rem_1fr_5rem_5rem_5rem]"
                                        >
                                            <span className="font-bold text-[var(--acc)]">
                                                {p.rank}
                                            </span>
                                            <span className="truncate font-medium text-white">
                                                {p.name}
                                            </span>
                                            <span className="text-right text-white/70">
                                                {p.xp}
                                            </span>
                                            <span className="text-right text-white/70">
                                                {p.kills}
                                            </span>
                                            <span className="hidden text-right text-white/70 sm:block">
                                                {p.games}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <Link
                                        href="/leaderboard"
                                        className="inline-flex items-center gap-2 font-semibold text-[var(--acc)] transition-opacity hover:opacity-80"
                                    >
                                        {c.lbLink}
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>

                            {/* Metade 2 — CTA do dashboard */}
                            <div className="flex flex-col p-8 md:p-10">
                                <div className="mb-6">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                        <BarChart3 size={16} className="text-[var(--acc)]" />
                                        <span className="text-sm font-medium text-[var(--acc)]">
                                            {c.dashBadge}
                                        </span>
                                    </div>
                                    <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                                        {c.dashTitle}
                                    </h2>
                                    <p className="text-white/70">{c.dashSubtitle}</p>
                                </div>

                                <div className="mb-7 min-h-[220px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                                    <img
                                        src="/images/sections/dashboard_cta.png"
                                        alt={c.dashImgAlt}
                                        className="h-full w-full select-none object-cover object-top"
                                    />
                                </div>

                                <Link
                                    href="/dashboard"
                                    className="inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--acc)] px-8 py-3.5 font-bold text-[var(--on-acc)] transition-colors duration-300 hover:bg-[var(--acc-hover)]"
                                    style={glowBtn}
                                >
                                    {c.dashCta}
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Marcas + Pros (uma só box) ─────────────────────── */}
            <section className="py-24">
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[rgb(var(--acc-rgb)_/_0.10)] blur-3xl" />
                        <div className="relative z-10 grid items-stretch lg:grid-cols-2 lg:divide-x lg:divide-white/10">
                            {/* Metade 1 — Marcas */}
                            <div className="flex flex-col p-8 md:p-10">
                                <div className="mb-6">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                        <ShieldCheck size={16} className="text-[var(--acc)]" />
                                        <span className="text-sm font-medium text-[var(--acc)]">
                                            {c.brandsBadge}
                                        </span>
                                    </div>
                                    <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                                        {c.brandsTitle}
                                    </h2>
                                    <p className="text-white/70">{c.brandsSubtitle}</p>
                                </div>

                                <div className="flex flex-1 flex-col justify-center gap-5">
                                    {BRAND_LOGOS.map((brand, i) => (
                                        <div
                                            key={brand.name}
                                            className="flex items-center gap-5 rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-300 hover:border-[rgb(var(--acc-rgb)_/_0.35)]"
                                        >
                                            <img
                                                src={brand.logo}
                                                alt={brand.name}
                                                loading="lazy"
                                                className="h-12 w-12 flex-shrink-0 rounded-lg object-contain"
                                            />
                                            <div>
                                                <h3 className="mb-1 font-bold">
                                                    {brand.name}
                                                </h3>
                                                <p className="text-sm leading-relaxed text-white/60">
                                                    {c.brandsDesc[i]}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Metade 2 — Pros que jogam as customs */}
                            <div className="flex flex-col p-8 md:p-10">
                                <div className="mb-6">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                        <Users size={16} className="text-[var(--acc)]" />
                                        <span className="text-sm font-medium text-[var(--acc)]">
                                            {c.prosBadge}
                                        </span>
                                    </div>
                                    <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                                        {c.prosTitle}
                                    </h2>
                                    <p className="text-white/70">{c.prosSubtitle}</p>
                                </div>

                                <div className="flex flex-1 flex-col justify-center">
                                    <div
                                        className="group relative mx-auto w-full max-w-sm"
                                        onMouseEnter={() => setProPaused(true)}
                                        onMouseLeave={() => setProPaused(false)}
                                    >
                                        <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                                            <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                                            <img
                                                key={proIndex}
                                                src={`/images/pro-players/${PRO_PLAYERS[proIndex]}.png`}
                                                alt={PRO_PLAYERS[proIndex]}
                                                className="nm-fade h-full w-full select-none object-cover object-center"
                                            />
                                            <div className="absolute bottom-0 left-0 z-20 w-full p-6">
                                                <h3 className="text-2xl font-bold text-white">
                                                    {PRO_PLAYERS[proIndex]}
                                                </h3>
                                                <div className="mt-1.5 flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-[var(--acc)]" />
                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                                                        {c.proLabel}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={prevPro}
                                            aria-label={c.proPrev}
                                            className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-colors hover:border-[var(--acc)] hover:bg-black/70"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextPro}
                                            aria-label={c.proNext}
                                            className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-colors hover:border-[var(--acc)] hover:bg-black/70"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>

                                    <div className="mt-5 flex items-center justify-center gap-2">
                                        {PRO_PLAYERS.map((name, i) => (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => setProIndex(i)}
                                                aria-label={c.proDot(name)}
                                                className={`h-2 rounded-full transition-all ${
                                                    i === proIndex
                                                        ? "w-6 bg-[var(--acc)]"
                                                        : "w-2 bg-white/20 hover:bg-white/40"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Blog / últimas atualizações ────────────────────── */}
            <section className="py-24">
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <h2 className="mb-5 text-3xl font-bold md:text-4xl">
                            {c.blogTitle}
                        </h2>
                        <p className="text-lg text-white/70">{c.blogSubtitle}</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {displayPosts.map((post) => (
                            <Link
                                key={post.key}
                                href={post.href}
                                className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-[rgb(var(--acc-rgb)_/_0.35)]"
                            >
                                <div className="mb-4 flex items-center gap-3 text-xs text-white/40">
                                    <span>{post.date}</span>
                                    {post.example && (
                                        <span className="rounded-full border border-white/10 px-2 py-0.5 uppercase tracking-wider">
                                            {c.blogExample}
                                        </span>
                                    )}
                                </div>
                                <h3 className="mb-3 text-lg font-bold leading-snug">
                                    {post.title}
                                </h3>
                                <p className="mb-6 flex-grow text-sm leading-relaxed text-white/60">
                                    {post.snippet}
                                </p>
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--acc)] transition-all group-hover:gap-3">
                                    {c.blogReadMore}
                                    <ArrowRight size={14} />
                                </span>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <Link
                            href="/blog"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-8 py-3.5 font-bold text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/5"
                        >
                            {c.blogAll}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Discord CTA ────────────────────────────────────── */}
            <section className="pb-32 pt-8">
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
