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
                    <p className={`text-xs font-bold ${isAdmin ? "text-primary" : "text-gray-500"}`}>
                        {isAdmin ? "Admin" : "Member"}
                    </p>
                </div>
            </div>
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title={t.common.signOut}
            >
                <LogOut size={20} />
            </button>
        </div>
    );
}
