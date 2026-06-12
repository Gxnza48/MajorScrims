"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

// /newmodel is a self-contained design mockup with its own nav/footer,
// so the global chrome is hidden there.
export function Chrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const standalone = pathname?.startsWith("/newmodel");

    return (
        <>
            {!standalone && <Navbar />}
            <main>{children}</main>
            {!standalone && <Footer />}
        </>
    );
}
