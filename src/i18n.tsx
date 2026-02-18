"use client";

import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'pt' | 'es';

type Translations = {
    nav: {
        home: string;
        about: string;
        players: string;
        tournaments: string;
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
    tournaments: {
        title: string;
        subtitle: string;
        status: {
            upcoming: string;
            live: string;
            completed: string;
        }
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
    community: {
        title: string;
        description: string;
        cta: string;
    };
    stats: {
        title: string;
        subtitle: string;
        cta: string;
    };
    dashboard: {
        title: string;
        welcome: string;
        lifetimeStats: string;
        exampleData: string;
        totalMatches: string;
        totalKills: string;
        winRate: string;
        kdRatio: string;
        avgPlacement: string;
        placementRate: string;
        recentForm: string;
        thisWeek: string;
        vsLastSeason: string;
        positionsUp: string;
        performance: string;
        ranking: string;
    };
};

const translations: Record<Language, Translations> = {
    pt: {
        nav: {
            home: 'Início',
            about: 'Sobre',
            players: 'Pro Players',
            tournaments: 'Torneios',
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
        tournaments: {
            title: 'Torneios Oficiais',
            subtitle: 'Acompanhe os próximos campeonatos e eventos da região Brasil.',
            status: {
                upcoming: 'Em Breve',
                live: 'Ao Vivo',
                completed: 'Finalizado',
            }
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
        community: {
            title: 'Não tem com quem jogar?',
            description: 'No Discord você pode encontrar milhares de jogadores sozinhos que buscam constantemente com quem praticar para extrair seu melhor potencial.',
            cta: 'Encontrar Parceiros',
        },
        stats: {
            title: 'Sua Evolução Começa Aqui',
            subtitle: 'Acesse o seu Dashboard para ver estatísticas detalhadas de sua performance, KD, vitórias e muito mais.',
            cta: 'Ver Meu Perfil',
        },
        dashboard: {
            title: 'DASHBOARD',
            welcome: 'Bem-vindo de volta,',
            lifetimeStats: 'Estatísticas Gerais',
            exampleData: 'DADOS EXEMPLO',
            totalMatches: 'Partidas Totais',
            totalKills: 'Abates Totais',
            winRate: 'Taxa de Vitória',
            kdRatio: 'Ratio K/D',
            avgPlacement: 'Colocação Média',
            placementRate: 'Taxa de Colocação',
            recentForm: 'Forma Recente (Últimas 10)',
            thisWeek: 'esta semana',
            vsLastSeason: 'vs última temporada',
            positionsUp: 'posições acima',
            performance: 'Performance Global',
            ranking: 'Ranking Regional',
        }
    },
    es: {
        nav: {
            home: 'Inicio',
            about: 'Sobre',
            players: 'Pro Players',
            tournaments: 'Torneos',
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
        tournaments: {
            title: 'Torneos Oficiales',
            subtitle: 'Sigue los próximos campeonatos y eventos de la región Brasil.',
            status: {
                upcoming: 'Próximamente',
                live: 'En Vivo',
                completed: 'Finalizado',
            }
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
            rights: 'Todos os derechos reservados.',
        },
        community: {
            title: '¿No tienes con quien jugar?',
            description: 'En el Discord puedes encontrar miles de jugadores solos que buscan constantemente con quien practicar para sacar su mejor potencial.',
            cta: 'Encontrar Compañeros',
        },
        stats: {
            title: 'Tu Evolución Comienza Aquí',
            subtitle: 'Acceda a su Dashboard para ver estadísticas detalladas de su performance, KD, victorias y mucho más.',
            cta: 'Ver Mi Perfil',
        },
        dashboard: {
            title: 'PANEL DE CONTROL',
            welcome: 'Bienvenido de nuevo,',
            lifetimeStats: 'Estadísticas Generales',
            exampleData: 'DATOS DE EJEMPLO',
            totalMatches: 'Partidas Totales',
            totalKills: 'Bajas Totales',
            winRate: 'Tasa de Victoria',
            kdRatio: 'Ratio K/D',
            avgPlacement: 'Posición Media',
            placementRate: 'Tasa de Posición',
            recentForm: 'Forma Reciente (Últimas 10)',
            thisWeek: 'esta semana',
            vsLastSeason: 'vs temporada pasada',
            positionsUp: 'posiciones arriba',
            performance: 'Performance Global',
            ranking: 'Ranking Regional',
        }
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
