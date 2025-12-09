export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "famille";

export const generateInviteCode = () =>
  Math.random().toString(36).replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase();

type MinimalMember = { id: string; displayName: string };

export const buildPeopleOptions = (
  members: MinimalMember[],
  primaryMemberId?: string,
) => {
  if (!members.length) {
    return ["Moi", "Partenaire"];
  }

  const ordered = [...members];
  if (primaryMemberId) {
    ordered.sort((a, b) => {
      if (a.id === primaryMemberId) {
        return -1;
      }
      if (b.id === primaryMemberId) {
        return 1;
      }
      return 0;
    });
  }

  return ordered.map((member, index) => {
    const fallback = index === 0 ? "Moi" : `Membre ${index + 1}`;
    const raw = member.displayName?.trim();
    const [first] = raw?.split(/\s+/) ?? [];
    return first || fallback;
  });
};
