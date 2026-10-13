import React from "react";
import { prisma } from "@/lib/db";
import { AuditLedgerClient } from "@/components/audit/AuditLedgerClient";

export const dynamic = "force-dynamic";

export default async function AuditLedgerPage() {
  const org = await prisma.organization.findFirst({
    include: {
      auditEvents: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!org) {
    return <div className="p-8 text-center text-ink-muted">No audit events recorded yet.</div>;
  }

  const serializedEvents = org.auditEvents.map((ev) => ({
    id: ev.id,
    eventType: ev.eventType,
    referenceId: ev.referenceId,
    eventData: ev.eventData,
    prevHash: ev.prevHash,
    eventHash: ev.eventHash,
    timestamp: ev.timestamp.toISOString(),
  }));

  return <AuditLedgerClient events={serializedEvents} orgName={org.name} />;
}
