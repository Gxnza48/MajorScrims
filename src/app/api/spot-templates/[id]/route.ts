import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB, requireAdminSession } from "@/lib/db";
import { SpotTemplate } from "@/lib/models/SpotTemplate";

export const dynamic = "force-dynamic";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json({ success: false, error: "Plantilla no encontrada" }, { status: 404 });
        }

        await connectToDB();
        const deleted = await SpotTemplate.findByIdAndDelete(params.id);
        if (!deleted) {
            return NextResponse.json({ success: false, error: "Plantilla no encontrada" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
