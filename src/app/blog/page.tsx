"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function BlogCatalogPage() {
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
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" as const },
        },
    };

    return (
        <div className="min-h-screen bg-[#050505] relative pt-32 pb-24">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full -mr-96 -mt-96 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-20">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 uppercase tracking-tighter"
                    >
                        Major <span className="text-primary text-glow">Blog</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        {language === 'es' 
                            ? 'Noticias, anuncios y actualizaciones oficiales del campeonato.'
                            : 'Notícias, anúncios e atualizações oficiais do campeonato.'}
                    </motion.p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-md">
                        <p className="text-gray-400 text-lg uppercase tracking-widest font-bold">
                            {language === 'es' ? 'Próximamente nuevos artículos' : 'Em breve novos artigos'}
                        </p>
                    </div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {posts.map((post) => {
                            const title = post.title[language] || post.title.es || post.title.pt;
                            const contentSnippet = (post.content[language] || post.content.es || post.content.pt || "").substring(0, 150) + "...";
                            
                            return (
                                <Link href={`/blog/${post.slug}`} key={post._id}>
                                    <motion.article 
                                        variants={itemVariants}
                                        className="h-full group relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col hover:border-primary/30 transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        <div className="relative z-10 flex-grow">
                                            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                                                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1.5"><User size={14} className="text-primary" /> {post.authorName}</span>
                                            </div>
                                            
                                            <h2 className="text-2xl font-black text-white font-heading tracking-tight mb-4 group-hover:text-primary transition-colors">
                                                {title}
                                            </h2>
                                            
                                            <p className="text-gray-400 line-clamp-3 text-sm leading-relaxed mb-8">
                                                {contentSnippet.replace(/[#_*\[\]]/g, "")}
                                            </p>
                                        </div>

                                        <div className="mt-auto relative z-10 flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest group-hover:gap-4 transition-all">
                                            {language === 'es' ? 'Leer más' : 'Ler mais'} <ArrowRight size={16} />
                                        </div>
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
