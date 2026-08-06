import api from '../config/api';
import { mockDelay } from './mockDelay';

const reputationKey = (userId) => `mockReputation_${userId}`;

const unwrap = (res) => {
  const body = res?.data;
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body ?? null;
};

const RANK_THRESHOLDS = {
  Silver: { min: 0, max: 100 },
  Gold: { min: 101, max: 1000 },
  Platinum: { min: 1001, max: 10000 },
  Diamond: { min: 10001, max: Infinity },
};

const AUCTION_LIMITS = {
  Silver: 1000000,
  Gold: 10000000,
  Platinum: 100000000,
  Diamond: Infinity,
};

const SELLER_PROFILE_POINTS = {
  shopInfo: 2,
  businessAddress: 2,
  taxInfo: 3,
  documents: 3,
  bankConfirmation: 3,
};

const defaultReputationData = {
  3: {
    totalSpent: 3200000,
    sellerActivity: {
      profileCompletion: {
        shopInfo: true,
        businessAddress: true,
        taxInfo: true,
        documents: true,
        bankConfirmation: true,
      },
      listedProducts: 8,
      successfulAuctions: 1,
      fiveStarReviews: 3,
    },
  },
  4: {
    totalSpent: 1980000,
    sellerActivity: null,
  },
};

export const calculateBuyerScore = (profile, totalSpent = 0) => {
  let score = 0;
  if (profile?.isEmailVerified) score += 1;
  if (profile?.isPhoneVerified) score += 2;
  if (profile?.isNationalIdVerified) score += 5;
  if (profile?.bankAccount != null) score += 5;
  score += Math.floor(totalSpent / 10000);
  return score;
};

export const calculateBuyerRank = (score) => {
  if (score > 10000) return 'Diamond';
  if (score >= 1001) return 'Platinum';
  if (score >= 101) return 'Gold';
  return 'Silver';
};

/** Chuẩn hoá response GET /reputation/me | /reputation/users/{id} */
const normalizeApiReputation = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const sellerObj = raw.seller || raw.sellerProfile || {};
  const buyerObj = raw.buyer || raw.buyerProfile || {};

  const score =
    buyerObj.score ??
    raw.score ??
    raw.point ??
    raw.points ??
    raw.reputationScore ??
    raw.buyerScore ??
    raw.totalScore ??
    null;
  const rank =
    buyerObj.rank ??
    raw.rank ??
    raw.tier ??
    raw.level ??
    raw.buyerRank ??
    null;

  const sellerScore =
    sellerObj.score ??
    raw.sellerScore ??
    raw.sellerPoint ??
    null;
  const sellerRank =
    sellerObj.rank ??
    raw.sellerRank ??
    null;

  const numericScore = score != null ? Number(score) : 0;
  const numericSellerScore = sellerScore != null ? Number(sellerScore) : null;

  return {
    score: numericScore,
    rank: rank || calculateBuyerRank(numericScore),
    totalSpent: raw.totalSpent ?? raw.spent ?? 0,
    sellerScore: numericSellerScore,
    sellerRank: sellerRank || (numericSellerScore != null ? calculateSellerRank(numericSellerScore) : null),
    raw,
  };
};

/** GET /reputation/me — điểm uy tín người dùng hiện tại */
export const fetchMyReputation = async () => {
  const res = await api.get('/reputation/me', { skipErrorRedirect: true });
  return normalizeApiReputation(unwrap(res));
};

/** Lấy chính xác điểm Seller reputation score từ API /reputation/me */
export const getSellerReputationScore = async () => {
  try {
    const rep = await fetchMyReputation();
    if (rep?.sellerScore != null) {
      return Number(rep.sellerScore);
    }
  } catch (err) {
    console.warn('[reputationService] fetchMyReputation failed:', err);
  }
  return null;
};

/** GET /reputation/users/{userId} — điểm uy tín công khai */
export const fetchUserReputationById = async (userId) => {
  const res = await api.get(`/reputation/users/${userId}`, { skipErrorRedirect: true });
  return normalizeApiReputation(unwrap(res));
};

