import { getCurrentUser } from './authService';
import { readImageAsDataUrl } from '../utils/imageUpload';

// TODO: thay bằng API thật khi BE hoàn thành — xoá MOCK key + logic localStorage lúc đó.
export const MOCK_AVATAR_STORAGE_KEY = 'mock_user_avatar';
const MOCK_UPLOAD_DELAY_MS = 650;

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png']);
const MAX_BYTES = 1024 * 1024;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function validateAvatarFile(file) {
  if (!file) {
    return { valid: false, error: 'Không có tệp được chọn.' };
  }

  const type = (file.type || '').toLowerCase();
  const ext = file.name?.split('.').pop()?.toLowerCase();
  const extOk = ext === 'jpg' || ext === 'jpeg' || ext === 'png';
  const mimeOk = ALLOWED_MIME.has(type);

  if (!mimeOk && !extOk) {
    return { valid: false, error: 'Chỉ chấp nhận ảnh .JPEG hoặc .PNG.' };
  }

  if (file.size > MAX_BYTES) {
    return { valid: false, error: 'Dung lượng tối đa 1MB.' };
  }

  return { valid: true, error: null };
}

/** MOCK: đọc avatar đã lưu — `{ userId, avatarUrl }` */
export function readMockAvatarRecord() {
  try {
    const raw = localStorage.getItem(MOCK_AVATAR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.userId || !parsed?.avatarUrl) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** MOCK: lưu base64/data URL để sống sót qua F5 trong giai đoạn dev */
export function saveMockAvatarRecord(userId, avatarUrl) {
  if (!userId || !avatarUrl) return;
  localStorage.setItem(
    MOCK_AVATAR_STORAGE_KEY,
    JSON.stringify({ userId, avatarUrl, updatedAt: Date.now() }),
  );
}

/** MOCK: xoá khi logout hoặc khi tích hợp API thật */
export function clearMockAvatarRecord() {
  localStorage.removeItem(MOCK_AVATAR_STORAGE_KEY);
}

/** Ưu tiên mock avatar (dev) nếu trùng userId */
export function resolveAvatarForUser(user) {
  if (!user?.id) return user;

  const mock = readMockAvatarRecord();
  if (mock && String(mock.userId) === String(user.id) && mock.avatarUrl) {
    return { ...user, avatar: mock.avatarUrl };
  }

  return user;
}

/**
 * Upload avatar — hiện MOCK FE-only.
 * TODO: thay bằng API thật khi BE hoàn thành (POST multipart, trả avatarUrl).
 *
 * @param {File} file
 * @param {{ onPreview?: (url: string) => void }} [options]
 * @returns {Promise<string>} avatarUrl dùng làm user.avatar
 */
export async function uploadAvatar(file, options = {}) {
  const { onPreview } = options;
  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const user = getCurrentUser();
  if (!user?.id) {
    throw new Error('Chưa đăng nhập.');
  }

  const previewUrl = URL.createObjectURL(file);
  onPreview?.(previewUrl);

  try {
    await delay(MOCK_UPLOAD_DELAY_MS);

    const avatarUrl = await readImageAsDataUrl(file, { maxDim: 512, quality: 0.82 });
    saveMockAvatarRecord(user.id, avatarUrl);

    return avatarUrl;
  } finally {
    URL.revokeObjectURL(previewUrl);
  }
}
