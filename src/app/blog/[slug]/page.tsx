"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IContentBlock } from "@/lib/models/BlogPost";

function getYouTubeEmbedUrl(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function BlockRenderer({ block }: { block: IContentBlock }) {
    if (block.type === "text") {
        const isHtml = block.content.trim().startsWith("<");
        return isHtml ? (
            <div
                className="blog-rich-content"
                dangerouslySetInnerHTML={{ __html: block.content }}
            />
        ) : (
            <div className="leading-relaxed text-white/70" style={{ whiteSpace: "pre-wrap" }}>
                {block.content}
            </div>
        );
    }

    if (block.type === "image") {
        return (
            <figure className="my-2">
                <img
                    src={block.content}
                    alt={block.caption || ""}
                    className="w-full rounded-2xl border border-white/10 object-cover"
                />
                {block.caption && (
                    <figcaption className="mt-3 text-center text-sm italic text-white/40">
                        {block.caption}
                    </figcaption>
                )}
            </figure>
        );
    }

    if (block.type === "video") {
        const embedUrl = getYouTubeEmbedUrl(block.content);
        return (
            <figure className="my-2">
                {embedUrl ? (
                    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10">
                        <iframe
                            src={embedUrl}
                            title={block.caption || "video"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div>
                ) : (
                    <video
                        src={block.content}
                        controls
                        className="w-full rounded-2xl border border-white/10"
                    />
                )}
                {block.caption && (
                    <figcaption className="mt-3 text-center text-sm italic text-white/40">
                        {block.caption}
                    </figcaption>
                )}
            </figure>
        );
    }

    return null;
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const { t, language } = useI18n();
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/blog/${params.slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.post) {
                    setPost(data.post);
                } else {
                    router.push("/blog");
                }
                setIsLoading(false);
            })
            .catch(() => router.push("/blog"));
    }, [params.slug, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            </div>
        );
    }

    if (!post) return null;

    const title = post.title[language] || post.title.es || post.title.pt;
    const blocks: IContentBlock[] | undefined =
        post.blocks?.[language]?.length ? post.blocks[language]
        : post.blocks?.es?.length ? post.blocks.es
        : undefined;
    const legacyContent = post.content?.[language] || post.content?.es || post.content?.pt;

    return (
        <article className="relative">
            <div className="container relative z-10 mx-auto max-w-3xl px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link
                        href="/blog"
                        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-primary"
                    >
                        <ArrowLeft size={16} /> {t.blog.back}
                    </Link>

                    <h1 className="mb-6 text-3xl font-bold leading-tight text-white md:text-5xl">
                        {title}
                    </h1>

                    <div className="mb-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/10 pb-8 text-sm text-white/40">
                        <span className="flex items-center gap-2">
                            <Calendar size={16} className="text-primary" />{" "}
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2">
                            <User size={16} className="text-primary" /> {post.authorName}
                        </span>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-2xl">
                        {blocks && blocks.length > 0 ? (
                            <div className="flex flex-col gap-8">
                                {blocks.map((block, idx) => (
                                    <BlockRenderer key={idx} block={block} />
                                ))}
                            </div>
                        ) : legacyContent?.trim().startsWith("<") ? (
                            <div className="blog-rich-content" dangerouslySetInnerHTML={{ __html: legacyContent }} />
                        ) : (
                            <div style={{ whiteSpace: "pre-wrap" }} className="leading-relaxed text-white/70">
                                {legacyContent}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </article>
    );
}
