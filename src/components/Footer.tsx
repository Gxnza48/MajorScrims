"use client";

import Link from "next/link";
import { useI18n } from "../i18n";
import { Twitter, Instagram } from "lucide-react";

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

const FOUNDERS = [
    {
        name: "Blxckoutz",
        handle: "@BLXCKOUTZ",
        url: "https://x.com/blxckoutz",
        avatar: "/images/avatars/blxckoutz.png",
        flag: "/images/flags/br.png",
    },
    {
        name: "Gorilon",
        handle: "@GORILONFN",
        url: "https://x.com/gorilonfn",
        avatar: "/images/avatars/gorilon.jpg",
        flag: "/images/flags/ar.png",
    },
];

export function Footer() {
    const { t } = useI18n();

    return (
        <footer className="border-t border-white/5 py-10">
            <div className="container mx-auto max-w-6xl px-6">
                {/* Fundadores */}
                <div className="mb-10 flex flex-col items-center gap-4 border-b border-white/5 pb-10">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">
                        Fundadores
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {FOUNDERS.map((f) => (
                            <a
                                key={f.handle}
                                href={f.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 transition-colors hover:border-primary/35"
                            >
                                <span className="relative shrink-0">
                                    <img
                                        src={f.avatar}
                                        alt={f.name}
                                        className="h-9 w-9 rounded-lg border border-white/10 object-cover"
                                    />
                                    <img
                                        src={f.flag}
                                        alt=""
                                        className="absolute -bottom-1 -right-1 w-3.5 rounded-sm border border-black/60"
                                    />
                                </span>
                                <span className="flex flex-col leading-tight">
                                    <span className="flex items-center gap-1 text-sm font-bold text-white">
                                        {f.handle}
                                        <img
                                            src="/images/icons/verified.png"
                                            alt="Verified"
                                            className="h-3 w-3"
                                        />
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider text-white/40 transition-colors group-hover:text-primary/80">
                                        Co-Owner
                                    </span>
                                </span>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <img
                        src="/images/logo_full.png"
                        alt="Major Scrims"
                        className="h-7 w-auto opacity-70"
                    />
                    <p className="text-xs text-white/40">
                        © {new Date().getFullYear()} Major Scrims. {t.footer.rights}
                    </p>
                    <div className="flex items-center gap-5">
                        <a
                            href="https://x.com/MajorScrims_"
                            target="_blank"
                            rel="noopener"
                            aria-label="X"
                            className="text-white/40 transition-colors hover:text-white"
                        >
                            <Twitter size={18} />
                        </a>
                        <a
                            href="https://www.instagram.com/majorscrims/"
                            target="_blank"
                            rel="noopener"
                            aria-label="Instagram"
                            className="text-white/40 transition-colors hover:text-white"
                        >
                            <Instagram size={18} />
                        </a>
                        <a
                            href="http://tiktok.com/@majorscrims_"
                            target="_blank"
                            rel="noopener"
                            aria-label="TikTok"
                            className="text-white/40 transition-colors hover:text-white"
                        >
                            <TikTokIcon className="h-4 w-4" />
                        </a>
                        <a
                            href="https://discord.gg/wyVqaAM59J"
                            target="_blank"
                            rel="noopener"
                            aria-label="Discord"
                            className="text-white/40 transition-colors hover:text-white"
                        >
                            <DiscordIcon className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                {/* Discord requires these two to be reachable public URLs. */}
                <div className="mt-6 flex justify-center gap-5 text-xs text-white/30">
                    <Link href="/terms" className="transition-colors hover:text-white">
                        Términos del servicio
                    </Link>
                    <Link href="/privacy" className="transition-colors hover:text-white">
                        Política de privacidad
                    </Link>
                </div>

                <p className="mt-4 text-center text-xs text-white/30">
                    Developed by{" "}
                    <a
                        href="https://github.com/gxnza48"
                        target="_blank"
                        rel="noopener"
                        className="transition-colors hover:text-white"
                    >
                        gxnza.48
                    </a>
                </p>
            </div>
        </footer>
    );
}
