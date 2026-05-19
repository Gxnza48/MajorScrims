"use client";

import { useState, useEffect, useCallback } from "react";
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
    `<mark style="background:rgba(13,255,81,.22);color:#0dff51;border-radius:2px;padding:0 1px">${esc(text.slice(i, i + q.length))}</mark>` +
    esc(text.slice(i + q.length))
  );
}

function rankColor(r: number) {
  if (r === 1) return "#ffd700";
  if (r === 2) return "#b0b8b0";
  if (r === 3) return "#c87533";
  return "#5a7a62";
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
    <div id="leaderboard" style={{ background: "#000", color: "#e2f0e6", fontFamily: "'Rajdhani', sans-serif", minHeight: "100vh", paddingTop: 80 }}>
      {/* Corner decorations */}
      {(["tl", "tr", "bl", "br"] as const).map((pos) => {
        const isTop = pos[0] === "t";
        const isLeft = pos[1] === "l";
        // Anchor both bars to the corner of the 52x52 box nearest the viewport
        // edge, so the L-bracket hugs the actual corner in all 4 positions.
        const vEdge = isTop ? { top: 0 } : { bottom: 0 };
        const hEdge = isLeft ? { left: 0 } : { right: 0 };
        const anchor = { ...vEdge, ...hEdge };
        return (
          <div key={pos} style={{
            position: "fixed", width: 52, height: 52, pointerEvents: "none", zIndex: 100,
            top: isTop ? 14 : undefined,
            bottom: !isTop ? 14 : undefined,
            left: isLeft ? 14 : undefined,
            right: !isLeft ? 14 : undefined,
          }}>
            <div style={{ position: "absolute", width: 2, height: 36, background: "#09c93e", ...anchor }} />
            <div style={{ position: "absolute", width: 36, height: 2, background: "#09c93e", ...anchor }} />
          </div>
        );
      })}

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
          <img src="/images/logo_full.png" alt="Major Scrims" style={{ width: 64, height: 64, objectFit: "contain", flexShrink: 0, mixBlendMode: "lighten" }} />
          <div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#09c93e", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 4 }}>{"// leaderboard"}</div>
            <h1 style={{ fontSize: "clamp(24px,4.5vw,42px)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", lineHeight: 1, margin: 0 }}>
              MAJOR <span style={{ color: "#0dff51" }}>SCRIMS</span>
            </h1>
            <div style={{ marginTop: 6, fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "#5a7a62", letterSpacing: ".1em" }}>
              SEASON 1 &nbsp;·&nbsp; {t.nav.leaderboard}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg,#09c93e,transparent)", marginBottom: 24 }} />

        {/* Discord Banner */}
        <a href="https://discord.gg/majorscrims" target="_blank" rel="noopener"
          style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", background: "#0e0e0e",
            border: "1px solid rgba(13,255,81,0.32)", borderRadius: 3, textDecoration: "none", marginBottom: 24,
            transition: "background .2s,border-color .2s,box-shadow .2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#141414"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 18px rgba(13,255,81,.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#0e0e0e"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <img src="/images/logo_full.png" alt="" style={{ width: 28, height: 28, objectFit: "contain", mixBlendMode: "lighten" }} />
            <div style={{ width: 1, height: 22, background: "rgba(13,255,81,0.32)", flexShrink: 0 }} />
            <svg width="26" height="20" viewBox="0 0 127.14 96.36" fill="#7289da">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#5a7a62", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 2 }}>{t.common.joinSquad}</div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#fff" }}>
              DISCORD <span style={{ color: "#0dff51" }}>MAJOR SCRIMS</span>
            </div>
          </div>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: "#09c93e" }}>→</span>
        </a>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <svg style={{ position: "absolute", left: 13, width: 15, height: 15, color: "#5a7a62", flexShrink: 0 }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6.5" cy="6.5" r="4.5" /><line x1="10.5" y1="10.5" x2="14.5" y2="14.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: "100%", background: "#0e0e0e", border: "1px solid rgba(13,255,81,0.32)", borderRadius: 2, padding: "11px 14px 11px 40px",
                fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 500, color: "#e2f0e6", letterSpacing: ".04em", outline: "none" }}
               placeholder={t.leaderboard.search}
            />
          </div>
          {q && (
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "#5a7a62", marginTop: 5, marginLeft: 2, letterSpacing: ".08em" }}>
              {list.length > 0
                ? <><span style={{ color: "#09c93e" }}>{list.length}</span> {list.length === 1 ? t.leaderboard.foundSingular : t.leaderboard.foundPlural}</>
                : t.leaderboard.noResults}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "#5a7a62", letterSpacing: ".08em" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0dff51", animation: "ldBlink 2s infinite" }} />
          <span>{status}</span>
        </div>

        {/* Table / State */}
        {loading ? (
          <div style={{ padding: "56px 24px", textAlign: "center", fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: "#5a7a62", letterSpacing: ".12em", border: "1px solid rgba(13,255,81,0.13)", borderRadius: 2 }}>
            {t.leaderboard.loading}
            <div style={{ display: "block", width: 22, height: 22, border: "2px solid rgba(13,255,81,0.32)", borderTopColor: "#0dff51", borderRadius: "50%", margin: "14px auto 0", animation: "ldSpin .75s linear infinite" }} />
          </div>
        ) : error ? (
          <div style={{ padding: "56px 24px", textAlign: "center", fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: "#e05050", letterSpacing: ".12em", border: "1px solid rgba(220,60,60,.2)", borderRadius: 2 }}>
            {"// " + t.leaderboard.error}<br /><br />{error}
          </div>
        ) : list.length === 0 ? (
          <div style={{ padding: "56px 24px", textAlign: "center", fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: "#5a7a62", letterSpacing: ".12em", border: "1px solid rgba(13,255,81,0.13)", borderRadius: 2 }}>
            {"// " + t.leaderboard.noResults}
          </div>
        ) : (
          <div style={{ border: "1px solid rgba(13,255,81,0.13)", borderRadius: 2, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
              <thead>
                <tr style={{ background: "#0e0e0e", borderBottom: "1px solid rgba(13,255,81,0.32)" }}>
                    { [t.leaderboard.rank, "EPIC NAME", t.leaderboard.role, t.leaderboard.xp, t.leaderboard.kills, t.leaderboard.games].map((h, i) => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: i === 0 || i >= 3 ? "center" : "left", fontFamily: "'Share Tech Mono', monospace", fontSize: 10, fontWeight: 400, letterSpacing: ".14em", textTransform: "uppercase", color: "#09c93e", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleList.map((p) => {
                  const tier = getTier(p.rank);
                  return (
                    <tr key={p.name + p.rank}
                      style={{ borderBottom: "1px solid rgba(13,255,81,0.13)", transition: "background .12s",
                        background: p.rank === 1 ? "rgba(13,255,81,.06)" : p.rank <= 3 ? "rgba(13,255,81,.03)" : "transparent" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(13,255,81,0.10)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = p.rank === 1 ? "rgba(13,255,81,.06)" : p.rank <= 3 ? "rgba(13,255,81,.03)" : "transparent"}
                    >
                      <td style={{ padding: "0 14px", height: 40, verticalAlign: "middle", fontFamily: "'Share Tech Mono', monospace", fontSize: 13, textAlign: "center", width: 54, color: rankColor(p.rank) }}>{p.rank}</td>
                      <td style={{ padding: "0 14px", height: 40, verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 15, letterSpacing: ".02em" }}>
                          {tier && <img src={tier.icon} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />}
                          <span dangerouslySetInnerHTML={{ __html: highlight(p.name, q) }} />
                        </div>
                      </td>
                      <td style={{ padding: "0 14px", height: 40, verticalAlign: "middle" }}>
                        {tier && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px 2px 4px", borderRadius: 2, fontSize: 11, fontWeight: 700, letterSpacing: ".07em", whiteSpace: "nowrap", border: `1px solid ${tier.border}`, background: `${tier.color}18`, color: tier.color }}>
                            <img src={tier.icon} alt={tier.label} style={{ width: 14, height: 14, objectFit: "contain" }} />
                            {tier.label}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "0 14px", height: 40, verticalAlign: "middle", fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: "#09c93e", textAlign: "center", width: 70 }}>{p.xp}</td>
                      <td style={{ padding: "0 14px", height: 40, verticalAlign: "middle", fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: "#5a7a62", textAlign: "center", width: 70 }}>{p.kills}</td>
                      <td style={{ padding: "0 14px", height: 40, verticalAlign: "middle", fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: "#5a7a62", textAlign: "center", width: 70 }}>{p.games}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        {!loading && !error && (
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 7 }}>
            <div style={{ width: "100%", fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#5a7a62", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 1 }}>{t.leaderboard.cargos}</div>
            {TIERS.map(t => (
              <span key={t.cls} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px 2px 4px", borderRadius: 2, fontSize: 11, fontWeight: 700, letterSpacing: ".07em", border: `1px solid ${t.border}`, background: `${t.color}18`, color: t.color }}>
                <img src={t.icon} alt={t.label} style={{ width: 14, height: 14, objectFit: "contain" }} />
                {t.label}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
