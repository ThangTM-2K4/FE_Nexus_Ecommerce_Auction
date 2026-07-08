import { mockDelay } from './mockDelay';
import { USE_MOCK_BUYER_TRUST, MOCK_BUYER_TRUST } from '../data/mockBuyerTrust';

export const getBuyerTrust = async () => {
  await mockDelay(300);
  if (!USE_MOCK_BUYER_TRUST) {
    return { score: 0, maxScore: 100, level: 'Thấp', description: MOCK_BUYER_TRUST.description };
  }
  return { ...MOCK_BUYER_TRUST };
};
