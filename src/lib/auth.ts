import { compare } from "bcryptjs";
import NextAuth, { type NextAuthConfig, type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { ensureMemberForUser } from "@/lib/members";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const credentialsAuthorize = async (
  credentials: Partial<Record<string, unknown>>,
): Promise<User | null> => {
  const parsed = credentialsSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { family: true },
  });
  if (!user) return null;

  const passwordOk = await compare(parsed.data.password, user.password);
  if (!passwordOk) return null;

  const member = await ensureMemberForUser(user.id, user.familyId, user.name ?? "Membre");

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    familyId: user.familyId,
    familyName: user.family.name,
    familyMemberId: member.id,
    familyRole: user.familyRole,
  } as User;
};

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [
    Credentials({
      name: "Email et mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: credentialsAuthorize,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.familyId = user.familyId;
        token.familyName = user.familyName;
        token.familyMemberId = user.familyMemberId;
        token.familyRole = user.familyRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
        session.user.familyId = token.familyId as string;
        session.user.familyName = token.familyName as string;
        session.user.familyMemberId = token.familyMemberId as string;
        session.user.familyRole = (token.familyRole ?? "MEMBER") as "OWNER" | "MEMBER";
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export const getCurrentSession = () => auth();
