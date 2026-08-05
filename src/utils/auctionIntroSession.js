export const AUCTION_INTRO_SESSION_PREFIX = 'auctionIntroShown_';

export function getAuctionIntroSessionKey(userId) {
  return `${AUCTION_INTRO_SESSION_PREFIX}${userId}`;
}

export function hasSeenAuctionIntro(userId) {
  if (!userId) return true;
  return sessionStorage.getItem(getAuctionIntroSessionKey(userId)) === 'true';
}

export function markAuctionIntroSeen(userId) {
  if (!userId) return;
  sessionStorage.setItem(getAuctionIntroSessionKey(userId), 'true');
}

export function clearAuctionIntroSession(userId) {
  if (!userId) return;
  sessionStorage.removeItem(getAuctionIntroSessionKey(userId));
}
