import React from "react";
import { prisma, withDbTimeout } from "@/lib/db";
import { AuditLedgerClient } from "@/components/audit/AuditLedgerClient";
import { DEMO_AUDIT_EVENTS, DEMO_ORG } from "@/lib/demoData";

export const dynamic = "force-dynamic";

export default async function AuditLedgerPage() {
  let org: any = null;
  try {
    org = await withDbTimeout(
      () =>
        prisma.organization.findFirst({
          include: {
            auditEvents: { orderBy: { timestamp: "asc" } },
          },
        }),
      2500
    );
  } catch (err) {
    org = null;
  }

  const orgName = org?.name || DEMO_ORG.name;
  const events =
    org && org.auditEvents?.length > 0
      ? org.auditEvents.map((ev: any) => ({
          id: ev.id,
          eventType: ev.eventType,
          referenceId: ev.referenceId,
          eventData: ev.eventData,
          prevHash: ev.prevHash,
          eventHash: ev.eventHash,
          timestamp: ev.timestamp.toISOString(),
        }))
      : DEMO_AUDIT_EVENTS;

  return <AuditLedgerClient events={events} orgName={orgName} />;
}
