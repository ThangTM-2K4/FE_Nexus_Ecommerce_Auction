import api from "../config/api";

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data;
}

export async function getNotificationPreferences() {
  const response = await api.get("/preferences");
  return unwrapResponse(response);
}

export async function updateNotificationPreferences(payload) {
  const response = await api.put("/preferences", payload);
  return unwrapResponse(response);
}
