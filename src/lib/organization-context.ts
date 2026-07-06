import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { organizationMembers, organizations } from "@/db/schema";
import { requireSession } from "@/lib/session";

export async function getOrganizationMembership(userId: string, activeOrganizationId?: string | null) {
  const db = getDb();
  const baseQuery = db
    .select({
      organizationId: organizations.id,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId));

  const memberships = activeOrganizationId
    ? await baseQuery
        .where(
          and(
            eq(organizationMembers.userId, userId),
            eq(organizationMembers.organizationId, activeOrganizationId),
          ),
        )
        .limit(1)
    : await baseQuery.where(eq(organizationMembers.userId, userId)).limit(1);

  return memberships[0] ?? null;
}

export async function requireOrganizationContext() {
  const session = await requireSession();
  const membership = await getOrganizationMembership(
    session.user.id,
    session.session.activeOrganizationId,
  );


  if (!membership) {
    redirect("/setup");
  }

  return {
    session,
    organization: {
      id: membership.organizationId,
      name: membership.organizationName,
      slug: membership.organizationSlug,
      role: membership.role,
    },
  };
}
