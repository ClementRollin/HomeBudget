import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OnboardingWizard from "./OnboardingWizard";

const OnboardingPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) return null;

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: { name: true, inviteCode: true },
  });

  const memberCount = await prisma.familyMember.count({
    where: { familyId: session.user.familyId },
  });

  return (
    <OnboardingWizard
      familyName={family?.name ?? "Mon foyer"}
      inviteCode={family?.inviteCode ?? ""}
      memberCount={memberCount}
    />
  );
};

export default OnboardingPage;
