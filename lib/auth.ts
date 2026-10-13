import { prisma } from "./db";

export interface UserSession {
  id: string;
  email: string;
  role: "owner" | "finance_officer" | "auditor";
  orgId: string;
  orgName: string;
}

export const DEMO_OWNER_SESSION: UserSession = {
  id: "member-demo-owner",
  email: "finance@buildpro.internal",
  role: "owner",
  orgId: "org-buildpro-01",
  orgName: "BuildPro Infrastructure Ltd",
};

/**
 * Returns the current active user session.
 * In demo/pilot mode, defaults to the verified Demo Owner session.
 */
export async function getCurrentSession(): Promise<UserSession> {
  try {
    const org = await prisma.organization.findFirst({
      include: { members: true },
    });

    if (org && org.members.length > 0) {
      const member = org.members[0];
      return {
        id: member.id,
        email: member.email,
        role: member.role as any,
        orgId: org.id,
        orgName: org.name,
      };
    }
  } catch (err) {
    // Fallback if DB query fails
  }

  return DEMO_OWNER_SESSION;
}
