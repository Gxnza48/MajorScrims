import { NextAuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";
import DiscordProvider from "next-auth/providers/discord";

interface EpicProfile {
    sub: string;
    preferred_username?: string;
    display_name?: string;
}

/**
 * Epic Account Services sign-in. It stays OFF until EPIC_CLIENT_ID /
 * EPIC_CLIENT_SECRET are set, because Epic only lets an app out of its own
 * organisation once the Brand Application Review passes - enabling it before
 * that would just lock every pro out. Until then players type their Epic name
 * when they claim a spot (see /api/tournaments/[slug]/claim).
 */
function epicProvider(): OAuthConfig<EpicProfile> {
    return {
        id: "epic",
        name: "Epic Games",
        type: "oauth",
        authorization: {
            url: "https://www.epicgames.com/id/authorize",
            params: { scope: "basic_profile", response_type: "code" },
        },
        token: "https://api.epicgames.dev/epic/oauth/v2/token",
        userinfo: "https://api.epicgames.dev/epic/oauth/v2/userInfo",
        clientId: process.env.EPIC_CLIENT_ID,
        clientSecret: process.env.EPIC_CLIENT_SECRET,
        checks: ["state"],
        profile(profile) {
            return {
                id: profile.sub,
                name: profile.preferred_username || profile.display_name || null,
                email: null,
                image: null,
            };
        },
    };
}

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "identify email guilds.members.read",
                },
            },
        }),
        ...(process.env.EPIC_CLIENT_ID && process.env.EPIC_CLIENT_SECRET ? [epicProvider()] : []),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.discordId as string) || token.sub || "";
                session.accessToken = token.accessToken as string;
                session.user.epicName = (token.epicName as string) || undefined;
                session.user.epicAccountId = (token.epicAccountId as string) || undefined;
            }
            return session;
        },
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
                if (account.provider === "epic") {
                    token.epicAccountId = account.providerAccountId;
                }
            }
            if (profile) {
                if (account?.provider === "epic") {
                    const epic = profile as EpicProfile;
                    token.epicName = epic.preferred_username || epic.display_name;
                } else {
                    // profile.id is the actual Discord User ID from the OAuth response
                    token.discordId = (profile as any).id;
                }
            }
            return token;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
};
