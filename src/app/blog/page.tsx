"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Calendar, User, ArrowRight, Newspaper } from "lucide-react";

export default function BlogCatalogPage() {
    const { t } = useI18n();
    const { language } = useI18n();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/blog")
            .then(res => res.json())
            .then(data => {
                if (data.posts) setPosts(data.posts);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 12 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" as const },
        },
    };

    return (
        <div className="min-h-screen py-16">
            <div className="container mx-auto max-w-7xl px-6">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
                    >
                        <Newspaper size={16} className="text-primary" />
                        <span className="text-sm font-medium text-primary">Blog</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="mb-5 text-4xl font-bold leading-tight text-white md:text-5xl"
                    >
                        Major <span className="text-primary">Blog</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="mx-auto max-w-2xl text-lg text-white/70"
                    >
                        {t.blog.subtitle}
                    </motion.p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">
                        <p className="text-lg text-white/60">
                            {t.blog.noPosts}
                        </p>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {posts.map((post) => {
                            const title = post.title[language] || post.title.es || post.title.pt;
                            const contentSnippet = (post.content[language] || post.content.es || post.content.pt || "").substring(0, 150) + "...";

                            return (
                                <Link href={`/blog/${post.slug}`} key={post._id}>
                                    <motion.article
                                        variants={itemVariants}
                                        className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-primary/35"
                                    >
                                        <div className="mb-4 flex items-center gap-4 text-xs text-white/40">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-primary" />
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <User size={14} className="text-primary" />
                                                {post.authorName}
                                            </span>
                                        </div>

                                        <h2 className="mb-3 text-xl font-bold leading-snug text-white transition-colors group-hover:text-primary">
                                            {title}
                                        </h2>

                                        <p className="mb-6 line-clamp-3 flex-grow text-sm leading-relaxed text-white/60">
                                            {contentSnippet.replace(/[#_*\[\]]/g, "")}
                                        </p>

                                        <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:gap-3">
                                            {t.blog.readMore} <ArrowRight size={16} />
                                        </span>
                                    </motion.article>
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
