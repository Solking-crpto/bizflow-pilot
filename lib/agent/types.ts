import { z } from "zod";

/**
 * Strict Zod schema for AI Finance Agent Recommendations
 */
export const AgentRecommendationSchema = z.object({
  action: z.enum(["pay_now", "schedule", "hold", "request_review"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.array(z.string()).min(1),
  risks: z.array(z.string()),
  cashImpactUsdc: z.string(),
  suggestedDate: z.string().nullable().optional(),
  policyAnticipation: z.object({
    likelyPassed: z.boolean(),
    potentialFlags: z.array(z.string()),
  }),
});

export type AgentRecommendation = z.infer<typeof AgentRecommendationSchema>;

export interface AgentContextInput {
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  amountFormatted: string;
  amountAtomic: string;
  dueDate?: string | null;
  matchStatus: string;
  duplicateScore: number;
  isInjectionSuspect: boolean;
  untrustedRawText?: string | null;
  cashPosition: {
    availableTreasury: string;
    minimumReserve: string;
    netFreeCash: string;
  };
  obligationsQueue: {
    totalPendingAmount: string;
    itemCount: number;
  };
}
