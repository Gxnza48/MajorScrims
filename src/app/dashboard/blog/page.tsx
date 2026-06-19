"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, ArrowLeft, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

export default function BlogAdminPage() {
    const { t } = useI18n();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            loadPosts();
        }
    }, [status, router]);

    const loadPosts = () => {
        fetch("/api/blog")
            .then(res => res.json())
            .then(data => {
                if (data.posts) setPosts(data.posts);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const handleDelete = async (slug: string, postId: string) => {
        if (!confirm("¿Estás seguro de eliminar este post? Esta acción no se puede deshacer.")) return;
        setDeletingId(postId);
        try {
            const res = await fetch(`/api/blog/${slug}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setPosts(prev => prev.filter(p => p._id !== postId));
            }
        } catch {}
        setDeletingId(null);
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto max-w-5xl px-6 py-16">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-10">
                    <div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-primary mb-4"
                        >
                            <ArrowLeft size={16} /> {t.admin.backToDashboard}
                        </Link>
                        <h1 className="text-3xl font-bold text-white">
                            {t.admin.blogManagement}
                        </h1>
                    </div>

                    <Link
                        href="/dashboard/blog/new"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-[#04130A] transition-colors duration-300 hover:bg-[#43E97B]"
                    >
                        <Plus size={18} /> {t.admin.newPost}
                    </Link>
                </div>

                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <FileText size={22} className="text-primary" />
                        </div>
                        <p className="text-lg font-medium text-white/60">{t.admin.noPosts}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence>
                            {posts.map(post => (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-300 hover:border-primary/35"
                                >
                                    <div className="min-w-0 flex-1 mr-6">
                                        <h3 className="mb-1 truncate text-lg font-bold text-white">
                                            {post.title?.es || post.title?.pt}
                                        </h3>
                                        <p className="text-sm text-white/40">
                                            {new Date(post.createdAt).toLocaleDateString()} · {post.authorName}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => router.push(`/dashboard/blog/edit/${post.slug}`)}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-colors duration-300 hover:bg-white/5 hover:text-white"
                                            title={t.admin.edit}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.slug, post._id)}
                                            disabled={deletingId === post._id}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-colors duration-300 hover:bg-red-500/20 disabled:opacity-40"
                                            title={t.admin.delete}
                                        >
                                            {deletingId === post._id
                                                ? <Loader2 size={16} className="animate-spin" />
                                                : <Trash2 size={18} />
                                            }
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
