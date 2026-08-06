import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /** Set only when the Epic provider is enabled (see src/lib/auth.ts). */
      epicName?: string;
      epicAccountId?: string;
    };
    accessToken?: string;
  }
}
