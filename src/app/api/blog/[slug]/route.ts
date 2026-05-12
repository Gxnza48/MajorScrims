import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
export const dynamic = "force-dynamic";
import mongoose from "mongoose";
import { BlogPost, IContentBlock } from "@/lib/models/BlogPost";

const connectToDB = async () => {
    if (mongoose.connection.readyState === 1) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
    }
};

async function requireAdmin(session: any): Promise<boolean> {
    if (!session?.user?.id) return false;
    const adminIds = process.env.ADMIN_DISCORD_IDS?.split(",").map(id => id.trim()) ?? [];
    return adminIds.includes(session.user.id);
}

async function translateChunk(text: string, from: string, to: string): Promise<string> {
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.responseData?.translatedText || text;
    } catch {
        return text;
    }
}

async function translateLargeText(text: string, from: string, to: string): Promise<string> {
    const CHUNK_SIZE = 450;
    if (text.length <= CHUNK_SIZE) return translateChunk(text, from, to);

    const paragraphs = text.split(/\n\n+/);
    const chunks: string[] = [];
    let current = "";

    for (const para of paragraphs) {
        const joined = current ? `${current}\n\n${para}` : para;
        if (joined.length > CHUNK_SIZE && current) {
            chunks.push(current);
            current = para.length > CHUNK_SIZE ? para.slice(0, CHUNK_SIZE) : para;
        } else {
            current = joined.length > CHUNK_SIZE ? para.slice(0, CHUNK_SIZE) : joined;
        }
    }
    if (current) chunks.push(current);

    const translated: string[] = [];
    for (const chunk of chunks) {
        translated.push(await translateChunk(chunk, from, to));
        await new Promise(r => setTimeout(r, 120));
    }
    return translated.join("\n\n");
}

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        await connectToDB();
        const post = await BlogPost.findOne({ slug: params.slug });
        if (!post) return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        return NextResponse.json({ success: true, post });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!(await requireAdmin(session))) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();
        const body = await request.json();
        const { title, blocks, content } = body;

        if (!title) return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });

        const titlePT = await translateLargeText(title, "es", "pt");
        const update: any = { title: { es: title, pt: titlePT } };

        if (blocks && Array.isArray(blocks) && blocks.length > 0) {
            const blocksPT: IContentBlock[] = [];
            for (const block of blocks as IContentBlock[]) {
                if (block.type === "text") {
                    const translatedContent = await translateLargeText(block.content, "es", "pt");
                    blocksPT.push({ type: "text", content: translatedContent, caption: block.caption || "" });
                } else {
                    blocksPT.push({ ...block });
                }
            }
            update.blocks = { es: blocks, pt: blocksPT };
            update.content = { es: "", pt: "" };
        } else if (content) {
            const contentPT = await translateLargeText(content, "es", "pt");
            update.content = { es: content, pt: contentPT };
            update.blocks = undefined;
        }

        const post = await BlogPost.findOneAndUpdate(
            { slug: params.slug },
            { $set: update },
            { new: true }
        );

        if (!post) return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        return NextResponse.json({ success: true, post });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!(await requireAdmin(session))) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();
        const post = await BlogPost.findOneAndDelete({ slug: params.slug });
        if (!post) return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
