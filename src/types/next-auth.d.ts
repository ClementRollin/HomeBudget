import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      familyId: string;
      familyName: string;
      familyInviteCode: string;
      familyMemberId: string;
    };
  }

  interface User {
    id: string;
    familyId: string;
    familyName: string;
    familyInviteCode: string;
    familyMemberId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    familyId?: string;
    familyName?: string;
    familyInviteCode?: string;
    familyMemberId?: string;
  }
}
