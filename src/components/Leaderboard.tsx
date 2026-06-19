"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Trophy, ArrowRight } from "lucide-react";
import { useI18n } from "../i18n";

/* ── Types ────────────────────────────────────────────────────── */
interface Player {
  name: string;
  xp: number;
  kills: number;
  games: number;
  rank: number;
}

interface LeaderboardData {
  updated: string;
  players: Player[];
}

/* ── Tier config ──────────────────────────────────────────────── */
/* Tier colors are a RANKING system (not the site theme) — each tier
   keeps its own color for its badge text/border/bg-tint. */
const TIERS = [
  { max: 10,   label: "MS Legend",      cls: "b-legend",      color: "#ffd700", border: "rgba(255,215,0,.40)", icon: "/images/rank-icons/mslegend.png" },
  { max: 100,  label: "MS Overlord",    cls: "b-overlord",    color: "#c060ff", border: "rgba(160,80,220,.45)", icon: "/images/rank-icons/msoverload.png" },
  { max: 200,  label: "MS Grandmaster", cls: "b-grandmaster", color: "#ff2d8a", border: "rgba(255,40,140,.40)", icon: "/images/rank-icons/msgrandmaster.png" },
  { max: 300,  label: "MS Master",      cls: "b-master",      color: "#ff3a3a", border: "rgba(220,40,40,.40)", icon: "/images/rank-icons/msmaster.png" },
  { max: 500,  label: "MS Diamond",     cls: "b-diamond",     color: "#50c8ff", border: "rgba(80,200,255,.40)", icon: "/images/rank-icons/msdiamond.png" },
  { max: 750,  label: "MS Gold",        cls: "b-gold",        color: "#daa800", border: "rgba(220,170,0,.40)", icon: "/images/rank-icons/msgold.png" },
  { max: 1000, label: "MS Bronze",      cls: "b-bronze",      color: "#c8703a", border: "rgba(160,90,40,.45)", icon: "/images/rank-icons/msbronze.png" },
];

