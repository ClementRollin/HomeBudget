import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type AppUser = {
  id: string;
  email: string;
  name?: string | null;
  familyId: string;
  familyName: string;
  familyInviteCode: string;
};

const authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV !== "production" ? "development-secret" : undefined);

if (!authSecret) {
  throw new Error("AUTH_SECRET (ou NEXTAUTH_SECRET) n'est pas défini dans l'environnement.");
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: authSecret,
  pages: {
    signIn: "/",
  },
  providers: [
    Credentials({
      name: "Email et mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { family: true },
        });

        if (!user) {
          return null;
        }

        const passwordOk = await compare(parsed.data.password, user.password);
        if (!passwordOk) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          familyId: user.familyId,
          familyName: user.family.name,
          familyInviteCode: user.family.inviteCode,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AppUser;
        token.id = authUser.id;
        token.familyId = authUser.familyId;
        token.familyName = authUser.familyName;
        token.familyInviteCode = authUser.familyInviteCode;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
        session.user.familyId = token.familyId as string;
        session.user.familyName = token.familyName as string;
        session.user.familyInviteCode = token.familyInviteCode as string;
      }

      return session;
    },
  },
};

