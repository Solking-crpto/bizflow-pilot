import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { formatUsdc, usdcAtomic } from "@/lib/money";
import { getActiveNetwork } from "@/lib/networks";

export const dynamic = "force-dynamic";

export async function GET() {
  const network = getActiveNetwork();
  const explorerBase = network.explorerUrl || "https://explorer.arc.io";

  try {
    const payment = await withDbTimeout(() =>
      prisma.payment.findFirst({
        where: {
          network: "mainnet",
          status: "confirmed",
        },
        include: {
          vendor: true,
          invoice: true,
          anchor: true,
        },
        orderBy: {
          confirmedAt: "desc",
        },
      })
    );

    if (!payment) {
      // Fallback check: any payment on current network
      const anyPayment = await withDbTimeout(() =>
        prisma.payment.findFirst({
          where: { status: "confirmed" },
          include: { vendor: true, invoice: true, anchor: true },
          orderBy: { confirmedAt: "desc" },
        })
      );

      if (!anyPayment) {
        return NextResponse.json(
          {
            status: "none_recorded",
            message: "No confirmed payments recorded on Arc Mainnet yet.",
            network: network.name,
            chainId: network.chainId,
          },
          {
            status: 200,
            headers: {
              "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
            },
          }
        );
      }

      return formatPaymentResponse(anyPayment, explorerBase, network);
    }

    return formatPaymentResponse(payment, explorerBase, network);
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Database query failed",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

function formatPaymentResponse(payment: any, explorerBase: string, network: any) {
  const txHash = payment.txHash || "";
  const anchorTxHash = payment.anchorTxHash || payment.anchor?.anchorTxHash || "";

  return NextResponse.json(
    {
      status: "confirmed",
      id: payment.id,
      invoiceNumber: payment.invoice?.invoiceNumber || "UNKNOWN",
      vendor: payment.vendor?.name || "Northgate Cement Supply (demo vendor)",
      vendorWallet: payment.destination || payment.vendor?.walletAddress || "",
      amountAtomic: payment.amountAtomic.toString(),
      amountFormatted: formatUsdc(usdcAtomic(payment.amountAtomic)),
      timestamp: payment.confirmedAt ? payment.confirmedAt.toISOString() : payment.initiatedAt.toISOString(),
      network: payment.network || network.mode,
      chainId: network.chainId,
      txHash,
      anchorTxHash,
      explorerLinks: {
        paymentTx: txHash ? `${explorerBase}/tx/${txHash}` : null,
        anchorTx: anchorTxHash ? `${explorerBase}/tx/${anchorTxHash}` : null,
      },
      verifyPassportUrl: `/verify/${payment.id}`,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
