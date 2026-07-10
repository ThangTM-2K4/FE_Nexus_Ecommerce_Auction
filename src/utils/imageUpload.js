// Đọc ảnh từ máy, thu nhỏ + nén về JPEG data URL để lưu (localStorage/profile)
// vì backend chưa có endpoint upload ảnh. Nén để tránh vượt giới hạn localStorage.
export const readImageAsDataUrl = (file, { maxDim = 1000, quality = 0.7 } = {}) =>
  new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Không có tệp'));
    if (!file.type?.startsWith('image/')) {
      return reject(new Error('Vui lòng chọn tệp ảnh (JPG/PNG)'));
    }
    // Chặn ảnh quá lớn để không treo trình duyệt (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('Ảnh quá lớn (tối đa 10MB)'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được tệp'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Ảnh không hợp lệ'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
