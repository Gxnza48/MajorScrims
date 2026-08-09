"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, ExternalLink, FileText, Loader2, Save } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";

type Slug = "terms" | "privacy";
type Lang = "es" | "pt";

interface PageDoc {
    title: Record<Lang, string>;
    content: Record<Lang, string>;
    customised: boolean;
}

const TABS: { slug: Slug; label: string; hint: string }[] = [
    {
        slug: "terms",
        label: "Términos del servicio",
        hint: "El link que pide Discord en Terms of Service URL: https://www.majorscrims.com/terms",
    },
    {
        slug: "privacy",
        label: "Política de privacidad",
        hint: "El link que pide Discord en Privacy Policy URL: https://www.majorscrims.com/privacy",
    },
];

const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40";

/**
 * Editor for the two legal pages. They are public URLs Discord (and Epic's
 * Brand Review) require, so they ship with real text already written and this
 * screen only exists to let a moderator adjust it.
 */
export default function LegalPagesAdmin() {
    const { status } = useSession();
    const router = useRouter();

    const [slug, setSlug] = useState<Slug>("terms");
    const [lang, setLang] = useState<Lang>("es");
    const [doc, setDoc] = useState<PageDoc | null>(null);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");

    const load = useCallback(async (which: Slug) => {
        setDoc(null);
        setNotice("");
        setError("");
        try {
            const res = await fetch(`/api/site-pages/${which}`);
            const data = await res.json();
            if (data.success) setDoc(data.page);
            else setError(data.error || "No se pudo cargar la página.");
        } catch {
            setError("Error de red.");
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated") load(slug);
    }, [status, router, load, slug]);

    const save = async () => {
        if (!doc) return;
        setSaving(true);
        setNotice("");
        setError("");
        try {
            const res = await fetch(`/api/site-pages/${slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: doc.title, content: doc.content }),
            });
            const data = await res.json();
            if (data.success) {
                setDoc(data.page);
                setNotice("Guardado. Ya está publicado en la web.");
            } else {
                setError(data.error || "No se pudo guardar.");
            }
        } catch {
            setError("Error de red.");
        }
        setSaving(false);
    };

    const active = TABS.find(tb => tb.slug === slug)!;

    return (
        <div className="min-h-screen text-white">
            <div className="container mx-auto max-w-4xl px-6 py-16">
                <Link
                    href="/dashboard"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-primary"
                >
                    <ArrowLeft size={16} /> Volver al panel
                </Link>
                <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
                    <FileText size={22} className="text-primary" /> Páginas legales
                </h1>
                <p className="mb-8 max-w-2xl text-sm leading-relaxed text-white/50">
                    Son las dos URLs públicas que pide Discord para la aplicación (y que también pide Epic
                    para el Brand Review). Ya vienen escritas y funcionando; editalas si querés cambiar algo.
                </p>

                <div className="mb-6 flex flex-wrap gap-2">
                    {TABS.map(tb => (
                        <button
                            key={tb.slug}
                            onClick={() => setSlug(tb.slug)}
                            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${slug === tb.slug
                                ? "bg-primary text-[#04130A]"
                                : "border border-white/15 text-white hover:border-primary/40"
                                }`}
                        >
                            {tb.label}
                        </button>
                    ))}
                    <Link
                        href={`/${slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white/70 transition-colors hover:border-primary/40 hover:text-primary"
                    >
                        Ver en la web <ExternalLink size={13} />
                    </Link>
                </div>

                <p className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-xs text-white/50">
                    {active.hint}
                </p>

                {error && (
                    <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}
                {notice && (
                    <div className="mb-4 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">
                        {notice}
                    </div>
                )}

                {!doc ? (
                    <Loader2 size={32} className="animate-spin text-primary" />
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex gap-2">
                                {(["es", "pt"] as Lang[]).map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setLang(l)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-colors ${lang === l
                                            ? "bg-white/15 text-white"
                                            : "border border-white/10 text-white/50 hover:text-white"
                                            }`}
                                    >
                                        {l === "es" ? "Español" : "Português"}
                                    </button>
                                ))}
                            </div>
                            {!doc.customised && (
                                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase text-white/50">
                                    texto original
                                </span>
                            )}
                        </div>

                        <label className="mb-1.5 block text-xs text-white/60">Título</label>
                        <input
                            value={doc.title[lang]}
                            onChange={e =>
                                setDoc({ ...doc, title: { ...doc.title, [lang]: e.target.value } })
                            }
                            className={`${inputClass} mb-5`}
                        />

                        <label className="mb-1.5 block text-xs text-white/60">Contenido</label>
                        {/* Remounted per language/page: the editor keeps its own
                            document, so reusing it would show the previous text. */}
                        <RichTextEditor
                            key={`${slug}-${lang}`}
                            value={doc.content[lang]}
                            onChange={html =>
                                setDoc(prev =>
                                    prev ? { ...prev, content: { ...prev.content, [lang]: html } } : prev
                                )
                            }
                            placeholder="Escribí el texto de la página..."
                        />

                        <button
                            onClick={save}
                            disabled={saving}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-50"
                        >
                            <Save size={15} /> {saving ? "..." : "Guardar"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
