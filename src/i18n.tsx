"use client";

import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'pt' | 'es';

type Translations = {
    nav: {
        home: string;
        about: string;
        players: string;
        tournaments: string;
        leaderboard: string;
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
        badge: string;
        subtitle: string;
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
        totalWins: string;
        top3: string;
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
        linked: string;
        noData: string;
        liveData: string;
        needsSync: string;
        matchHistory: string;
        accountLinked: string;
        accountLinkedDesc: string;
        accountNotFound: string;
        accountNotFoundDesc: string;
    };
    login: {
        welcome: string;
        subtitle: string;
        cta: string;
        terms: string;
        and: string;
        privacy: string;
        agree: string;
    };
};

const translations: Record<Language, Translations> = {
    pt: {
        nav: {
            home: 'Início',
            about: 'Sobre',
            players: 'Pro Players',
            tournaments: 'Torneios',
            leaderboard: 'Leaderboard',
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
            badge: 'Experiência Premium',
            subtitle: 'Feita para campeões. Viva o padrão ouro em infraestrutura de jogos competitivos com precisão e clareza incomparáveis.',
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
            totalWins: 'Vitórias Totais',
            top3: 'Vezes no TOP 3',
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
            linked: '(Vinculado)',
            noData: '(Sem Dados)',
            liveData: 'Dados ao Vivo',
            needsSync: 'Precisa Sincronizar',
            matchHistory: 'Histórico de partidas em breve',
            accountLinked: 'Conta Vinculada',
            accountLinkedDesc: 'Seu Discord agora está sincronizado com a Major Scrims. Seu desempenho será atualizado aqui automaticamente após cada temporada.',
            accountNotFound: 'Conta Não Encontrada',
            accountNotFoundDesc: 'Sua conta Discord vinculada ainda não possui registros válidos no banco de dados oficial. Jogue scrims para ativar a coleta de estatísticas ou entre em contato com os moderadores do torneio se isso for um erro.',
        },
        login: {
            welcome: 'Bem-vindo de volta',
            subtitle: 'Entre para acessar seu dashboard e estatísticas',
            cta: 'Continuar com Discord',
            terms: 'Termos de Serviço',
            and: 'e',
            privacy: 'Política de Privacidade',
            agree: 'Ao continuar, você concorda com nossos',
        },
    },
    es: {
        nav: {
            home: 'Inicio',
            about: 'Sobre',
            players: 'Pro Players',
            tournaments: 'Torneos',
            leaderboard: 'Leaderboard',
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
            badge: 'Experiencia Premium',
            subtitle: 'Hecho para campeones. Vive el estándar de oro en infraestructura de gaming competitivo con precisión y claridad incomparables.',
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
            totalWins: 'Victorias Totales',
            top3: 'Veces en el TOP 3',
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
            linked: '(Vinculado)',
            noData: '(Sin Datos)',
            liveData: 'Datos en Vivo',
            needsSync: 'Necesita Sincronizar',
            matchHistory: 'Historial de partidas próximamente',
            accountLinked: 'Cuenta Vinculada',
            accountLinkedDesc: 'Tu Discord ahora está sincronizado con Major Scrims. Tu rendimiento se actualizará aquí automáticamente después de cada temporada.',
            accountNotFound: 'Cuenta No Encontrada',
            accountNotFoundDesc: 'Tu cuenta de Discord vinculada aún no posee registros válidos en la base de datos oficial. Juega scrims para activar la recolección de estadísticas o ponte en contacto con los moderadores del torneo si esto es un error.',
        },
        login: {
            welcome: 'Bienvenido de nuevo',
            subtitle: 'Inicia sesión para acceder a tu panel y estadísticas',
            cta: 'Continuar con Discord',
            terms: 'Términos de Servicio',
            and: 'y',
            privacy: 'Política de Privacidad',
            agree: 'Al continuar, aceptas nuestros',
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
