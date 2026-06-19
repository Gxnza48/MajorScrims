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

const TEMPLATES: Record<string, BlockType[]> = {
    text:           ["text"],
    textImgText:    ["text", "image", "text"],
    imgText:        ["image", "text"],
    textImg:        ["text", "image"],
    textVidText:    ["text", "video", "text"],
};

function makeBlock(type: BlockType): Block {
    return { id: `${Date.now()}-${Math.random()}`, type, content: "", caption: "" };
}

function applyTemplate(key: string): Block[] {
    return (TEMPLATES[key] ?? ["text"]).map(makeBlock);
}

const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
    text:  <Type size={16} />,
    image: <ImageIcon size={16} />,
    video: <Video size={16} />,
};

const BLOCK_ACCENTS: Record<BlockType, string> = {
    text:  "text-white/60",
    image: "text-primary",
    video: "text-primary",
};

export default function NewBlogPostPage() {
    const { t } = useI18n();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [blocks, setBlocks] = useState<Block[]>([makeBlock("text")]);
    const [activeTemplate, setActiveTemplate] = useState("text");
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    const handleTemplateSelect = (key: string) => {
        setActiveTemplate(key);
        setBlocks(applyTemplate(key));
    };

    const updateBlock = (id: string, field: keyof Block, value: string) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const moveBlock = (idx: number, dir: -1 | 1) => {
        const next = idx + dir;
        if (next < 0 || next >= blocks.length) return;
        setBlocks(prev => {
            const arr = [...prev];
            [arr[idx], arr[next]] = [arr[next], arr[idx]];
            return arr;
        });
    };

    const removeBlock = (id: string) => {
        setBlocks(prev => prev.length > 1 ? prev.filter(b => b.id !== id) : prev);
    };

    const addBlockAfter = (idx: number, type: BlockType) => {
        setBlocks(prev => {
            const arr = [...prev];
            arr.splice(idx + 1, 0, makeBlock(type));
            return arr;
        });
    };

    const handleSave = async () => {
        if (!title.trim()) {
            setErrorMsg(t.admin.errorTitle);
            return;
        }

        const hasContent = blocks.some(b => b.content.trim().length > 0);
        if (!hasContent) {
            setErrorMsg(t.admin.errorContent);
            return;
        }

        setIsSaving(true);
        setErrorMsg("");

        try {
            const res = await fetch("/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    blocks: blocks.map(({ type, content, caption }) => ({ type, content, caption })),
                }),
            });

            const data = await res.json();
            if (data.success) {
                router.push("/dashboard/blog");
            } else {
                setErrorMsg(data.error || t.admin.errorContent);
            }
        } catch {
            setErrorMsg("Error de red.");
        }
        setIsSaving(false);
    };

    if (status === "loading") {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            </div>
        );
    }

    const templates = [
        { key: "text",        label: t.admin.templateText },
        { key: "textImgText", label: t.admin.templateTextImgText },
        { key: "imgText",     label: t.admin.templateImgText },
        { key: "textImg",     label: t.admin.templateTextImg },
        { key: "textVidText", label: t.admin.templateTextVidText },
    ];

    return (
        <div className="min-h-screen">
            <div className="container mx-auto max-w-4xl px-6 py-16">
                <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <Link
                            href="/dashboard/blog"
                            className="mb-5 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-primary"
                        >
                            <ArrowLeft size={16} /> {t.admin.backToPosts}
                        </Link>
                        <h1 className="text-3xl font-bold text-white">{t.admin.newTitle}</h1>
                        <p className="mt-3 text-sm text-white/60">{t.admin.writeDescription}</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-bold text-[#04130A] transition-colors duration-300 hover:bg-[#43E97B] disabled:opacity-60"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? t.admin.publishing : t.admin.publishBtn}
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
                        <label className="mb-2 block text-sm font-medium text-white/70">{t.admin.titleLabel}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-lg text-white outline-none transition-colors placeholder-white/30 focus:border-primary/40"
                            placeholder={t.admin.titlePlaceholder}
                        />
                    </div>

                    {/* Template selector */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                        <label className="mb-4 block text-sm font-medium text-white/70">{t.admin.templateLabel}</label>
                        <div className="flex flex-wrap gap-2">
                            {templates.map(tmpl => (
                                <button
                                    key={tmpl.key}
                                    onClick={() => handleTemplateSelect(tmpl.key)}
                                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                                        activeTemplate === tmpl.key
                                            ? "border-primary/40 bg-primary/10 text-primary"
                                            : "border-white/10 bg-white/[0.03] text-white/60 hover:border-primary/35 hover:text-white"
                                    }`}
                                >
                                    {tmpl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Blocks */}
                    <div className="flex flex-col gap-4">
                        {blocks.map((block, idx) => (
                            <div key={block.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300"
                                >
                                    {/* Block header */}
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className={`flex items-center gap-2 ${BLOCK_ACCENTS[block.type]}`}>
                                            {BLOCK_ICONS[block.type]}
                                            <span className="text-sm font-medium">
                                                {block.type === "text" ? t.admin.blockText : block.type === "image" ? t.admin.blockImage : t.admin.blockVideo}
                                            </span>
                                            <span className="text-xs font-medium text-white/40">#{idx + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => moveBlock(idx, -1)}
                                                disabled={idx === 0}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                                            >
                                                <ChevronUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => moveBlock(idx, 1)}
                                                disabled={idx === blocks.length - 1}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                                            >
                                                <ChevronDown size={14} />
                                            </button>
                                            <button
                                                onClick={() => removeBlock(block.id)}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] text-red-400 transition-colors hover:bg-red-500/20 hover:text-white"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Block content */}
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
                                                <label className="mb-1 block text-sm font-medium text-white/70">
                                                    {block.type === "image" ? t.admin.imageUrl : t.admin.videoUrl}
                                                </label>
                                                <input
                                                    type="url"
                                                    value={block.content}
                                                    onChange={e => updateBlock(block.id, "content", e.target.value)}
                                                    className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder-white/30 focus:border-primary/40"
                                                    placeholder={block.type === "image" ? t.admin.imageUrlPlaceholder : t.admin.videoUrlPlaceholder}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-white/70">{t.admin.caption}</label>
                                                <input
                                                    type="text"
                                                    value={block.caption}
                                                    onChange={e => updateBlock(block.id, "caption", e.target.value)}
                                                    className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder-white/30 focus:border-primary/40"
                                                    placeholder={t.admin.caption}
                                                />
                                            </div>
                                            {block.type === "image" && block.content && (
                                                <img
                                                    src={block.content}
                                                    alt={block.caption || "preview"}
                                                    className="mt-1 max-h-48 w-full rounded-lg border border-white/10 bg-white/[0.02] object-contain"
                                                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Add block between */}
                                <div className="flex items-center gap-2 px-4 py-2">
                                    {(["text", "image", "video"] as BlockType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => addBlockAfter(idx, type)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/50 transition-colors duration-300 hover:border-primary/35 hover:text-white"
                                        >
                                            <Plus size={12} />
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
