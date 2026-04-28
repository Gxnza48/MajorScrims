"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!post) return null;

    const title = post.title[language] || post.title.es || post.title.pt;
    const content = post.content[language] || post.content.es || post.content.pt;

    return (
        <article className="min-h-screen bg-[#050505] relative pt-32 pb-32">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-primary/0 to-transparent pointer-events-none opacity-60" />

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 uppercase tracking-widest text-xs font-bold">
                        <ArrowLeft size={16} /> {t.blog.back}
                    </Link>

                    <div className="flex items-center gap-6 text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 border-b border-white/5 pb-8">
                        <span className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="flex items-center gap-2"><User size={16} className="text-primary" /> {post.authorName}</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-heading font-black text-white leading-tight tracking-tight mb-16">
                        {title}
                    </h1>

                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:font-black prose-a:text-primary hover:prose-a:text-primary/80 prose-p:text-gray-300 prose-img:rounded-3xl prose-p:leading-relaxed">
                        {/* We use basic output for Markdown. To fully support markdown, next-mdx-remote or react-markdown would be used, but since we just have a text-area, standard white-space wrap is enough for basic text, or if markdown is inputted we should parse it. For now, white-space: pre-wrap suffices for line breaks. */}
                        <div style={{ whiteSpace: "pre-wrap" }}>
                            {content}
                        </div>
                    </div>
                </motion.div>
            </div>
        </article>
    );
}
