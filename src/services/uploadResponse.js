const getUploadData = (response) =>
  response?.data?.data ?? response?.data ?? {};

export const extractUploadKey = (response) => {
  const data = getUploadData(response);

  if (typeof data === "string") {
    return data.trim();
  }

  return (data.key || data.fileKey || data.storageKey || "").trim();
};

export const normalizeUploadKey = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};
