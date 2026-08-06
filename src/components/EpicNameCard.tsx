"use client";

import { useEffect, useState } from "react";
import { Gamepad2, Save, Check } from "lucide-react";
import { useI18n } from "@/i18n";

/**
 * Lets a player store the Epic name moderators see in the tournament roster.
 * Without it a pro shows up as "sin nombre de Epic cargado" and the moderator
 * cannot match them against Fortnite's official qualified list.
 */
export function EpicNameCard() {
    const { t } = useI18n();
    const [epicName, setEpicName] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    useEffect(() => {
        fetch("/api/me/profile")
            .then(res => res.json())
            .then(data => setEpicName(data.epicName || ""))
            .catch(() => { })
            .finally(() => setLoaded(true));
    }, []);

    const save = async () => {
        setSaving(true);
        setJustSaved(false);
        try {
            const res = await fetch("/api/me/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ epicName }),
            });
            const data = await res.json();
            if (data.success) {
                setEpicName(data.epicName);
                setJustSaved(true);
                setTimeout(() => setJustSaved(false), 2500);
            }
        } catch {
            /* the next save retries */
        }
        setSaving(false);
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-colors duration-300 hover:border-primary/35">
            <Gamepad2 className="mb-6 text-primary" size={32} />
            <h4 className="mb-3 text-lg font-bold text-white">{t.tournaments.epicCardTitle}</h4>
            <p className="mb-4 text-sm leading-relaxed text-white/60">{t.tournaments.epicCardDesc}</p>

            <input
                type="text"
                value={epicName}
                onChange={e => setEpicName(e.target.value)}
                disabled={!loaded}
                placeholder="Peterbot"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40 disabled:opacity-50"
            />

            <button
                onClick={save}
                disabled={saving || !loaded}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-50"
            >
                {justSaved ? <Check size={15} /> : <Save size={15} />}
                {saving ? "..." : justSaved ? t.tournaments.saved : t.tournaments.save}
            </button>
        </div>
    );
}
