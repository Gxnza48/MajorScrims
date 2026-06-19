"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, ArrowLeft, Save, X, Users } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

interface Player {
    _id: string;
    name: string;
    img: string;
    role: string;
    order: number;
}

interface PlayerForm {
    name: string;
    img: string;
    role: string;
}

const emptyForm: PlayerForm = { name: "", img: "", role: "proplayer" };

export default function PlayersAdminPage() {
    const { t } = useI18n();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<PlayerForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            loadPlayers();
        }
    }, [status, router]);

    const loadPlayers = async () => {
        try {
            const res = await fetch("/api/players");
            const data = await res.json();
            if (data.players) setPlayers(data.players);
        } catch {}
        setIsLoading(false);
    };

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setShowForm(true);
    };

    const openEdit = (p: Player) => {
        setEditingId(p._id);
        setForm({ name: p.name, img: p.img, role: p.role });
        setError("");
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        setError("");
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.img.trim()) {
            setError("Nombre e imagen son requeridos.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            let res: Response;
            if (editingId) {
                res = await fetch(`/api/players/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...form, order: players.find(p => p._id === editingId)?.order ?? 0 }),
                });
            } else {
                res = await fetch("/api/players", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...form, order: players.length }),
                });
            }
            const data = await res.json();
            if (data.success) {
                await loadPlayers();
                cancelForm();
            } else {
                setError(data.error || "Error al guardar.");
            }
        } catch {
            setError("Error de red.");
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este player?")) return;
        try {
            const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) await loadPlayers();
        } catch {}
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
                {/* Header */}
                <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link
                            href="/dashboard"
                            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-primary"
                        >
                            <ArrowLeft size={16} /> {t.admin.backToDashboard}
                        </Link>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                            <Users size={16} className="text-primary" />
                            <span className="text-sm font-medium text-primary">
                                {t.admin.playersManagement}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-white md:text-4xl">
                            {t.admin.playersManagement}
                        </h1>
                    </div>

                    {!showForm && (
                        <button
                            onClick={openAdd}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-[#04130A] transition-colors duration-300 hover:bg-[#43E97B]"
                        >
                            <Plus size={20} /> {t.admin.addPlayer}
                        </button>
                    )}
                </div>

                {/* Add/Edit form */}
                {showForm && (
                    <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editingId ? t.admin.editPlayer : t.admin.addPlayer}
                            </h2>
                            <button
                                onClick={cancelForm}
                                className="text-white/60 transition-colors hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="mb-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm text-white/70">{t.admin.playerName}</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40"
                                    placeholder="k1nG"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-white/70">{t.admin.playerRole}</label>
                                <input
                                    type="text"
                                    value={form.role}
                                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40"
                                    placeholder="proplayer"
                                />
                            </div>
                        </div>

                        <div className="mb-2">
                            <label className="mb-2 block text-sm text-white/70">{t.admin.playerImage}</label>
                            <input
                                type="text"
                                value={form.img}
                                onChange={e => setForm(f => ({ ...f, img: e.target.value }))}
                                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40"
                                placeholder="https://i.imgur.com/... o /images/pro-players/..."
                            />
                            <p className="mt-1 text-[11px] text-white/40">{t.admin.playerImgHelp}</p>
                        </div>

                        {form.img && (
                            <div className="mb-4 mt-4 flex items-start gap-4">
                                <img
                                    src={form.img}
                                    alt={form.name}
                                    className="h-24 w-20 rounded-xl border border-white/10 bg-white/[0.02] object-cover"
                                    onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                                />
                                <div className="text-sm text-white/50">
                                    <p className="font-bold text-white">{form.name || "—"}</p>
                                    <p>{form.role}</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-[#04130A] transition-colors duration-300 hover:bg-[#43E97B] disabled:opacity-50"
                            >
                                <Save size={18} /> {saving ? "..." : t.admin.savePlayer}
                            </button>
                            <button
                                onClick={cancelForm}
                                className="rounded-lg border border-white/15 px-6 py-3 font-bold text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/5"
                            >
                                {t.admin.cancelEdit}
                            </button>
                        </div>
                    </div>
                )}

                {/* Players list */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                    {players.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-lg font-medium text-white/50">{t.admin.noPlayers}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {players.map((player) => (
                                <div key={player._id} className="group relative">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-colors duration-300 hover:border-primary/35">
                                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                        <img
                                            src={player.img}
                                            alt={player.name}
                                            className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
                                            onError={e => {
                                                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133' fill='%23222'%3E%3Crect width='100%25' height='100%25'/%3E%3C/svg%3E";
                                            }}
                                        />
                                        <div className="absolute bottom-0 left-0 z-20 w-full p-3">
                                            <p className="truncate text-xs font-bold text-white">{player.name}</p>
                                        </div>
                                        <div className="absolute right-2 top-2 z-20 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                onClick={() => openEdit(player)}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white transition-colors hover:border-white/30 hover:bg-white/20"
                                            >
                                                <Edit size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(player._id)}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
