import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
export const dynamic = "force-dynamic";
import mongoose from "mongoose";
import { BlogPost } from "@/lib/models/BlogPost";

const connectToDB = async () => {
    if (mongoose.connection.readyState === 1) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
    } catch (err) {
        console.error("Failed to connect to MongoDB with Mongoose:", err);
    }
};

async function translateText(text: string, from: string, to: string): Promise<string> {
    try {
        const langpair = `${from}|${to}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.responseData?.translatedText || text;
    } catch {
        return text; // fallback to original if translation fails
    }
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

        const adminDiscordIds = process.env.ADMIN_DISCORD_IDS ? process.env.ADMIN_DISCORD_IDS.split(",").map(id => id.trim()) : [];

        if (!adminDiscordIds.includes(session.user.id)) {
            return NextResponse.json({ success: false, error: "Forbidden. Not a blog admin." }, { status: 403 });
        }

        const body = await request.json();
        const { title, content } = body;

        // Auto-translate from Spanish to Portuguese
        const titlePT = await translateText(title, "es", "pt");
        const contentPT = await translateText(content, "es", "pt");

        // Generate slug from Spanish title
        const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const slug = `${slugBase}-${Date.now()}`;

        await connectToDB();
        
        const newPost = new BlogPost({
            title: { es: title, pt: titlePT },
            content: { es: content, pt: contentPT },
            slug,
            authorId: session.user.id,
            authorName: session.user.name || "Admin",
        });

        await newPost.save();

        return NextResponse.json({ success: true, post: newPost }, { status: 201 });
        
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
