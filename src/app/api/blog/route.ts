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
        console.error("Failed to connect to MongoDB with Mongoose:", err);
    }
};

async function translateChunk(text: string, from: string, to: string): Promise<string> {
    try {
        const langpair = `${from}|${to}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.responseData?.translatedText || text;
    } catch {
        return text;
    }
}

async function translateLargeText(text: string, from: string, to: string): Promise<string> {
    const CHUNK_SIZE = 450;

    if (text.length <= CHUNK_SIZE) {
        return translateChunk(text, from, to);
    }

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
        const result = await translateChunk(chunk, from, to);
        translated.push(result);
        await new Promise(resolve => setTimeout(resolve, 120));
    }

    return translated.join("\n\n");
}

export async function GET(request: NextRequest) {
    try {
        await connectToDB();
        const posts = await BlogPost.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, count: posts.length, posts });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || !session.user.id) {
            return NextResponse.json({ success: false, error: "Unauthorized. Must be logged in." }, { status: 401 });
        }

        const adminDiscordIds = process.env.ADMIN_DISCORD_IDS
            ? process.env.ADMIN_DISCORD_IDS.split(",").map(id => id.trim())
            : [];

        if (!adminDiscordIds.includes(session.user.id)) {
            return NextResponse.json({ success: false, error: "Forbidden. Not a blog admin." }, { status: 403 });
        }

        const body = await request.json();
        const { title, content, blocks } = body;

        if (!title) {
            return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
        }

        const titlePT = await translateLargeText(title, "es", "pt");
        const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const slug = `${slugBase}-${Date.now()}`;

        await connectToDB();

        let postData: any = {
            title: { es: title, pt: titlePT },
            slug,
            authorId: session.user.id,
            authorName: session.user.name || "Admin",
        };

        if (blocks && Array.isArray(blocks) && blocks.length > 0) {
            const blocksES: IContentBlock[] = blocks;
            const blocksPT: IContentBlock[] = [];

            for (const block of blocksES) {
                if (block.type === "text") {
                    const translatedContent = await translateLargeText(block.content, "es", "pt");
                    blocksPT.push({ type: "text", content: translatedContent, caption: block.caption || "" });
                } else {
                    blocksPT.push({ ...block });
                }
            }

            postData.blocks = { es: blocksES, pt: blocksPT };
            postData.content = { es: "", pt: "" };
        } else {
            if (!content) {
                return NextResponse.json({ success: false, error: "Content or blocks are required" }, { status: 400 });
            }
            const contentPT = await translateLargeText(content, "es", "pt");
            postData.content = { es: content, pt: contentPT };
        }

        const newPost = new BlogPost(postData);
        await newPost.save();

        return NextResponse.json({ success: true, post: newPost }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
