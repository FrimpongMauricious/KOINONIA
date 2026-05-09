import { apiClient } from "@/src/api/client";
import {
  MarkAllReadResponse,
  NotificationResponse,
  Page,
  UnreadCountResponse,
} from "@/src/api/types";

export async function fetchNotifications(
  page: number,
  size = 20,
): Promise<Page<NotificationResponse>> {
  const res = await apiClient.get<Page<NotificationResponse>>(
    "/api/v1/notifications",
    {
      params: { page, size },
    },
  );
  return res.data;
}

export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const res = await apiClient.get<UnreadCountResponse>(
    "/api/v1/notifications/unread-count",
  );
  return res.data;
}

export async function markAllRead(): Promise<MarkAllReadResponse> {
  const res = await apiClient.post<MarkAllReadResponse>(
    "/api/v1/notifications/mark-all-read",
  );
  return res.data;
}

export async function markRead(
  notificationId: number,
): Promise<{ ok: boolean }> {
  const res = await apiClient.post<{ ok: boolean }>(
    `/api/v1/notifications/${notificationId}/read`,
  );
  return res.data;
}
