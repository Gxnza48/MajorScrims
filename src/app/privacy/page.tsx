import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
    title: "Política de privacidad | Major Scrims",
    description: "Política de privacidad de Major Scrims.",
};

export default function PrivacyPage() {
    return <LegalPage slug="privacy" />;
}
