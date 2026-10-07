// lib/visit-payment.ts
// Assumes the visit router is mounted at /api/visits and `api` is your shared axios instance.
import { AxiosError } from "axios";
import api from "@/lib/api";

export type PaymentMethod = "cash" | "transfer" | "pos_card";

export interface PendingVisitPayment {
  _id: string;
  completedAt: string;
  total: number;
  petName: string;
  ownerName?: string;
}

export interface PendingVisitPayments {
  count: number;
  outstanding: number;
  data: PendingVisitPayment[];
}

export async function getPendingVisitPayments(): Promise<PendingVisitPayments> {
  try {
    const res = await api.get("visit/payments/pending");
    return res.data; // { status, count, outstanding, data }
  } catch (err) {
    console.error("getPendingVisitPayments failed:", (err as AxiosError).response?.data ?? err);
    throw err;
  }
}

export async function markVisitPaid(visitId: string, paymentMethod: PaymentMethod) {
  try {
    const res = await api.patch(`/visit/${visitId}/mark-paid`, { paymentMethod });
    return res.data.data;
  } catch (err) {
    console.error("markVisitPaid failed:", (err as AxiosError).response?.data ?? err);
    throw err;
  }
}