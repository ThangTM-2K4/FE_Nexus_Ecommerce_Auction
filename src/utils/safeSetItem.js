export const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      throw new Error('Không thể lưu: dung lượng lưu trữ của trình duyệt đã đầy. Vui lòng dùng ảnh nhỏ hơn hoặc xoá bớt ảnh cũ.');
    }
    throw err;
  }
};
