import React from "react";
import { prisma, withDbTimeout } from "@/lib/db";
import { getTreasuryPublicAddress } from "@/lib/treasury";
import { DEMO_SETTINGS, DEMO_VENDORS } from "@/lib/demoData";
import { SettingsClient, SerializedSettings, SerializedVendor } from "@/components/settings/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let org: any = null;
  try {
    org = await withDbTimeout(
      () =>
        prisma.organization.findFirst({
          include: {
            settings: true,
            vendors: true,
          },
        }),
      2500
    );
  } catch (err) {
    org = null;
  }

  const rawSettings = org?.settings?.[0] || DEMO_SETTINGS;
  const rawVendors = org?.vendors?.length > 0 ? org.vendors : DEMO_VENDORS;
  const treasuryPublicAddress = getTreasuryPublicAddress();

  const serializedSettings: SerializedSettings = {
    killSwitchActive: !!rawSettings.killSwitchActive,
    priceToleranceBps: Number(rawSettings.priceToleranceBps || 100),
    requireApprovalAbove: (rawSettings.requireApprovalAbove || 5000000000n).toString(),
    minReserveUsdc: (rawSettings.minReserveUsdc || 2000000000n).toString(),
    dailyLimitUsdc: (rawSettings.dailyLimitUsdc || 20000000000n).toString(),
  };

  const serializedVendors: SerializedVendor[] = rawVendors.map((v: any) => ({
    id: v.id,
    name: v.name,
    walletAddress: v.walletAddress,
    status: v.status,
    perVendorLimitUsdc: (v.perVendorLimitUsdc || 10000000000n).toString(),
  }));

  return (
    <SettingsClient
      initialSettings={serializedSettings}
      vendors={serializedVendors}
      treasuryPublicAddress={treasuryPublicAddress}
    />
  );
}
