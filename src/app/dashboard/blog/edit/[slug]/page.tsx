"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Type, Image as ImageIcon, Video, ChevronUp, ChevronDown, X, Plus } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { RichTextEditor } from "@/components/RichTextEditor";

type BlockType = "text" | "image" | "video";

interface Block {
    id: string;
    type: BlockType;
    content: string;
    caption: string;
}

function makeBlock(type: BlockType, content = "", caption = ""): Block {
    return { id: `${Date.now()}-${Math.random()}`, type, content, caption };
}

const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
    text:  <Type size={16} />,
    image: <ImageIcon size={16} />,
    video: <Video size={16} />,
};

const BLOCK_COLORS: Record<BlockType, string> = {
    text:  "border-white/10 text-white/60",
    image: "border-blue-500/30 text-blue-400",
    video: "border-red-500/30 text-red-400",
};

export default function EditBlogPostPage({ params }: { params: { slug: string } }) {
    const { t } = useI18n();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [blocks, setBlocks] = useState<Block[]>([makeBlock("text")]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingPost, setIsLoadingPost] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;
        fetch(`/api/blog/${params.slug}`)
            .then(res => res.json())
            .then(data => {
                if (!data.success || !data.post) { router.push("/dashboard/blog"); return; }
                const post = data.post;
                setTitle(post.title?.es || post.title?.pt || "");

                if (post.blocks?.es?.length) {
                    setBlocks(post.blocks.es.map((b: any) => makeBlock(b.type, b.content, b.caption || "")));
                } else if (post.content?.es) {
                    setBlocks([makeBlock("text", post.content.es)]);
                }
                setIsLoadingPost(false);
            })
            .catch(() => router.push("/dashboard/blog"));
    }, [status, params.slug, router]);

    const updateBlock = (id: string, field: keyof Block, value: string) =>
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));

    const moveBlock = (idx: number, dir: -1 | 1) => {
        const next = idx + dir;
        if (next < 0 || next >= blocks.length) return;
        setBlocks(prev => { const a = [...prev]; [a[idx], a[next]] = [a[next], a[idx]]; return a; });
    };

    const removeBlock = (id: string) =>
        setBlocks(prev => prev.length > 1 ? prev.filter(b => b.id !== id) : prev);

    const addBlockAfter = (idx: number, type: BlockType) =>
        setBlocks(prev => { const a = [...prev]; a.splice(idx + 1, 0, makeBlock(type)); return a; });

    const handleSave = async () => {
        if (!title.trim()) { setErrorMsg(t.admin.errorTitle); return; }
        if (!blocks.some(b => b.content.trim())) { setErrorMsg(t.admin.errorContent); return; }

        setIsSaving(true);
        setErrorMsg("");
        try {
            const res = await fetch(`/api/blog/${params.slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    blocks: blocks.map(({ type, content, caption }) => ({ type, content, caption })),
                }),
            });
            const data = await res.json();
            if (data.success) router.push("/dashboard/blog");
            else setErrorMsg(data.error || t.admin.errorContent);
        } catch {
            setErrorMsg("Error de red.");
        }
        setIsSaving(false);
    };

    if (status === "loading" || isLoadingPost) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16">
            <div className="container relative z-10 mx-auto max-w-4xl px-6 py-16">
                <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                        <Link href="/dashboard/blog" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white">
                            <ArrowLeft size={16} /> {t.admin.backToPosts}
                        </Link>
                        <h1 className="text-3xl font-bold text-white md:text-4xl">
                            {t.admin.edit}{" "}
                            <span className="text-primary" style={{ textShadow: "0 0 36px rgba(34,217,98,0.45)" }}>
                                {t.admin.blogManagement}
                            </span>
                        </h1>
                        <p className="mt-3 text-sm text-white/60">{t.admin.writeDescription}</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-bold text-[#04130A] transition-colors duration-300 hover:bg-[#43E97B] disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? t.admin.publishing : "Guardar Cambios"}
                    </button>
                </div>

                {errorMsg && (
                    <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-400">
                        {errorMsg}
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    {/* Title */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                        <label className="mb-2 block text-sm font-medium text-white/60">{t.admin.titleLabel}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-lg text-white transition-colors duration-300 placeholder:text-white/40 focus:border-primary/40 focus:outline-none"
                            placeholder={t.admin.titlePlaceholder}
                        />
                    </div>

                    {/* Blocks */}
                    <div className="flex flex-col gap-4">
                        {blocks.map((block, idx) => (
                            <div key={block.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-2xl border bg-white/[0.03] p-6 transition-colors duration-300 ${BLOCK_COLORS[block.type]}`}
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {BLOCK_ICONS[block.type]}
                                            <span className="text-xs font-semibold uppercase tracking-wider">
                                                {block.type === "text" ? t.admin.blockText : block.type === "image" ? t.admin.blockImage : t.admin.blockVideo}
                                            </span>
                                            <span className="text-[10px] font-bold text-white/40">#{idx + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30">
                                                <ChevronUp size={14} />
                                            </button>
                                            <button onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30">
                                                <ChevronDown size={14} />
                                            </button>
                                            <button onClick={() => removeBlock(block.id)}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-red-400 transition-colors hover:bg-red-500/20 hover:text-white">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {block.type === "text" ? (
                                        <RichTextEditor
                                            key={block.id}
                                            value={block.content}
                                            onChange={html => updateBlock(block.id, "content", html)}
                                            placeholder={t.admin.contentPlaceholder}
                                        />
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-white/50">
                                                    {block.type === "image" ? t.admin.imageUrl : t.admin.videoUrl}
                                                </label>
                                                <input type="url" value={block.content}
                                                    onChange={e => updateBlock(block.id, "content", e.target.value)}
                                                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white transition-colors duration-300 placeholder:text-white/40 focus:border-primary/40 focus:outline-none"
                                                    placeholder={block.type === "image" ? t.admin.imageUrlPlaceholder : t.admin.videoUrlPlaceholder}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-white/50">{t.admin.caption}</label>
                                                <input type="text" value={block.caption}
                                                    onChange={e => updateBlock(block.id, "caption", e.target.value)}
                                                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white transition-colors duration-300 placeholder:text-white/40 focus:border-primary/40 focus:outline-none"
                                                    placeholder={t.admin.caption}
                                                />
                                            </div>
                                            {block.type === "image" && block.content && (
                                                <img src={block.content} alt={block.caption || "preview"}
                                                    className="mt-1 max-h-48 w-full rounded-lg border border-white/10 bg-white/[0.02] object-contain"
                                                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </motion.div>

                                <div className="flex items-center gap-2 px-4 py-2">
                                    {(["text", "image", "video"] as BlockType[]).map(type => (
                                        <button key={type} onClick={() => addBlockAfter(idx, type)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50 transition-colors duration-300 hover:border-primary/35 hover:text-white">
                                            <Plus size={10} />
                                            {type === "text" ? t.admin.blockText : type === "image" ? t.admin.blockImage : t.admin.blockVideo}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
