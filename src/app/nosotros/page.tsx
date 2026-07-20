"use client";

import { Instagram, Twitter } from "lucide-react";
import { useI18n } from "@/i18n";

/* ──────────────────────────────────────────────────────────────────
   Nosotros / Sobre nós — panel con header titulado (fondo contrastante)
   y cuerpo en dos columnas: video grande a la izquierda, frase + redes
   a la derecha (pedido de Faus, jul 2026). En mobile se apila.
   El video se embebe directo desde Google Drive para no subir los
   ~475MB del archivo a nuestro hosting.
   ────────────────────────────────────────────────────────────────── */

// IDs de los archivos de Drive (uno por idioma). El video se embebe con
// la URL /preview de Drive dentro de un iframe.
const VIDEO_ID = {
    // Portugués — "#blackoutz 00.mp4"
    pt: "1dy-IorgF2RGoOZgyFxPr_q-n1laotFM0",
    // Español — "Gori discord final horizontal.mp4"
    es: "1XlAN_7W7Uk3hvOEIJcbA85crfdBqzKab",
} as const;

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
        url: "https://www.instagram.com/majorscrims/",
        Icon: Instagram,
    },
    {
        name: "TikTok",
        url: "https://www.tiktok.com/@majorscrims_",
        Icon: TikTokIcon,
    },
    {
        name: "X (Twitter)",
        url: "https://x.com/MajorScrims_",
        Icon: Twitter,
    },
];

// ── Copy bilingüe (PT default; ES neutro-rioplatense) ──
// Frase enviada por Faus (jul 2026). Dos párrafos.
const COPY = {
    pt: {
        kicker: "Sobre nós",
        title: "Nossa missão",
        phrase: [
            "A Major Scrims nasceu com uma missão clara: transformar em realidade o que muitos acreditam ser impossível.",
            "Porque se destacar no mundo a partir do Brasil não depende de sorte, e sim de ter as oportunidades e as ferramentas certas.",
        ],
    },
    es: {
        kicker: "Nosotros",
        title: "Nuestra misión",
        phrase: [
            "Major Scrims nació con una misión clara: convertir lo que muchos creen imposible en una realidad.",
            "Porque destacar sobre el mundo desde Brasil no depende de la suerte, sino de contar con las oportunidades y las herramientas correctas.",
        ],
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

            <section className="relative min-h-screen pb-28 pt-28 md:pt-36">
                {/* Glow ambiental suave detrás del video */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[60vh]">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(ellipse at 50% 0%, var(--amb), transparent 65%)",
                        }}
                    />
                    <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-[var(--orb1)] blur-3xl" />
                    <div className="absolute -right-24 top-8 h-96 w-96 rounded-full bg-[var(--orb2)] blur-3xl" />
                </div>

                <div className="container relative z-10 mx-auto max-w-[1360px] px-6">
                    <div className="nm-rise overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] shadow-2xl">
                        {/* ── Header con fondo contrastante ─────────────── */}
                        <div className="border-b border-white/10 bg-gradient-to-br from-[rgb(var(--acc-rgb)_/_0.16)] via-white/[0.03] to-transparent px-6 py-7 md:px-10 md:py-9">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--acc)]">
                                {c.kicker}
                            </p>
                            <h2 className="mt-2 text-3xl font-bold leading-tight text-[var(--h1)] md:text-4xl">
                                {c.title}
                            </h2>
                        </div>

                        {/* ── Cuerpo: video (izq) + frase/redes (der) ───── */}
                        <div className="grid gap-8 p-6 md:gap-12 md:p-10 lg:grid-cols-[1.8fr_1fr] lg:items-center">
                            {/* Video — más grande, a la izquierda */}
                            <div className="nm-rise nm-d1 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                                <div className="relative aspect-video w-full">
                                    <iframe
                                        key={language}
                                        src={`https://drive.google.com/file/d/${VIDEO_ID[language]}/preview`}
                                        title="Major Scrims"
                                        allow="autoplay; fullscreen"
                                        allowFullScreen
                                        className="absolute inset-0 h-full w-full"
                                    />
                                </div>
                            </div>

                            {/* Frase + redes — a la derecha */}
                            <div className="nm-rise nm-d2">
                                <div className="space-y-5">
                                    {c.phrase.map((p, i) => (
                                        <p
                                            key={i}
                                            className="text-lg font-semibold leading-snug text-[var(--h1)] md:text-xl lg:text-2xl"
                                        >
                                            {p}
                                        </p>
                                    ))}
                                </div>

                                <div className="mt-8 flex items-center gap-4">
                                    {SOCIALS.map(({ name, url, Icon }) => (
                                        <a
                                            key={name}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={name}
                                            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-colors duration-300 hover:border-[rgb(var(--acc-rgb)_/_0.4)] hover:text-[var(--acc)]"
                                        >
                                            <Icon className="h-5 w-5" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
