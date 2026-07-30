const COMPARE_KEY = "auc_compare_list";

export function getCompareList() {
  try {
    return JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isItemInCompare(id) {
  if (!id) return false;
  const list = getCompareList();
  return list.some((item) => String(item.id) === String(id));
}

export function toggleCompareItem(auction) {
  if (!auction || !auction.id) return { success: false, isAdded: false, reason: "invalid" };
  const list = getCompareList();
  const exists = list.some((item) => String(item.id) === String(auction.id));

  if (exists) {
    const updated = list.filter((item) => String(item.id) !== String(auction.id));
    localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return { success: true, isAdded: false };
  }

  if (list.length >= 3) {
    return { success: false, isAdded: false, reason: "limit_reached" };
  }

  const newItem = {
    id: auction.id,
    title: auction.title,
    description: auction.description || "",
    image: auction.image || auction.images?.[0] || "",
    currentBid: auction.currentBid,
    currentPrice: auction.currentPrice || (typeof auction.currentBid === "number" ? `${auction.currentBid.toLocaleString("vi-VN")} ₫` : ""),
    categoryLabel: auction.categoryLabel || auction.category || "Sản phẩm",
    endTime: auction.endTime || Date.now() + 86400000,
    timeLeft: auction.timeLeft || "24h 00m",
    location: auction.location || "TP. Hồ Chí Minh",
    listingType: auction.listingType || "Đấu giá công khai",
    seller: auction.seller || "Trusted Seller",
  };

  const updated = [...list, newItem];
  localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
  return { success: true, isAdded: true };
}

export function removeCompareItem(id) {
  const list = getCompareList();
  const updated = list.filter((item) => String(item.id) !== String(id));
  localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
}

export function clearCompareList() {
  localStorage.removeItem(COMPARE_KEY);
  window.dispatchEvent(new Event("storage"));
}
