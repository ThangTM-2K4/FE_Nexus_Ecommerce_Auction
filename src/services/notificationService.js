import api from "../config/api";

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data;
}

export async function getNotifications({ pageNumber = 1, pageSize = 20 } = {}) {
  const response = await api.get("/notifications/history", {
    params: {
      pageNumber,
      pageSize,
    },
  });

  const data = unwrapResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  return data?.items ?? [];
}

export async function getUnreadCount() {
  const notifications = await getNotifications({
    pageNumber: 1,
    pageSize: 100,
  });

  return notifications.filter((item) => !(item.isRead ?? item.read ?? false))
    .length;
}

export async function markAsRead(notificationId) {
  const response = await api.patch(`/notifications/${notificationId}/read`);

  return unwrapResponse(response);
}

export async function markAllAsRead() {
  const response = await api.patch("/notifications/read-all");

  return unwrapResponse(response);
}
