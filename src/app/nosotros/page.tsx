"use client";

import { Instagram, Twitter } from "lucide-react";
import { useI18n } from "@/i18n";

/* ──────────────────────────────────────────────────────────────────
   Nosotros / Sobre nós — banner hero full-width con skyline de fondo
   (silueta de edificios + glow verde en el horizonte) que se mete
   detrás del nav; debajo, video grande a la izquierda + frase/redes a
   la derecha, sueltos (pedido de Faus, jul 2026). En mobile se apila.
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
// Frase enviada por Faus (jul 2026). Cada párrafo es un array de segmentos;
// SOLO las palabras clave que marcó Faus van en negrita (b: true), el resto
// en peso normal, para darle importancia a lo remarcado.
type Seg = { t: string; b?: boolean };
type NosCopy = {
    heroPre: string;
    heroAccent: string;
    phrase: Seg[][];
    videoCaption: string;
};
const COPY: Record<"pt" | "es", NosCopy> = {
    pt: {
        heroPre: "Unidos por uma só missão:",
        heroAccent: "levar a nossa região ao topo.",
        videoCaption: "Gorilon e Blackoutz, Major Scrims Owners.",
        phrase: [
            [
                { t: "A " },
                { t: "Major Scrims", b: true },
                { t: " surgiu com uma " },
                { t: "missão clara", b: true },
                { t: ": revolucionar e transformar o " },
                { t: "cenário competitivo do Brasil", b: true },
                { t: ", criando um ambiente " },
                { t: "justo, organizado", b: true },
                { t: " e com as " },
                { t: "melhores práticas possíveis", b: true },
                { t: " para toda a comunidade." },
            ],
            [
                { t: "Porque se destacar no mundo a partir do Brasil não depende de sorte, e sim de ter as " },
                { t: "oportunidades e as ferramentas certas.", b: true },
            ],
            [
                { t: "É por isso que criamos este espaço: um lugar onde " },
                { t: "os profissionais treinam", b: true },
                { t: " até atingirem seu " },
                { t: "nível máximo", b: true },
                { t: " e os " },
                { t: "novos talentos se destacam", b: true },
                { t: ". Ambos, unidos por um mesmo objetivo: " },
                { t: "chegar ao topo", b: true },
                { t: "." },
            ],
        ],
    },
    es: {
        heroPre: "Unidos por una sola misión:",
        heroAccent: "llevar nuestra región a lo más alto.",
        videoCaption: "Gorilon y Blackoutz, Major Scrims Owners.",
        phrase: [
            [
                { t: "Major Scrims", b: true },
                { t: " nació con una " },
                { t: "misión clara", b: true },
                { t: ": Revolucionar y transformar la " },
                { t: "escena competitiva de Brasil", b: true },
                { t: ", construyendo un entorno " },
                { t: "justo, organizado", b: true },
                { t: " y con la " },
                { t: "mejor práctica posible", b: true },
                { t: " para toda la comunidad." },
            ],
            [
                { t: "Porque destacar sobre el mundo desde Brasil no depende de la suerte, sino de contar con las " },
                { t: "oportunidades y las herramientas correctas.", b: true },
            ],
            [
                { t: "Por eso construimos este espacio: un lugar donde " },
                { t: "los pros practican", b: true },
                { t: " hasta alcanzar su " },
                { t: "máximo nivel", b: true },
                { t: " y los " },
                { t: "nuevos talentos se dan a conocer", b: true },
                { t: ". Ambos, unidos por un mismo objetivo: " },
                { t: "llegar a lo más alto", b: true },
                { t: "." },
            ],
        ],
    },
};

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

            {/* ── Hero banner full-width con skyline, pegado al nav ────── */}
            {/* -mt-[88px] sube el banner detrás del nav (alto del nav = 88px),
                y el pt del contenido baja el título para que no lo tape. */}
            <section className="relative -mt-[88px] overflow-hidden">
                {/* Gradiente base oscuro */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to bottom, var(--bg1), var(--bg2))",
                    }}
                />
                {/* Glow verde en el horizonte, detrás de la silueta */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(120% 85% at 50% 100%, rgb(var(--acc-rgb) / 0.35), transparent 62%)",
                    }}
                />
                {/* Skyline de edificios (silueta negra), anclado abajo y a lo ancho */}
                <div
                    className="pointer-events-none absolute inset-0 bg-cover bg-bottom bg-no-repeat"
                    style={{ backgroundImage: "url('/images/nosotros-city.png')" }}
                />
                {/* Difuminado inferior: funde el skyline con la página (sin línea dura) */}
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
                    style={{
                        background: "linear-gradient(to bottom, transparent, var(--bg2))",
                    }}
                />

                <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-[108px] text-center md:pb-24 md:pt-[148px]">
                    <h1 className="nm-rise text-4xl font-bold leading-tight text-[var(--h1)] md:text-6xl">
                        {c.heroPre}{" "}
                        <span
                            className="text-[var(--acc)]"
                            style={{ textShadow: "var(--glow-h1)" }}
                        >
                            {c.heroAccent}
                        </span>
                    </h1>
                </div>
            </section>

            {/* ── Video (izq) + frase/redes (der) — sueltos, sin caja ── */}
            <section className="relative py-20 md:py-24">
                <div className="container mx-auto max-w-[1360px] px-6">
                    <div className="grid gap-8 md:gap-12 lg:grid-cols-[1.9fr_1fr] lg:items-start">
                        {/* Video — más grande, a la izquierda, con pie de foto */}
                        <div className="nm-rise nm-d1">
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
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
                            <p className="mt-3 flex items-center gap-2 text-sm text-white/50">
                                <span className="h-px w-6 bg-[rgb(var(--acc-rgb)_/_0.6)]" />
                                {c.videoCaption}
                            </p>
                        </div>

                        {/* Frase + redes — a la derecha */}
                        <div className="nm-rise nm-d2">
                            <div className="space-y-5">
                                {c.phrase.map((para, i) => (
                                    <p
                                        key={i}
                                        className="text-lg leading-relaxed text-white/70 md:text-xl"
                                    >
                                        {para.map((seg, j) =>
                                            seg.b ? (
                                                <strong
                                                    key={j}
                                                    className="font-bold text-white"
                                                >
                                                    {seg.t}
                                                </strong>
                                            ) : (
                                                <span key={j}>{seg.t}</span>
                                            )
                                        )}
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
            </section>
        </div>
    );
}
