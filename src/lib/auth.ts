import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

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
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.discordId as string) || token.sub || "";
                session.accessToken = token.accessToken as string;
            }
            return session;
        },
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            if (profile) {
                // profile.id is the actual Discord User ID from the OAuth response
                token.discordId = (profile as any).id;
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
