const getUploadData = (response) =>
  response?.data?.data ?? response?.data ?? {};

export const extractUploadKey = (response) => {
  const data = getUploadData(response);
  if (typeof data === 'string') return data;
  return data.key || data.fileKey || '';
};

export const normalizeUploadKey = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  const uploadMarker = '/uploads/';
  const markerIndex = trimmed.toLowerCase().indexOf(uploadMarker);
  return markerIndex >= 0
    ? trimmed.slice(markerIndex + uploadMarker.length)
    : trimmed;
};
