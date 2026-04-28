import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        await connectToDB();
        const post = await BlogPost.findOne({ slug: params.slug });
        if (!post) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, post });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
