"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { renderRichLinks } from "@/lib/richLinks";

interface Page {
    title: { es: string; pt: string };
    content: { es: string; pt: string };
    updatedAt: string | null;
}

/**
 * Renders /terms and /privacy. Both are one editable document each, written
 * from the dashboard with the same editor the blog uses, so this only fetches
 * and prints it in the reader's language.
 */
export default function LegalPage({ slug }: { slug: "terms" | "privacy" }) {
    const { language } = useI18n();
    const [page, setPage] = useState<Page | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        fetch(`/api/site-pages/${slug}`)
            .then(res => res.json())
            .then(data => (data.success ? setPage(data.page) : setFailed(true)))
            .catch(() => setFailed(true));
    }, [slug]);

    const back = language === "pt" ? "Voltar ao início" : "Volver al inicio";
    const updated = language === "pt" ? "Atualizado em" : "Actualizado el";

    return (
        <div className="min-h-screen text-white">
            <div className="container mx-auto max-w-3xl px-6 py-16">
                <Link
                    href="/"
                    className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-primary"
                >
                    <ArrowLeft size={16} /> {back}
                </Link>

                {failed ? (
                    <p className="text-sm text-red-400">
                        {language === "pt"
                            ? "Não foi possível carregar esta página."
                            : "No se pudo cargar esta página."}
                    </p>
                ) : !page ? (
                    <Loader2 size={32} className="animate-spin text-primary" />
                ) : (
                    <>
                        <h1 className="mb-4 text-3xl font-bold leading-tight text-white md:text-5xl">
                            {page.title[language] || page.title.es}
                        </h1>
                        {page.updatedAt && (
                            <p className="mb-10 border-b border-white/10 pb-8 text-sm text-white/40">
                                {updated}{" "}
                                {new Date(page.updatedAt).toLocaleDateString(
                                    language === "pt" ? "pt-BR" : "es-AR"
                                )}
                            </p>
                        )}
                        <div
                            className="blog-rich-content leading-relaxed text-white/70"
                            dangerouslySetInnerHTML={{
                                __html: renderRichLinks(page.content[language] || page.content.es),
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
