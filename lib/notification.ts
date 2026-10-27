// lib/notification.ts
import api from "@/lib/api";

export interface AppNotification {
    _id: string;
    category?: string; // "target" | "appointment" | ...
    type: string;
    title: string;
    body: string;
    data?: { url?: string; [key: string]: unknown };
    read: boolean;
    createdAt: string;
}

export interface NotificationPage {
    notifications: AppNotification[];
    unreadCount: number;
    nextCursor: string | null;
}

// NOTE: assumes `api` is an axios instance that returns the raw response (so the payload is `res.data`).
// If your api wrapper already unwraps `.data`, drop the destructuring, same as in lib/appointment.ts.
export async function getNotifications(params?: { limit?: number; cursor?: string }): Promise<NotificationPage> {
    const { data } = await api.get<NotificationPage>("/notifications", { params });
    return data;
}

export async function markNotificationRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
}