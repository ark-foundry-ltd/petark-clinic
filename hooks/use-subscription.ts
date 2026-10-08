// for auto-renewals on subscription - Loads the clinic's subscription once on mount

// hooks/use-subscription.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    disableAutoRenew,
    getSubscriptionStatus,
    type SubscriptionRecord,
} from "@/lib/subscription";

const LOAD_ERROR = "We couldn't load your current plan. Please refresh the page.";

/**
 * Loads the clinic's subscription once on mount.
 * `refresh()` re-fetches without flipping `subscription` back to null, so the UI doesn't flash.
 */
export function useSubscription() {
    const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const mounted = useRef(true);

    const refresh = useCallback(async () => {
        try {
            const data = await getSubscriptionStatus();
            if (!mounted.current) return;
            setSubscription(data);
            setError(null);
        } catch {
            if (!mounted.current) return;
            setError(LOAD_ERROR);
        } finally {
            if (mounted.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        mounted.current = true;
        refresh();
        return () => {
            mounted.current = false;
        };
    }, [refresh]);

    return { subscription, loading, error, refresh, setSubscription };
}

/**
 * Turns auto-renewal off. Resolves true on success so callers can refresh their state.
 */
export function useDisableAutoRenew() {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const disable = useCallback(async (): Promise<boolean> => {
        setPending(true);
        setError(null);
        try {
            await disableAutoRenew();
            return true;
        } catch {
            setError("We couldn't turn off auto-renewal. Please try again.");
            return false;
        } finally {
            setPending(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return { disable, pending, error, clearError };
}