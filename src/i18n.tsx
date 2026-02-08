import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'pt' | 'es';

type Translations = {
    nav: {
        home: string;
        about: string;
        players: string;
        community: string;
        join: string;
    };
    hero: {
        title: string;
        subtitle: string;
        cta: string;
    };
    about: {
        title: string;
        description: string;
    };
    players: {
        title: string;
    };
    features: {
        title: string;
        scrims: string;
        scrimsDesc: string;
        customs: string;
        customsDesc: string;
        rules: string;
        rulesDesc: string;
        moderation: string;
        moderationDesc: string;
    };
    footer: {
        rights: string;
    };
};

const translations: Record<Language, Translations> = {
    pt: {
        nav: {
            home: 'Início',
            about: 'Sobre',
            players: 'Pro Players',
            community: 'Comunidade',
            join: 'Discord',
        },
        hero: {
            title: 'MAJOR SCRIMS',
            subtitle: 'Elite Fortnite Scrims & Customs – Servidores Brasil',
            cta: 'Entrar no Discord',
        },
        about: {
            title: 'Sobre a Major',
            description: 'A Major Scrims é a comunidade de elite para treinos de Fortnite no Brasil. Focada em jogadores competitivos e profissionais, oferecemos um ambiente sério, organizado e com regras rigorosas para garantir a melhor qualidade de treino.',
        },
        players: {
            title: 'Destaques Pro',
        },
        features: {
            title: 'Por que a Major?',
            scrims: 'Scrims Organizadas',
            scrimsDesc: 'Lobbies balanceados e horários fixos para maximizar seu treino.',
            customs: 'Customs Diárias',
            customsDesc: 'Partidas personalizadas todos os dias com formatos competitivos.',
            rules: 'Regras Competitivas',
            rulesDesc: 'Regulamento alinhado com os torneios oficiais da Epic Games.',
            moderation: 'Moderação Ativa',
            moderationDesc: 'Staff dedicada para banir griefers e manter a qualidade.',
        },
        footer: {
            rights: 'Todos os direitos reservados.',
        },
    },
    es: {
        nav: {
            home: 'Inicio',
            about: 'Sobre',
            players: 'Pro Players',
            community: 'Comunidad',
            join: 'Discord',
        },
        hero: {
            title: 'MAJOR SCRIMS',
            subtitle: 'Scrims y Customs de Elite de Fortnite – Servidores de Brasil',
            cta: 'Unirse a Discord',
        },
        about: {
            title: 'Sobre Major',
            description: 'Major Scrims es la comunidad de élite para prácticas de Fortnite en Brasil. Enfocada en jugadores competitivos y profesionales, ofrecemos un ambiente serio, organizado y con reglas estrictas para garantizar la mejor calidad de entrenamiento.',
        },
        players: {
            title: 'Destacados Pro',
        },
        features: {
            title: '¿Por qué Major?',
            scrims: 'Scrims Organizadas',
            scrimsDesc: 'Lobbies balanceados y horarios fijos para maximizar tu entrenamiento.',
            customs: 'Customs Diarias',
            customsDesc: 'Partidas personalizadas todos los días con formatos competitivos.',
            rules: 'Reglas Competitivas',
            rulesDesc: 'Reglamento alineado con los torneos oficiales de Epic Games.',
            moderation: 'Moderación Activa',
            moderationDesc: 'Staff dedicado para banear griefers y mantener la calidad.',
        },
        footer: {
            rights: 'Todos los derechos reservados.',
        },
    },
};

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('pt');

    const value = {
        language,
        setLanguage,
        t: translations[language],
    };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within a I18nProvider');
    }
    return context;
};
