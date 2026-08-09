import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
    title: "Términos del servicio | Major Scrims",
    description: "Términos del servicio de Major Scrims.",
};

export default function TermsPage() {
    return <LegalPage slug="terms" />;
}
