import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";

import { markAllRead, markRead } from "@/src/api/notifications";
import {
  MarkAllReadResponse,
  NotificationResponse,
  Page,
  UnreadCountResponse,
} from "@/src/api/types";

function patchNotifications(
  old: InfiniteData<Page<NotificationResponse>> | undefined,
  updater: (notification: NotificationResponse) => NotificationResponse,
): InfiniteData<Page<NotificationResponse>> | undefined {
  if (!old) return old;

  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      content: page.content.map(updater),
    })),
  };
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation<MarkAllReadResponse, Error, void>({
    mutationFn: () => markAllRead(),
    onSuccess: () => {
      const now = new Date().toISOString();

      queryClient.setQueryData<UnreadCountResponse>(
        ["notifications", "unread-count"],
        { count: 0 },
      );

      queryClient.setQueryData<InfiniteData<Page<NotificationResponse>>>(
        ["notifications"],
        (old) =>
          patchNotifications(old, (notification) =>
            notification.readAt === null
              ? { ...notification, readAt: now }
              : notification,
          ),
      );
    },
  });
}

export function useMarkRead(notificationId: number) {
  const queryClient = useQueryClient();

  return useMutation<{ ok: boolean }, Error, void>({
    mutationFn: () => markRead(notificationId),
    onSuccess: () => {
      const now = new Date().toISOString();

      queryClient.setQueryData<UnreadCountResponse>(
        ["notifications", "unread-count"],
        (old) => ({
          count: Math.max(0, (old?.count ?? 0) - 1),
        }),
      );

      queryClient.setQueryData<InfiniteData<Page<NotificationResponse>>>(
        ["notifications"],
        (old) =>
          patchNotifications(old, (notification) =>
            notification.id === notificationId && notification.readAt === null
              ? { ...notification, readAt: now }
              : notification,
          ),
      );
    },
  });
}
