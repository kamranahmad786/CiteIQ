import { api } from "./client";

export type NotificationLevel = "Ready" | "Watch" | "Action" | "Critical";

export type NotificationRecord = {
  id: string;
  title: string;
  detail: string;
  level: NotificationLevel;
  category: string;
  created_at: string;
  read: boolean;
  action_view?: string | null;
};

export async function listNotifications() {
  const response = await api.get<NotificationRecord[]>("/notifications");
  return response.data;
}

export async function markNotificationRead(notificationId: string) {
  const response = await api.post<NotificationRecord>(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function deleteNotification(notificationId: string) {
  await api.delete(`/notifications/${notificationId}`);
}

export async function clearReadNotifications() {
  await api.delete("/notifications/read/clear");
}