function getTier(rank: number) {
  if (rank > 1000) return null;
  return TIERS.find((t) => rank <= t.max) ?? null;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(text: string, q: string): string {
  if (!q) return esc(text);
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return esc(text);
  return (
    esc(text.slice(0, i)) +
    `<mark style="background:rgba(34,217,98,.22);color:#43E97B;border-radius:2px;padding:0 1px">${esc(text.slice(i, i + q.length))}</mark>` +
    esc(text.slice(i + q.length))
  );
}

function rankColor(r: number) {
  if (r === 1) return "#FFD700";
  if (r === 2) return "#C0C7C0";
  if (r === 3) return "#C8772F";
  return undefined; // default tier -> Tailwind text-white/50
}

/* ── Component ────────────────────────────────────────────────── */
export function Leaderboard() {
  const { t } = useI18n();
  const [all, setAll] = useState<Player[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(t.leaderboard.loading);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(50);

  useEffect(() => {
    setVisibleCount(50);
  }, [query]);

  useEffect(() => {
    function handleScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        setVisibleCount((prev) => prev + 50);
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/data.json?t=" + Date.now());
        if (!res.ok) throw new Error("No se pudo cargar data.json (HTTP " + res.status + ")");
        const data: LeaderboardData = await res.json();

        // Ensure data is valid
        const players = Array.isArray(data.players) ? data.players : [];
        setAll(players);

        setStatus(players.length + " " + (players.length === 1 ? t.leaderboard.foundSingular : t.leaderboard.foundPlural) + " · updates: 03h AM (GMT-3)");
        setLoading(false);
      } catch (e: any) {
        console.error("Error loading leaderboard:", e);
        setError(e.message);
        setStatus(t.leaderboard.error);
        setLoading(false);
      }
    }
    load();
  }, []);

  const q = query.trim().toLowerCase();
  const list = q
    ? all.filter((p) => p.name && p.name.toLowerCase().includes(q))
    : all;

  const visibleList = list.slice(0, visibleCount);

  return (
    <div id="leaderboard" className="container mx-auto max-w-5xl px-6 py-12">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
          <Trophy size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            {t.nav.leaderboard}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <img
            src="/images/logo_full.png"
            alt="Major Scrims"
            className="h-12 w-12 flex-shrink-0 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold leading-tight text-white">
              {t.nav.leaderboard}
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Season 1 &nbsp;·&nbsp; Major Scrims
            </p>
          </div>
        </div>
      </div>

      {/* ── Discord Banner ──────────────────────────────────── */}
      <a
        href="https://discord.gg/majorscrims"
        target="_blank"
        rel="noopener"
        className="mb-6 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors duration-300 hover:border-primary/35"
      >
        <div className="flex flex-shrink-0 items-center gap-3">
          <img
            src="/images/logo_full.png"
            alt=""
            className="h-7 w-7 object-contain"
          />
          <div className="h-6 w-px bg-white/10" />
          <svg width="26" height="20" viewBox="0 0 127.14 96.36" fill="#5865F2">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="mb-0.5 text-xs font-medium text-white/40">
            {t.common.joinSquad}
          </div>
          <div className="text-base font-bold text-white">
            Discord <span className="text-primary">Major Scrims</span>
          </div>
        </div>
        <ArrowRight size={18} className="text-primary" />
      </a>

      {/* ── Search ──────────────────────────────────────────── */}
      <div className="mb-4">
        <div className="relative flex items-center">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 text-white/40"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 pl-11 text-base text-white placeholder:text-white/40 outline-none transition-colors duration-300 focus:border-primary/35"
            placeholder={t.leaderboard.search}
          />
        </div>
        {q && (
          <div className="ml-1 mt-2 text-sm text-white/50">
            {list.length > 0 ? (
              <>
                <span className="font-semibold text-primary">{list.length}</span>{" "}
                {list.length === 1 ? t.leaderboard.foundSingular : t.leaderboard.foundPlural}
              </>
            ) : (
              t.leaderboard.noResults
            )}
          </div>
        )}
      </div>

      {/* ── Status Bar ──────────────────────────────────────── */}
      <div className="mb-3 flex items-center gap-2.5 text-sm text-white/40">
        <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-primary" />
        <span>{status}</span>
      </div>

      {/* ── Table / State ───────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center text-sm text-white/40">
          {t.leaderboard.loading}
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-primary" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] px-6 py-16 text-center text-sm text-red-400">
          {t.leaderboard.error}
          <br />
          <br />
          {error}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center text-sm text-white/40">
          {t.leaderboard.noResults}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-white/40">
                <th className="whitespace-nowrap px-4 py-3.5 text-center">{t.leaderboard.rank}</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left">{t.leaderboard.name}</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left">{t.leaderboard.role}</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center">{t.leaderboard.xp}</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center">{t.leaderboard.kills}</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center">{t.leaderboard.games}</th>
              </tr>
            </thead>
            <tbody>
              {visibleList.map((p) => {
                const tier = getTier(p.rank);
                const rc = rankColor(p.rank);
                return (
                  <tr
                    key={p.name + p.rank}
                    className="border-b border-white/5 transition-colors duration-200 last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td
                      className="h-11 w-14 px-4 text-center align-middle font-bold"
                      style={rc ? { color: rc } : undefined}
                    >
                      <span className={rc ? "" : "text-white/50"}>{p.rank}</span>
                    </td>
                    <td className="h-11 px-4 align-middle">
                      <div className="flex items-center gap-2.5 font-medium text-white">
                        {tier && (
                          <img
                            src={tier.icon}
                            alt=""
                            className="h-6 w-6 flex-shrink-0 object-contain"
                          />
                        )}
                        <span dangerouslySetInnerHTML={{ __html: highlight(p.name, q) }} />
                      </div>
                    </td>
                    <td className="h-11 px-4 align-middle">
                      {tier && (
                        <span
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md py-0.5 pl-1 pr-2 text-[11px] font-bold tracking-wide"
                          style={{
                            border: `1px solid ${tier.border}`,
                            background: `${tier.color}18`,
                            color: tier.color,
                          }}
                        >
                          <img
                            src={tier.icon}
                            alt={tier.label}
                            className="h-3.5 w-3.5 object-contain"
                          />
                          {tier.label}
                        </span>
                      )}
                    </td>
                    <td className="h-11 w-[70px] px-4 text-center align-middle text-white/70">{p.xp}</td>
                    <td className="h-11 w-[70px] px-4 text-center align-middle text-white/70">{p.kills}</td>
                    <td className="h-11 w-[70px] px-4 text-center align-middle text-white/70">{p.games}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Legend ──────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="mt-6 flex flex-wrap gap-2">
          <div className="mb-1 w-full text-xs font-semibold uppercase tracking-wider text-white/40">
            {t.leaderboard.cargos}
          </div>
          {TIERS.map((tier) => (
            <span
              key={tier.cls}
              className="inline-flex items-center gap-1.5 rounded-md py-0.5 pl-1 pr-2 text-[11px] font-bold tracking-wide"
              style={{
                border: `1px solid ${tier.border}`,
                background: `${tier.color}18`,
                color: tier.color,
              }}
            >
              <img
                src={tier.icon}
                alt={tier.label}
                className="h-3.5 w-3.5 object-contain"
              />
              {tier.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
