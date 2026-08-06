import api from "../config/api";
export async function getNotificationPreferences() {
  const response = await api.get("/preferences");
  return response.data.data;
}

export async function updateNotificationPreferences(payload) {
  const response = await api.put("/preferences", payload);
  return response.data.data;
}
