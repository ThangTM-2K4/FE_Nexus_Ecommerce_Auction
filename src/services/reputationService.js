import { mockDelay } from './mockDelay';

const reputationKey = (userId) => `mockReputation_${userId}`;

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
  await mockDelay();

  const stored = getStoredReputation(userId);
  const buyerScore = calculateBuyerScore(profile, stored.totalSpent);
  const buyerRank = calculateBuyerRank(buyerScore);

  const buyerProfile = {
    score: buyerScore,
    rank: buyerRank,
    totalSpent: stored.totalSpent,
  };

  let sellerProfile = null;
  if (sellerStatus) {
    const sellerScore = calculateSellerScore(stored.sellerActivity || {});
    sellerProfile = {
      status: sellerStatus,
      score: sellerScore,
      rank: calculateSellerRank(sellerScore),
    };
  }

  return {
    id: userId,
    buyerProfile,
    sellerProfile,
    raw: stored,
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
