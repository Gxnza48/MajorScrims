"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Plus, RefreshCw, Save, Search, Shield, X } from "lucide-react";

export interface QualifiedRole {
    roleId: string;
    roleName: string;
}

interface GuildRole {
    id: string;
    name: string;
    color: number;
    position: number;
}

/** Discord ships role colours as a decimal int; 0 means "no colour". */
function roleColor(color: number): string {
    return color ? `#${color.toString(16).padStart(6, "0")}` : "#8b8b8b";
}

const isSnowflake = (v: string) => /^\d{5,25}$/.test(v);

/**
 * Picks which Discord roles may claim a spot in this tournament.
 *
 * Moderators create a role per event (there are pros who do not qualify and
 * non-pros who do), so this is the fast path: give the role in Discord, they can
 * spot on the map. It adds to the ticked list rather than replacing it.
 *
 * The named list comes from the bot token. Without it the ids can still be typed
 * by hand - Discord with Developer Mode on, right click the role, Copy ID - so
 * the feature works either way, just without names to click.
 */
export default function QualifiedRolesPanel({
    value,
    onChange,
    holders,
    onSave,
    saving,
}: {
    value: QualifiedRole[];
    onChange: (roles: QualifiedRole[]) => void;
    /** How many *signed-in* users already hold one of the selected roles. */
    holders?: number;
    /** Same save as the ticked list below: both live on the tournament. */
    onSave: () => void;
    saving?: boolean;
}) {
    const [roles, setRoles] = useState<GuildRole[]>([]);
    const [available, setAvailable] = useState(false);
    const [reason, setReason] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [manualId, setManualId] = useState("");
    const [manualName, setManualName] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/discord/roles");
            const data = await res.json();
            if (data.success) {
                setRoles(data.roles ?? []);
                setAvailable(!!data.available);
                setReason(data.reason ?? null);
            } else {
                setAvailable(false);
                setReason(data.error || "error");
            }
        } catch {
            setAvailable(false);
            setReason("network");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const selectedIds = useMemo(() => new Set(value.map(r => r.roleId)), [value]);

    const toggle = (role: GuildRole) => {
        if (selectedIds.has(role.id)) {
            onChange(value.filter(r => r.roleId !== role.id));
        } else {
            onChange([...value, { roleId: role.id, roleName: role.name }]);
        }
    };

    const addManual = () => {
        const id = manualId.trim();
        if (!isSnowflake(id) || selectedIds.has(id)) return;
        onChange([...value, { roleId: id, roleName: manualName.trim() || `Rol ${id}` }]);
        setManualId("");
        setManualName("");
    };

    const needle = query.trim().toLowerCase();
    const visible = needle ? roles.filter(r => r.name.toLowerCase().includes(needle)) : roles;

    return (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80">
                    <Shield size={15} className="text-primary" /> Rol de Discord que puede spotear
                </h2>
                <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${value.length > 0 ? "bg-primary/15 text-primary" : "bg-white/10 text-white/50"
                        }`}
                >
                    {value.length === 0
                        ? "sin rol"
                        : value.length === 1
                            ? "1 rol"
                            : `${value.length} roles`}
                </span>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-white/50">
                Creá un rol en Discord para este torneo, dáselo a los que clasificaron y elegilo acá.
                Cualquiera con ese rol puede marcar su spot, sin tildarlo uno por uno. Se suma a la lista
                de abajo: si a alguien se le pasó el rol, tildalo a mano igual.
            </p>

            {value.length > 0 && holders !== undefined && (
                <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs leading-relaxed text-white/60">
                    <span className="font-bold text-primary">{holders}</span> de los jugadores que ya
                    entraron a la web tienen ese rol. Los que todavía no entraron nunca no se pueden contar
                    acá, pero igual van a poder marcar su spot apenas entren.
                </p>
            )}

            {value.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {value.map(r => (
                        <span
                            key={r.roleId}
                            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 py-1 pl-3 pr-1.5 text-xs font-bold text-primary"
                        >
                            {r.roleName || r.roleId}
                            <button
                                onClick={() => onChange(value.filter(x => x.roleId !== r.roleId))}
                                aria-label={`Quitar el rol ${r.roleName || r.roleId}`}
                                className="rounded-full p-0.5 text-primary/70 transition-colors hover:bg-primary/20 hover:text-white"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-white/40">
                    <Loader2 size={16} className="animate-spin" /> Leyendo los roles del Discord...
                </div>
            ) : available ? (
                <>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                            <input
                                type="search"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Buscar un rol..."
                                className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40"
                            />
                        </div>
                        {/* A role created in Discord one minute ago is not in this
                            list until we ask again. */}
                        <button
                            onClick={load}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white transition-colors hover:border-primary/40 hover:text-primary"
                        >
                            <RefreshCw size={13} /> Recargar
                        </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10">
                        {visible.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-white/50">
                                {roles.length === 0
                                    ? "El servidor no tiene roles creados todavía."
                                    : "Ningún rol coincide con la búsqueda."}
                            </p>
                        ) : (
                            <ul className="divide-y divide-white/5">
                                {visible.map(role => (
                                    <li key={role.id}>
                                        <label
                                            className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors ${selectedIds.has(role.id) ? "bg-primary/[0.08]" : "hover:bg-white/[0.03]"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(role.id)}
                                                onChange={() => toggle(role)}
                                                aria-label={`Habilitar el rol ${role.name}`}
                                                className="h-4 w-4 shrink-0 accent-[#22D962]"
                                            />
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: roleColor(role.color) }}
                                            />
                                            <span className="truncate text-sm font-medium text-white">
                                                {role.name}
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            ) : (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
                    <p className="text-xs leading-relaxed text-white/70">
                        No podemos leer la lista de roles del Discord
                        {reason ? <span className="text-white/40"> ({reason})</span> : null}. Falta cargar{" "}
                        <code className="text-amber-400">DISCORD_BOT_TOKEN</code> en Vercel (el token del bot
                        de Major, que ya está en el server). Mientras tanto pegá el ID del rol a mano acá
                        abajo: en Discord, con el Modo Desarrollador activado, click derecho en el rol →
                        Copiar ID.
                    </p>
                </div>
            )}

            <details className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3" open={!available}>
                <summary className="cursor-pointer text-xs font-bold text-white/70">
                    Agregar un rol por ID
                </summary>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                        value={manualId}
                        onChange={e => setManualId(e.target.value)}
                        placeholder="1468328754588684421"
                        inputMode="numeric"
                        className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-primary/40"
                    />
                    <input
                        value={manualName}
                        onChange={e => setManualName(e.target.value)}
                        placeholder="Nombre del rol"
                        className="min-w-[150px] flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-primary/40"
                    />
                    <button
                        onClick={addManual}
                        disabled={!isSnowflake(manualId.trim()) || selectedIds.has(manualId.trim())}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-white transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
                    >
                        <Plus size={14} /> Agregar
                    </button>
                </div>
                {manualId.trim() && !isSnowflake(manualId.trim()) && (
                    <p className="mt-2 text-[11px] text-red-400">
                        Un ID de rol son solo números. Copiá el ID, no el nombre.
                    </p>
                )}
            </details>

            <button
                onClick={onSave}
                disabled={saving}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-50"
            >
                <Save size={15} /> {saving ? "..." : "Guardar roles"}
            </button>
        </div>
    );
}
