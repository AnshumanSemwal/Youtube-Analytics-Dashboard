import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import type { AdapterAccount } from "next-auth/adapters";

const baseAdapter = PrismaAdapter(prisma);

const secureAdapter = {
  ...baseAdapter,
  linkAccount: async (account: AdapterAccount) => {
    if (!baseAdapter.linkAccount) return;
    await baseAdapter.linkAccount({
      ...account,
      access_token:  account.access_token  ? encrypt(account.access_token)  : account.access_token,
      refresh_token: account.refresh_token ? encrypt(account.refresh_token) : account.refresh_token,
    });
  },
} as typeof baseAdapter;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter:  secureAdapter,
  secret:   process.env.AUTH_SECRET,
  session:  { strategy: "jwt" },
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:       "openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly",
          access_type: "offline",
          prompt:      "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, user object is available — store the DB id in token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});