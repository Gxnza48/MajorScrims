"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, ArrowLeft, Save, X } from "lucide-react";
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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -mr-64 -mt-64 pointer-events-none" />

            <div className="container mx-auto max-w-5xl pt-32 pb-24 px-6 relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft size={16} /> {t.admin.backToDashboard}
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tight">
                            {t.admin.playersManagement.split(" ")[0]}{" "}
                            <span className="text-primary text-glow">{t.admin.playersManagement.split(" ").slice(1).join(" ")}</span>
                        </h1>
                    </div>

                    {!showForm && (
                        <motion.button
                            onClick={openAdd}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(34,217,98,0.3)]"
                        >
                            <Plus size={20} /> {t.admin.addPlayer}
                        </motion.button>
                    )}
                </div>

                {/* Add/Edit form */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.02] border border-primary/20 rounded-3xl p-8 backdrop-blur-md mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-heading font-black text-white uppercase">
                                {editingId ? t.admin.editPlayer : t.admin.addPlayer}
                            </h2>
                            <button onClick={cancelForm} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.admin.playerName}</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="k1nG"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.admin.playerRole}</label>
                                <input
                                    type="text"
                                    value={form.role}
                                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="proplayer"
                                />
                            </div>
                        </div>

                        <div className="mb-2">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.admin.playerImage}</label>
                            <input
                                type="text"
                                value={form.img}
                                onChange={e => setForm(f => ({ ...f, img: e.target.value }))}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="https://i.imgur.com/... o /images/pro-players/..."
                            />
                            <p className="text-[11px] text-gray-600 mt-1">{t.admin.playerImgHelp}</p>
                        </div>

                        {form.img && (
                            <div className="flex items-start gap-4 mt-4 mb-4">
                                <img
                                    src={form.img}
                                    alt={form.name}
                                    className="w-20 h-24 object-cover rounded-2xl border border-white/10 bg-black/30"
                                    onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                                />
                                <div className="text-sm text-gray-500">
                                    <p className="font-bold text-white">{form.name || "—"}</p>
                                    <p>{form.role}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <motion.button
                                onClick={handleSave}
                                disabled={saving}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(34,217,98,0.3)]"
                            >
                                <Save size={18} /> {saving ? "..." : t.admin.savePlayer}
                            </motion.button>
                            <button
                                onClick={cancelForm}
                                className="px-6 py-3 rounded-full font-bold text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
                            >
                                {t.admin.cancelEdit}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Players list */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                    {players.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-500 text-lg font-medium">{t.admin.noPlayers}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {players.map((player, i) => (
                                <motion.div
                                    key={player._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group relative"
                                >
                                    <div className="relative rounded-2xl overflow-hidden aspect-[3/4] border border-white/10 bg-black/50 hover:border-primary/40 transition-all duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                                        <img
                                            src={player.img}
                                            alt={player.name}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                            onError={e => {
                                                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133' fill='%23222'%3E%3Crect width='100%25' height='100%25'/%3E%3C/svg%3E";
                                            }}
                                        />
                                        <div className="absolute bottom-0 left-0 w-full p-3 z-20">
                                            <p className="text-xs font-black text-white uppercase tracking-tight truncate">{player.name}</p>
                                        </div>
                                        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEdit(player)}
                                                className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-black hover:bg-white transition-colors"
                                            >
                                                <Edit size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(player._id)}
                                                className="w-7 h-7 rounded-lg bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