export const calculateSellerScore = (sellerActivity = {}) => {
  const { profileCompletion = {}, listedProducts = 0, successfulAuctions = 0, fiveStarReviews = 0 } =
    sellerActivity;

  let score = 0;
  if (profileCompletion.shopInfo) score += SELLER_PROFILE_POINTS.shopInfo;
  if (profileCompletion.businessAddress) score += SELLER_PROFILE_POINTS.businessAddress;
  if (profileCompletion.taxInfo) score += SELLER_PROFILE_POINTS.taxInfo;
  if (profileCompletion.documents) score += SELLER_PROFILE_POINTS.documents;
  if (profileCompletion.bankConfirmation) score += SELLER_PROFILE_POINTS.bankConfirmation;

  score += listedProducts * 2;
  score += successfulAuctions * 20;
  score += fiveStarReviews * 5;

  return score;
};

export const calculateSellerRank = (score) => {
  if (score > 10000) return 'Diamond';
  if (score >= 1001) return 'Platinum';
  if (score >= 101) return 'Gold';
  return 'Silver';
};

export const canApplySeller = (buyerScore) => buyerScore >= 7;

export const canJoinAuction = (buyerScore, startingPrice) => {
  const rank = calculateBuyerRank(buyerScore);
  const limit = AUCTION_LIMITS[rank];
  return startingPrice <= limit;
};

export const getRankProgress = (score, rank) => {
  const threshold = RANK_THRESHOLDS[rank];
  if (!threshold || rank === 'Diamond') return 100;
  const range = threshold.max - threshold.min;
  const position = score - threshold.min;
  return Math.min(100, Math.max(0, Math.round((position / range) * 100)));
};

export const getNextRank = (rank) => {
  const order = ['Silver', 'Gold', 'Platinum', 'Diamond'];
  const idx = order.indexOf(rank);
  return idx < order.length - 1 ? order[idx + 1] : null;
};

export const getPointsToNextRank = (score, rank) => {
  const nextRank = getNextRank(rank);
  if (!nextRank) return 0;
  const nextMin = RANK_THRESHOLDS[nextRank].min;
  return Math.max(0, nextMin - score);
};

const getStoredReputation = (userId) => {
  const raw = localStorage.getItem(reputationKey(userId));
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* fall through */
    }
  }
  return defaultReputationData[userId] || { totalSpent: 0, sellerActivity: null };
};

const saveReputation = (userId, data) => {
  localStorage.setItem(reputationKey(userId), JSON.stringify(data));
};

export const getUserReputation = async (userId, profile, sellerStatus) => {
  const stored = getStoredReputation(userId);

  // 1) Ưu tiên GET /reputation/me (API thật)
  let apiRep = null;
  try {
    apiRep = await fetchMyReputation();
  } catch (err) {
    console.error('[reputationService] GET /reputation/me failed, fallback:', err);
  }

  // 2) Fallback: điểm kèm theo getMe (profile.reputation)
  const profileRep = profile?.reputation;

  const buyerScore =
    apiRep?.score != null
      ? Number(apiRep.score)
      : profileRep?.score != null
        ? Number(profileRep.score)
        : calculateBuyerScore(profile, stored.totalSpent);

  const buyerRank =
    apiRep?.rank || profileRep?.rank || calculateBuyerRank(buyerScore);

  const buyerProfile = {
    score: buyerScore,
    rank: buyerRank,
    totalSpent: apiRep?.totalSpent ?? stored.totalSpent,
  };

  let sellerProfile = null;
  if (sellerStatus) {
    const sellerScore =
      apiRep?.sellerScore != null
        ? Number(apiRep.sellerScore)
        : calculateSellerScore(stored.sellerActivity || {});
    sellerProfile = {
      status: sellerStatus,
      score: sellerScore,
      rank: apiRep?.sellerRank || calculateSellerRank(sellerScore),
    };
  }

  return {
    id: userId,
    buyerProfile,
    sellerProfile,
    raw: stored,
    source: apiRep ? 'api' : profileRep?.score != null ? 'profile' : 'mock',
  };
};

export const updateTotalSpent = async (userId, totalSpent) => {
  await mockDelay();
  const stored = getStoredReputation(userId);
  const updated = { ...stored, totalSpent };
  saveReputation(userId, updated);
  return updated;
};

export const getAuctionAccessLabel = (rank) => {
  if (rank === 'Diamond') return 'Không giới hạn';
  const limit = AUCTION_LIMITS[rank];
  return `Giá khởi điểm ≤ ${new Intl.NumberFormat('vi-VN').format(limit)} VND`;
};
