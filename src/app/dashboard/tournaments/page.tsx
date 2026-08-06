"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Trophy, MapPin, Download, EyeOff } from "lucide-react";

interface TournamentRow {
    id: string;
    slug: string;
    name: string;
    poster: string;
    mode: string;
    teamSize: string;
    region: string;
    start: string;
    end: string;
    status: string;
    published: boolean;
    windowCount: number;
}

interface Form {
    name: string;
    poster: string;
    mode: string;
    teamSize: string;
    region: string;
    start: string;
    end: string;
    published: boolean;
}

const MODES = ["Build", "Zero Build", "Reload"];
const TEAM_SIZES = ["Solo", "Duos", "Trios", "Squads"];

const emptyForm: Form = {
    name: "",
    poster: "",
    mode: "Build",
    teamSize: "Solo",
    region: "BR",
    start: "",
    end: "",
    published: true,
};

/** ISO -> value accepted by <input type="datetime-local"> in the admin's own timezone. */
function toInputValue(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40";

export default function TournamentsAdminPage() {
    const { status } = useSession();
    const router = useRouter();

    const [rows, setRows] = useState<TournamentRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [form, setForm] = useState<Form>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/tournaments?all=1");
            const data = await res.json();
            if (data.success) setRows(data.tournaments);
            else setError(data.error || "No se pudieron cargar los torneos.");
        } catch {
            setError("Error de red al cargar los torneos.");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated") load();
    }, [status, router, load]);

    const openAdd = () => {
        setEditingSlug(null);
        setForm(emptyForm);
        setError("");
        setShowForm(true);
    };

    const openEdit = (t: TournamentRow) => {
        setEditingSlug(t.slug);
        setForm({
            name: t.name,
            poster: t.poster,
            mode: t.mode,
            teamSize: t.teamSize,
            region: t.region,
            start: toInputValue(t.start),
            end: toInputValue(t.end),
            published: t.published,
        });
        setError("");
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingSlug(null);
        setForm(emptyForm);
        setError("");
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.start || !form.end) {
            setError("Nombre, inicio y fin son requeridos.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const payload = {
                ...form,
                start: new Date(form.start).toISOString(),
                end: new Date(form.end).toISOString(),
            };
            const res = await fetch(
                editingSlug ? `/api/tournaments/${editingSlug}` : "/api/tournaments",
                {
                    method: editingSlug ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();
            if (data.success) {
                await load();
                cancelForm();
            } else {
                setError(data.error || "Error al guardar.");
            }
        } catch {
            setError("Error de red.");
        }
        setSaving(false);
    };

    const handleDelete = async (t: TournamentRow) => {
        if (!confirm(`¿Eliminar "${t.name}"? Se borran también sus spots reclamados.`)) return;
        try {
            const res = await fetch(`/api/tournaments/${t.slug}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) await load();
            else setError(data.error || "No se pudo eliminar.");
        } catch {
            setError("Error de red.");
        }
    };

    const handleImport = async (templates: boolean) => {
        setImporting(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch(`/api/tournaments/import${templates ? "?templates=1" : ""}`, {
                method: "POST",
            });
            const data = await res.json();
            if (data.success) {
                if (data.imported > 0) {
                    const parts = [
                        `Importados ${data.imported} torneos${templates ? " como borrador" : ""}.`,
                        data.skipped ? `${data.skipped} ya existían.` : "",
                        // never let a silent cap look like full coverage
                        data.truncatedWindows
                            ? `${data.truncatedWindows} tenían más de ${data.maxWindows} rondas y se recortaron.`
                            : "",
                        templates ? "Revisá las fechas antes de publicarlos." : "",
                    ];
                    setNotice(parts.filter(Boolean).join(" "));
                } else {
                    setNotice(
                        templates
                            ? "No quedó nada nuevo por importar del snapshot."
                            : "El snapshot no tiene torneos vigentes. Usá «traer plantillas» para partir de los torneos BR reales."
                    );
                }
                await load();
            } else {
                setError(data.error || "No se pudo importar.");
            }
        } catch {
            setError("Error de red al importar.");
        }
        setImporting(false);
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            <div className="container mx-auto max-w-5xl px-6 py-16">
                <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link
                            href="/dashboard"
                            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-primary"
                        >
                            <ArrowLeft size={16} /> Volver al dashboard
                        </Link>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                            <Trophy size={16} className="text-primary" />
                            <span className="text-sm font-medium text-primary">Gestión de torneos</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white md:text-4xl">Torneos</h1>
                    </div>

                    {!showForm && (
                        <button
                            onClick={openAdd}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-[#04130A] transition-colors duration-300 hover:bg-[#43E97B]"
                        >
                            <Plus size={20} /> Nuevo torneo
                        </button>
                    )}
                </div>

                {(error || notice) && (
                    <div
                        className={`mb-6 rounded-lg border px-4 py-3 text-sm ${error
                                ? "border-red-500/20 bg-red-500/10 text-red-400"
                                : "border-primary/20 bg-primary/10 text-primary"
                            }`}
                    >
                        {error || notice}
                    </div>
                )}

                {showForm && (
                    <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editingSlug ? "Editar torneo" : "Nuevo torneo"}
                            </h2>
                            <button onClick={cancelForm} className="text-white/60 transition-colors hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4 grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm text-white/70">Nombre</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className={inputClass}
                                    placeholder="EWC Reload Elite Series"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm text-white/70">Poster (URL)</label>
                                <input
                                    type="text"
                                    value={form.poster}
                                    onChange={e => setForm(f => ({ ...f, poster: e.target.value }))}
                                    className={inputClass}
                                    placeholder="https://cdn2.unrealengine.com/..."
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-white/70">Modo</label>
                                <select
                                    value={form.mode}
                                    onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
                                    className={inputClass}
                                >
                                    {MODES.map(m => (
                                        <option key={m} value={m} className="bg-[#0B1F14]">
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-white/70">Formato</label>
                                <select
                                    value={form.teamSize}
                                    onChange={e => setForm(f => ({ ...f, teamSize: e.target.value }))}
                                    className={inputClass}
                                >
                                    {TEAM_SIZES.map(s => (
                                        <option key={s} value={s} className="bg-[#0B1F14]">
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-white/70">Inicio</label>
                                <input
                                    type="datetime-local"
                                    value={form.start}
                                    onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-white/70">Fin</label>
                                <input
                                    type="datetime-local"
                                    value={form.end}
                                    onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-white/70">Región</label>
                                <input
                                    type="text"
                                    value={form.region}
                                    onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                                    className={inputClass}
                                    placeholder="BR"
                                />
                            </div>
                            <label className="flex items-end gap-3 pb-2 text-sm text-white/70">
                                <input
                                    type="checkbox"
                                    checked={form.published}
                                    onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                                    className="h-4 w-4 accent-[#22D962]"
                                />
                                Visible en la web
                            </label>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-[#04130A] transition-colors duration-300 hover:bg-[#43E97B] disabled:opacity-50"
                            >
                                <Save size={18} /> {saving ? "..." : "Guardar"}
                            </button>
                            <button
                                onClick={cancelForm}
                                className="rounded-lg border border-white/15 px-6 py-3 font-bold text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/5"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                    {rows.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="mb-2 text-lg font-medium text-white/50">Todavía no hay torneos cargados.</p>
                            <p className="mx-auto mb-6 max-w-md text-sm text-white/40">
                                Podés crear uno a mano, o traer las plantillas de los torneos oficiales BR
                                (nombre, poster, modo y rondas ya cargados) y solo corregir las fechas.
                            </p>
                            <button
                                onClick={() => handleImport(true)}
                                disabled={importing}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-primary/40 disabled:opacity-50"
                            >
                                <Download size={16} /> {importing ? "Importando..." : "Traer plantillas de torneos BR"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rows.map(t => (
                                <div
                                    key={t.id}
                                    className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center"
                                >
                                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
                                        {t.poster ? (
                                            <img src={t.poster} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Trophy size={20} className="text-white/20" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate font-bold text-white">{t.name}</p>
                                            {!t.published && (
                                                <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[11px] font-bold uppercase text-white/50">
                                                    <EyeOff size={10} /> borrador
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-white/50">
                                            {t.status} · {t.mode} · {t.teamSize} · {t.region} ·{" "}
                                            {t.windowCount} {t.windowCount === 1 ? "ventana" : "ventanas"}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 gap-2">
                                        <Link
                                            href={`/dashboard/tournaments/${t.slug}`}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white transition-colors hover:border-primary/40 hover:text-primary"
                                        >
                                            <MapPin size={14} /> Ventanas y mapa
                                        </Link>
                                        <button
                                            onClick={() => openEdit(t)}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition-colors hover:border-white/30 hover:bg-white/10"
                                            aria-label={`Editar ${t.name}`}
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(t)}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                                            aria-label={`Eliminar ${t.name}`}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4">
                                <button
                                    onClick={() => handleImport(true)}
                                    disabled={importing}
                                    className="inline-flex items-center gap-2 text-xs font-medium text-white/40 transition-colors hover:text-primary disabled:opacity-50"
                                >
                                    <Download size={14} />{" "}
                                    {importing ? "Importando..." : "Traer plantillas de torneos BR"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
