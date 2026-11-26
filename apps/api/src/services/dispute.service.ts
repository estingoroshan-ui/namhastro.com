import { prisma } from "../db.js";

export class DisputeService {
  /**
   * File a Customer Complaint or Billing Dispute
   */
  static async fileComplaint(params: {
    customerId: string;
    category?: any;
    subject: string;
    description: string;
    evidenceUrls?: string[];
    relatedConsultationId?: string;
    relatedOrderId?: string;
    relatedBookingId?: string;
    relatedTransactionId?: string;
  }) {
    const count = await prisma.disputeComplaint.count();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const complaintNumber = `DIS-${dateStr}-${(1001 + count).toString()}`;

    return prisma.disputeComplaint.create({
      data: {
        complaintNumber,
        customerId: params.customerId,
        category: params.category || "GENERAL",
        subject: params.subject,
        description: params.description,
        evidenceUrlsJson: params.evidenceUrls as any,
        relatedConsultationId: params.relatedConsultationId,
        relatedOrderId: params.relatedOrderId,
        relatedBookingId: params.relatedBookingId,
        relatedTransactionId: params.relatedTransactionId,
        status: "FILED"
      }
    });
  }

  /**
   * List Complaints with Filters
   */
  static async listComplaints(query?: { status?: any; category?: any; assignedStaffId?: string }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.category) where.category = query.category;
    if (query?.assignedStaffId) where.assignedStaffId = query.assignedStaffId;

    return prisma.disputeComplaint.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Assign Staff Investigator to Complaint
   */
  static async assignInvestigator(complaintId: string, assignedStaffId: string) {
    return prisma.disputeComplaint.update({
      where: { id: complaintId },
      data: {
        assignedStaffId,
        status: "UNDER_INVESTIGATION"
      }
    });
  }

  /**
   * Resolve Dispute & Process Ledger Refund if Approved
   */
  static async resolveDispute(params: {
    complaintId: string;
    decision: string;
    investigationNotes?: string;
    refundAmountInr?: number;
    approvedByUserId?: string;
  }) {
    const complaint = await prisma.disputeComplaint.findUnique({ where: { id: params.complaintId } });
    if (!complaint) throw new Error("COMPLAINT_NOT_FOUND");

    const refundPaise = BigInt((params.refundAmountInr || 0) * 100);

    return prisma.$transaction(async (tx: any) => {
      // If refund is recommended and > 0, credit customer's wallet
      if (refundPaise > 0n) {
        const wallet = await tx.wallet.update({
          where: { userId: complaint.customerId },
          data: {
            refundBalancePaise: { increment: refundPaise }
          }
        });

        const totalBalanceAfter = wallet.paidBalancePaise + wallet.promoBalancePaise + wallet.refundBalancePaise;

        // Record wallet ledger transaction
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            idempotencyKey: `DISPUTE_REFUND_${complaint.id}_${Date.now()}`,
            amountPaise: refundPaise,
            balanceAfterPaise: totalBalanceAfter,
            type: "REFUND_CREDIT",
            referenceType: "DISPUTE_COMPLAINT",
            referenceId: complaint.complaintNumber,
            description: `Refund approved for complaint ${complaint.complaintNumber}: ${params.decision}`
          }
        });
      }

      return tx.disputeComplaint.update({
        where: { id: params.complaintId },
        data: {
          status: refundPaise > 0n ? "REFUND_PROCESSED" : "RESOLVED",
          resolutionDecision: params.decision,
          investigationNotes: params.investigationNotes,
          refundAmountPaise: refundPaise,
          isRefundProcessed: refundPaise > 0n
        }
      });
    });
  }
}
