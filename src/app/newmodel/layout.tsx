import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Major Scrims — Novo design (boceto)",
    description: "Proposta de novo design para a home da Major Scrims.",
    robots: { index: false, follow: false },
};

export default function NewModelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
