import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuditChain } from "@/lib/audit/ledger";

export async function GET(req: NextRequest) {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const verification = await verifyAuditChain(org.id);
    return NextResponse.json(verification);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to verify chain" }, { status: 500 });
  }
}
