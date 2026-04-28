"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewBlogPostPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [titleES, setTitleES] = useState("");
    const [contentES, setContentES] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const handleSave = async () => {
        if (!titleES || !contentES) {
            setErrorMsg("Por favor completa el título y el contenido.");
            return;
        }

        setIsSaving(true);
        setErrorMsg("");

        try {
            const res = await fetch("/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: titleES,
                    content: contentES,
                }),
            });
            
            const data = await res.json();
            if (data.success) {
                router.push("/dashboard/blog");
            } else {
                setErrorMsg(data.error || "Error al guardar el post.");
            }
        } catch (err) {
            setErrorMsg("Error de red.");
        }
        setIsSaving(false);
    };

    if (status === "loading") {
        return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-[#050505] relative pb-32">
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-primary/0 to-transparent pointer-events-none opacity-60" />
            
            <div className="container mx-auto max-w-3xl pt-32 px-6 relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <Link href="/dashboard/blog" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft size={16} /> Volver a los Posts
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tight">
                            Nuevo <span className="text-primary text-glow">Artículo</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-3">Escribe en español. La traducción al portugués se genera automáticamente.</p>
                    </div>
                    
                    <motion.button 
                        onClick={handleSave}
                        disabled={isSaving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-black px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(31,192,88,0.3)] hover:shadow-[0_0_30px_rgba(31,192,88,0.5)]"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? "Traduciendo y guardando..." : "Publicar Artículo"}
                    </motion.button>
                </div>

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
                        {errorMsg}
                    </div>
                )}

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-md flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Título</label>
                        <input 
                            type="text"
                            value={titleES}
                            onChange={(e) => setTitleES(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors text-lg"
                            placeholder="Ej: Nuevo Torneo Anunciado..."
                        />
                    </div>

                    <div className="flex-grow flex flex-col">
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Contenido</label>
                        <textarea 
                            value={contentES}
                            onChange={(e) => setContentES(e.target.value)}
                            className="w-full h-96 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                            placeholder="Escribe tu artículo aquí..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
