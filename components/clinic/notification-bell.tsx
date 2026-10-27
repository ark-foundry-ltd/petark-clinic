// components/clinic/notification-bell.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarX, CheckCheck, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    type AppNotification,
} from "@/lib/notification";

const POLL_MS = 60_000;
const CARD = "bg-pry-clr rounded-xl border border-gray-200/80 shadow-lg";

function timeAgo(iso: string): string {
    const seconds = Math.max(Math.floor((Date.now() - new Date(iso).getTime()) / 1000), 0);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function iconFor(n: AppNotification) {
    if (n.category === "target") return TrendingUp;
    if (n.category === "appointment" || n.type === "missed_appointment") return CalendarX;
    return Bell;
}

// Only follow in-app paths from notification data
const safePath = (url: unknown): string | null =>
    typeof url === "string" && url.startsWith("/") && !url.startsWith("//") ? url : null;

export default function NotificationBell() {
    const router = useRouter();
    const rootRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<AppNotification[]>([]);
    const [unread, setUnread] = useState(0);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    const refreshCount = useCallback(async () => {
        try {
            const page = await getNotifications({ limit: 1 });
            setUnread(page.unreadCount);
        } catch {
            /* the badge is non-critical, stay silent */
        }
    }, []);

    // Poll the unread count while the tab is visible
    useEffect(() => {
        refreshCount();
        const tick = () => {
            if (document.visibilityState === "visible") refreshCount();
        };
        const timer = setInterval(tick, POLL_MS);
        document.addEventListener("visibilitychange", tick);
        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", tick);
        };
    }, [refreshCount]);

    // Load the list each time the panel opens
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const page = await getNotifications({ limit: 20 });
                if (cancelled) return;
                setItems(page.notifications);
                setUnread(page.unreadCount);
                setNextCursor(page.nextCursor);
            } catch {
                if (!cancelled) toast.error("Couldn't load notifications.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open]);

    // Close on outside click or Escape
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    async function loadMore() {
        if (!nextCursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const page = await getNotifications({ limit: 20, cursor: nextCursor });
            setItems((prev) => [...prev, ...page.notifications]);
            setNextCursor(page.nextCursor);
            setUnread(page.unreadCount);
        } catch {
            toast.error("Couldn't load more notifications.");
        } finally {
            setLoadingMore(false);
        }
    }

    function handleItemClick(n: AppNotification) {
        if (!n.read) {
            setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
            setUnread((u) => Math.max(u - 1, 0));
            markNotificationRead(n._id).catch(() => refreshCount());
        }
        const path = safePath(n.data?.url);
        if (path) {
            setOpen(false);
            router.push(path);
        }
    }

    async function handleMarkAll() {
        if (unread === 0 || markingAll) return;
        setMarkingAll(true);
        setItems((prev) => prev.map((x) => ({ ...x, read: true })));
        setUnread(0);
        try {
            await markAllNotificationsRead();
        } catch {
            toast.error("Couldn't mark all as read.");
            refreshCount();
        } finally {
            setMarkingAll(false);
        }
    }

    return (
        <div ref={rootRef} className="relative pry-ff">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
                aria-haspopup="true"
                aria-expanded={open}
                className="relative w-10 h-10 inline-flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
            >
                <Bell size={20} />
                {unread > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-semibold text-white flex items-center justify-center tabular-nums">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className={`${CARD} fixed inset-x-4 top-[72px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-88 z-50 overflow-hidden`}>
                    <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
                        <button
                            type="button"
                            onClick={handleMarkAll}
                            disabled={unread === 0 || markingAll}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-acc-clr hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                        >
                            <CheckCheck size={14} />
                            Mark all read
                        </button>
                    </header>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500" aria-busy="true">
                                <Loader2 size={16} className="animate-spin" />
                                Loading...
                            </div>
                        ) : items.length === 0 ? (
                            <div className="py-12 px-6 text-center">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <Bell size={18} className="text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">You&apos;re all caught up</p>
                                <p className="text-xs text-gray-500 mt-1">New updates will show up here.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {items.map((n) => {
                                    const Icon = iconFor(n);
                                    return (
                                        <li key={n._id}>
                                            <button
                                                type="button"
                                                onClick={() => handleItemClick(n)}
                                                className={`w-full flex items-start gap-3 text-left px-4 py-3 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-acc-clr ${
                                                    n.read ? "" : "bg-acc-clr/5"
                                                }`}
                                            >
                                                <span className="w-8 h-8 shrink-0 rounded-lg bg-acc-clr/10 flex items-center justify-center">
                                                    <Icon size={16} className="text-acc-clr" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-start justify-between gap-2">
                                                        <span className={`text-sm text-gray-900 wrap-break-word ${n.read ? "font-medium" : "font-semibold"}`}>
                                                            {n.title}
                                                        </span>
                                                        {!n.read && (
                                                            <span aria-label="Unread" className="mt-1.5 w-2 h-2 shrink-0 rounded-full bg-acc-clr" />
                                                        )}
                                                    </span>
                                                    {n.body && (
                                                        <span className="block text-sm text-gray-600 mt-0.5 wrap-break-word">{n.body}</span>
                                                    )}
                                                    <span className="block text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</span>
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {nextCursor && !loading && (
                        <footer className="border-t border-gray-100 p-2">
                            <button
                                type="button"
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                            >
                                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                                Load more
                            </button>
                        </footer>
                    )}
                </div>
            )}
        </div>
    );
}