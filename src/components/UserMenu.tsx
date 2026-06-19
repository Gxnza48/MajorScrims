"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

export function UserMenu() {
    const { t } = useI18n();
    const { data: session } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (session?.user) {
            fetch("/api/me/admin")
                .then(res => res.json())
                .then(data => setIsAdmin(data.isAdmin === true))
                .catch(() => {});
        }
    }, [session]);

    if (!session?.user) return null;

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                {session.user.image && (
                    <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full border border-white/10"
                    />
                )}
                <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-white">{session.user.name}</p>
                    <p className={`text-xs font-semibold ${isAdmin ? "text-primary" : "text-white/40"}`}>
                        {isAdmin ? "Admin" : "Member"}
                    </p>
                </div>
            </div>
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                title={t.common.signOut}
            >
                <LogOut size={20} />
            </button>
        </div>
    );
}
