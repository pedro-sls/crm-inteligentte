import "server-only";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { demandWorkflowStatuses } from "@/db/schema";

export async function getInitialDemandStatus(organizationId: string, type: "client" | "internal") {
  const [status] = await getDb()
    .select({ key: demandWorkflowStatuses.key })
    .from(demandWorkflowStatuses)
    .where(
      and(
        eq(demandWorkflowStatuses.organizationId, organizationId),
        eq(demandWorkflowStatuses.demandType, type),
        eq(demandWorkflowStatuses.isInitial, true),
        eq(demandWorkflowStatuses.isActive, true),
      ),
    )
    .limit(1);

  return status?.key ?? "open";
}
