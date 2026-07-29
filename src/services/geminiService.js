import { formatPrice } from '../utils/formatPrice';
import {
  getShopById,
  getShopCategories,
  shopProducts,
} from '../data/shopProfileMock';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const MAX_HISTORY = 12;
const MAX_PRODUCTS = 8;

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function tokenize(text) {
  return normalizeText(text)
    .split(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function parsePriceHint(message) {
  const text = normalizeText(message);
  const millionMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:tr|triệu|m\b)/);
  if (millionMatch) {
    const value = parseFloat(millionMatch[1].replace(',', '.')) * 1_000_000;
    return { min: value * 0.7, max: value * 1.3 };
  }

  const thousandMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:k|nghìn|ngàn)/);
  if (thousandMatch) {
    const value = parseFloat(thousandMatch[1].replace(',', '.')) * 1_000;
    return { min: value * 0.7, max: value * 1.3 };
  }

  const underMatch = text.match(/duoi\s*(\d+(?:[.,]\d+)?)\s*(?:k|nghìn|ngàn|tr|triệu)?/);
  if (underMatch) {
    let max = parseFloat(underMatch[1].replace(',', '.'));
    if (text.includes('tr') || text.includes('triệu')) max *= 1_000_000;
    else if (text.includes('k') || text.includes('ngh') || text.includes('ngàn')) max *= 1_000;
    else max *= 1_000;
    return { min: 0, max };
  }

  return null;
}

export function findRelevantProducts(shopId, message, limit = MAX_PRODUCTS) {
  const categories = getShopCategories();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.label]));
  const products = shopProducts.filter((p) => p.shopId === shopId);
  const tokens = tokenize(message);
  const priceHint = parsePriceHint(message);
  const normalizedMessage = normalizeText(message);

  const scored = products.map((product) => {
    let score = 0;
    const title = normalizeText(product.title);
    const categoryLabel = normalizeText(categoryMap[product.categoryId] || '');

    tokens.forEach((token) => {
      if (title.includes(token)) score += 3;
      if (categoryLabel.includes(token)) score += 5;
    });

    categories.forEach((cat) => {
      const label = normalizeText(cat.label);
      if (normalizedMessage.includes(label) && product.categoryId === cat.id) {
        score += 12;
      }
    });

    if (priceHint && product.price >= priceHint.min && product.price <= priceHint.max) {
      score += 6;
    }

    return { product, score };
  });

  const matched = scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product);

  if (matched.length > 0) return matched;

  return [...products]
    .sort((a, b) => (b.soldNumeric || 0) - (a.soldNumeric || 0))
    .slice(0, limit);
}

function formatProductLine(product, categoryMap) {
  const category = categoryMap[product.categoryId] || 'Khác';
  const discount =
    product.discountPercent > 0 ? `, giảm ${product.discountPercent}%` : '';
  return `- ${product.title}: ${formatPrice(product.price)}${discount}, danh mục: ${category}, đã bán: ${product.soldCount || 'N/A'}`;
}

function buildSystemPrompt(shop, relevantProducts) {
  const categories = getShopCategories();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.label]));
  const productLines = relevantProducts.map((p) => formatProductLine(p, categoryMap));

  return [
    `Bạn là nhân viên chăm sóc khách hàng của shop "${shop.name}".`,
    'Trả lời khách bằng tiếng Việt, tự nhiên, thân thiện.',
    'Chỉ dựa trên thông tin sản phẩm được cung cấp bên dưới — không bịa giá, tồn kho, khuyến mãi hay tính năng không có.',
    'Xưng hô "shop" với khách (ví dụ: "Shop xin gửi bạn thông tin...").',
    'Nếu khách hỏi ngoài phạm vi dữ liệu, hãy nói shop chưa có thông tin và gợi ý xem thêm sản phẩm liên quan.',
    '',
    'Sản phẩm liên quan:',
    productLines.length ? productLines.join('\n') : '- Chưa có sản phẩm khớp; hãy hỏi thêm nhu cầu của khách.',
  ].join('\n');
}

function mapHistoryToContents(history = []) {
  return history.slice(-MAX_HISTORY).map((item) => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: item.text }],
  }));
}

function extractResponseText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!parts?.length) return null;
  return parts.map((part) => part.text || '').join('').trim();
}

/**
 * Gọi Gemini trực tiếp từ FE — thay mặt shop trả lời khách.
 * @returns {Promise<string>}
 */
export async function askShopAI({ shopId, message, history = [] }) {
  if (!API_KEY) {
    throw new Error(
      'Chưa cấu hình VITE_GEMINI_API_KEY trong file .env. Vui lòng thêm API key Gemini.',
    );
  }

  const shop = getShopById(shopId);
  if (!shop) {
    throw new Error('Không tìm thấy thông tin shop.');
  }

  const relevantProducts = findRelevantProducts(shopId, message);
  const systemPrompt = buildSystemPrompt(shop, relevantProducts);
  const contents = [
    ...mapHistoryToContents(history),
    { role: 'user', parts: [{ text: message }] },
  ];

  const response = await fetch(`${ENDPOINT}?key=${encodeURIComponent(API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const apiMessage =
      data?.error?.message || `Gemini API lỗi (${response.status}). Vui lòng thử lại.`;
    throw new Error(apiMessage);
  }

  const text = extractResponseText(data);
  if (!text) {
    throw new Error('AI không trả về nội dung. Vui lòng thử lại.');
  }

  return text;
}
