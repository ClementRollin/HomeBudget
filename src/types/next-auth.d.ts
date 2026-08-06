import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      familyId: string;
      familyName: string;
      familyMemberId: string;
      familyRole: "OWNER" | "MEMBER";
    };
  }

  interface User {
    familyId: string;
    familyName: string;
    familyMemberId: string;
    familyRole: "OWNER" | "MEMBER";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    familyId?: string;
    familyName?: string;
    familyMemberId?: string;
    familyRole?: "OWNER" | "MEMBER";
  }
}
