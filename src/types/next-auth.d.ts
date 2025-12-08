import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      familyId: string;
      familyName: string;
      familyInviteCode: string;
    };
  }

  interface User {
    id: string;
    familyId: string;
    familyName: string;
    familyInviteCode: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    familyId?: string;
    familyName?: string;
    familyInviteCode?: string;
  }
}
