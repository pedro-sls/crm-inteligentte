import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { organizationMembers, organizations } from "@/db/schema";
import { requireSession } from "@/lib/session";

export async function requireOrganizationContext() {
  const session = await requireSession();
  const db = getDb();
  const activeOrganizationId = session.session.activeOrganizationId;

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
            eq(organizationMembers.userId, session.user.id),
            eq(organizationMembers.organizationId, activeOrganizationId),
          ),
        )
        .limit(1)
    : await baseQuery.where(eq(organizationMembers.userId, session.user.id)).limit(1);

  const membership = memberships[0];

  if (!membership) {
    redirect("/login");
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
