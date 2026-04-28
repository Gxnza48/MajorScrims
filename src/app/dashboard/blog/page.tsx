"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

export default function BlogAdminPage() {
    const { t } = useI18n();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetch("/api/blog")
                .then((res) => res.json())
                .then((data) => {
                    if (data.posts) setPosts(data.posts);
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        }
    }, [status, router]);

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
            
            <div className="container mx-auto max-w-7xl pt-32 pb-24 px-6 relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft size={16} /> {t.admin.backToDashboard}
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tight">
                            {t.admin.blogManagement.split(" ")[0]} <span className="text-primary text-glow">{t.admin.blogManagement.split(" ").slice(1).join(" ")}</span>
                        </h1>
                    </div>
                    
                    <Link href="/dashboard/blog/new">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(31,192,88,0.3)] hover:shadow-[0_0_30px_rgba(31,192,88,0.5)]"
                        >
                            <Plus size={20} />
                            {t.admin.newPost}
                        </motion.button>
                    </Link>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-md">
                    {posts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 font-medium text-lg">{t.admin.noPosts}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {posts.map((post) => (
                                <motion.div 
                                    key={post._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{post.title.es || post.title.pt}</h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString()} • {post.authorName}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500/20 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
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
