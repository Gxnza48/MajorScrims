"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Type, Image as ImageIcon, Video, ChevronUp, ChevronDown, X, Plus } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

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

const BLOCK_COLORS: Record<BlockType, string> = {
    text:  "border-white/10 text-gray-400",
    image: "border-blue-500/30 text-blue-400",
    video: "border-red-500/30 text-red-400",
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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
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
        <div className="min-h-screen bg-[#050505] relative pb-32">
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-primary/0 to-transparent pointer-events-none opacity-60" />

            <div className="container mx-auto max-w-3xl pt-32 px-6 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
                    <div>
                        <Link href="/dashboard/blog" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft size={16} /> {t.admin.backToPosts}
                        </Link>
                        <h1 className="text-4xl font-heading font-black text-white uppercase tracking-tight">
                            {t.admin.newTitle.split(" ")[0]}{" "}
                            <span className="text-primary text-glow">{t.admin.newTitle.split(" ").slice(1).join(" ")}</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-3">{t.admin.writeDescription}</p>
                    </div>

                    <motion.button
                        onClick={handleSave}
                        disabled={isSaving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-black px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(34,217,98,0.3)] hover:shadow-[0_0_30px_rgba(34,217,98,0.5)] shrink-0"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? t.admin.publishing : t.admin.publishBtn}
                    </motion.button>
                </div>

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl mb-8">
                        {errorMsg}
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    {/* Title */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.admin.titleLabel}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors text-lg"
                            placeholder={t.admin.titlePlaceholder}
                        />
                    </div>

                    {/* Template selector */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                        <label className="block text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">{t.admin.templateLabel}</label>
                        <div className="flex flex-wrap gap-2">
                            {templates.map(tmpl => (
                                <button
                                    key={tmpl.key}
                                    onClick={() => handleTemplateSelect(tmpl.key)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
                                        activeTemplate === tmpl.key
                                            ? "bg-primary text-black shadow-[0_0_12px_rgba(34,217,98,0.4)]"
                                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
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
                                    className={`bg-white/[0.02] border rounded-3xl p-6 backdrop-blur-md ${BLOCK_COLORS[block.type]}`}
                                >
                                    {/* Block header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {BLOCK_ICONS[block.type]}
                                            <span className="text-xs font-black uppercase tracking-widest">
                                                {block.type === "text" ? t.admin.blockText : block.type === "image" ? t.admin.blockImage : t.admin.blockVideo}
                                            </span>
                                            <span className="text-[10px] text-gray-600 font-bold">#{idx + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => moveBlock(idx, -1)}
                                                disabled={idx === 0}
                                                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
                                            >
                                                <ChevronUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => moveBlock(idx, 1)}
                                                disabled={idx === blocks.length - 1}
                                                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
                                            >
                                                <ChevronDown size={14} />
                                            </button>
                                            <button
                                                onClick={() => removeBlock(block.id)}
                                                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500/20 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Block content */}
                                    {block.type === "text" ? (
                                        <textarea
                                            value={block.content}
                                            onChange={e => updateBlock(block.id, "content", e.target.value)}
                                            className="w-full min-h-[160px] bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors resize-y text-sm leading-relaxed"
                                            placeholder={t.admin.contentPlaceholder}
                                        />
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">
                                                    {block.type === "image" ? t.admin.imageUrl : t.admin.videoUrl}
                                                </label>
                                                <input
                                                    type="url"
                                                    value={block.content}
                                                    onChange={e => updateBlock(block.id, "content", e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                                    placeholder={block.type === "image" ? t.admin.imageUrlPlaceholder : t.admin.videoUrlPlaceholder}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">{t.admin.caption}</label>
                                                <input
                                                    type="text"
                                                    value={block.caption}
                                                    onChange={e => updateBlock(block.id, "caption", e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                                    placeholder={t.admin.caption}
                                                />
                                            </div>
                                            {block.type === "image" && block.content && (
                                                <img
                                                    src={block.content}
                                                    alt={block.caption || "preview"}
                                                    className="w-full max-h-48 object-contain rounded-xl border border-white/5 bg-black/30 mt-1"
                                                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Add block between */}
                                <div className="flex items-center gap-2 py-2 px-4">
                                    {(["text", "image", "video"] as BlockType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => addBlockAfter(idx, type)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/[0.03] text-gray-600 hover:text-white hover:bg-white/10 border border-white/5 transition-all duration-200"
                                        >
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
