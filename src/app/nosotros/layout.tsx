import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Major Scrims — Sobre nós",
    description:
        "Conheça a Major Scrims: por que treinar na comunidade líder de Fortnite competitivo do Brasil e LATAM, redes oficiais e Discord.",
};

export default function NosotrosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
