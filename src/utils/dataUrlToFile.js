/**
 * Chuyển data URL (base64) thành File để upload multipart.
 */
export async function dataUrlToFile(dataUrl, filename = 'product-image.jpg') {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const type = blob.type || 'image/jpeg';
  return new File([blob], filename, { type });
}
