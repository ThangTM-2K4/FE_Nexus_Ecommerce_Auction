import api from '../config/api';
import { getCurrentUser, updateSessionUser } from './authService';
import { extractUploadKey } from './uploadResponse';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png']);
const MAX_BYTES = 1024 * 1024;
const MULTIPART = { headers: { 'Content-Type': undefined } };

/** @deprecated Giữ key cũ để dọn localStorage mock khi sang API thật */
export const MOCK_AVATAR_STORAGE_KEY = 'mock_user_avatar';

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

export function clearMockAvatarRecord() {
  try {
    localStorage.removeItem(MOCK_AVATAR_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const extractAvatarUrl = (response) => {
  const data = response?.data?.data ?? response?.data ?? {};
  if (typeof data === 'string') return data;
  return (
    data.url ||
    data.fileUrl ||
    data.imageUrl ||
    data.avatarUrl ||
    data.avatar ||
    data.key ||
    data.fileKey ||
    extractUploadKey(response) ||
    ''
  );
};

/**
 * Upload avatar — POST /users/me/avatar (multipart field `file`).
 * @param {File} file
 * @param {{ onPreview?: (url: string) => void }} [options]
 * @returns {Promise<string>} avatarUrl
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
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/users/me/avatar', fd, {
      ...MULTIPART,
      skipErrorRedirect: true,
    });
    const avatarUrl = extractAvatarUrl(res);
    if (!avatarUrl) {
      throw new Error('Server không trả về URL ảnh đại diện.');
    }

    clearMockAvatarRecord();
    updateSessionUser({ avatar: avatarUrl });
    return avatarUrl;
  } finally {
    URL.revokeObjectURL(previewUrl);
  }
}

/** Xoá avatar — DELETE /users/me/avatar */
export async function deleteAvatar() {
  const user = getCurrentUser();
  if (!user?.id) {
    throw new Error('Chưa đăng nhập.');
  }

  await api.delete('/users/me/avatar', { skipErrorRedirect: true });
  clearMockAvatarRecord();
  updateSessionUser({ avatar: null });
  return null;
}

/** Giữ tương thích — session user.avatar là nguồn chính sau khi wire API */
export function resolveAvatarForUser(user) {
  return user;
}
