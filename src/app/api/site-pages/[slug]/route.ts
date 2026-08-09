import { NextRequest, NextResponse } from "next/server";
import { connectToDB, requireAdminSession } from "@/lib/db";
import { SitePage } from "@/lib/models/SitePage";
import { isSitePageSlug, SITE_PAGE_SEEDS } from "@/lib/sitePages";

export const dynamic = "force-dynamic";

const MAX_CONTENT = 80_000;

/**
 * Reads a legal page. Public: Discord and Epic have to be able to open these
 * URLs without an account. Falls back to the seeded text so /terms and /privacy
 * are never blank, even before a moderator saves them the first time.
 */
export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        if (!isSitePageSlug(params.slug)) {
            return NextResponse.json({ success: false, error: "Página no encontrada" }, { status: 404 });
        }

        await connectToDB();
        const page = await SitePage.findOne({ slug: params.slug });
        const seed = SITE_PAGE_SEEDS[params.slug];

        return NextResponse.json({
            success: true,
            page: {
                slug: params.slug,
                title: {
                    es: page?.title?.es || seed.title.es,
                    pt: page?.title?.pt || seed.title.pt,
                },
                content: {
                    es: page?.content?.es || seed.content.es,
                    pt: page?.content?.pt || seed.content.pt,
                },
                updatedAt: page?.updatedAt ? page.updatedAt.toISOString() : null,
                /** False = still showing the text this site shipped with. */
                customised: !!page,
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

/** Admin edit. The HTML comes from the same editor the blog uses. */
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
        if (!isSitePageSlug(params.slug)) {
            return NextResponse.json({ success: false, error: "Página no encontrada" }, { status: 404 });
        }

        const body = await request.json();
        const seed = SITE_PAGE_SEEDS[params.slug];
        const text = (v: unknown, fallback: string, max: number) => {
            const s = String(v ?? "").trim();
            return s ? s.slice(0, max) : fallback;
        };

        await connectToDB();
        const page = await SitePage.findOneAndUpdate(
            { slug: params.slug },
            {
                slug: params.slug,
                title: {
                    es: text(body?.title?.es, seed.title.es, 120),
                    pt: text(body?.title?.pt, seed.title.pt, 120),
                },
                content: {
                    es: text(body?.content?.es, seed.content.es, MAX_CONTENT),
                    pt: text(body?.content?.pt, seed.content.pt, MAX_CONTENT),
                },
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            page: {
                slug: page.slug,
                title: page.title,
                content: page.content,
                updatedAt: page.updatedAt ? page.updatedAt.toISOString() : null,
                customised: true,
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
