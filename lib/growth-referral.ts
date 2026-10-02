// lib/growth-referral.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

export type GrowthReferralStatus = "signed_up" | "converted" | "rewarded" | "rejected";

export interface ReferralCode {
    code: string;
    link: string;
}

export interface MyReferral {
    id: string;
    clinicName: string | null;
    status: GrowthReferralStatus;
    createdAt: string;
    rewardNote: string | null;
}

export interface MyReferrals {
    stats: { total: number; converted: number; rewarded: number };
    referrals: MyReferral[];
}

export interface CreditEntry {
    id: string;
    type: "earned" | "applied";
    amount: number;
    note: string | null;
    plan: string | null;
    createdAt: string;
}

export interface MyCredit {
    balance: number;
    totalEarned: number;
    totalUsed: number;
    history: CreditEntry[];
}

function logError(label: string, error: unknown) {
    if (error instanceof AxiosError) {
        console.error(label, error.response?.data || error.message);
    } else {
        console.error(label, error);
    }
}

// Creates the clinic's code the first time it is requested
export async function getReferralCode(): Promise<ReferralCode> {
    try {
        const { data } = await api.get("/growth-referral/code");
        return { code: data.code, link: data.link };
    } catch (error) {
        logError("Error fetching referral code:", error);
        throw error;
    }
}

export async function getMyReferrals(): Promise<MyReferrals> {
    try {
        const { data } = await api.get("/growth-referral/mine");
        return { stats: data.stats, referrals: data.referrals };
    } catch (error) {
        logError("Error fetching referrals:", error);
        throw error;
    }
}

export async function getMyCredit(): Promise<MyCredit> {
    try {
        const { data } = await api.get("/growth-referral/credit");
        return {
            balance: data.balance,
            totalEarned: data.totalEarned,
            totalUsed: data.totalUsed,
            history: data.history,
        };
    } catch (error) {
        logError("Error fetching referral credit:", error);
        throw error;
    }
}