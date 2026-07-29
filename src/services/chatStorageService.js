const STORAGE_KEY = 'nexus_shop_chat_conversations';

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadConversations() {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed;
}

export function saveConversations(conversations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function createMessage(role, text) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    createdAt: Date.now(),
  };
}

export function getTotalUnread(conversations) {
  return conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
}

export function upsertConversation(conversations, shopMeta) {
  const existingIndex = conversations.findIndex((c) => c.shopId === shopMeta.shopId);
  if (existingIndex >= 0) {
    const updated = [...conversations];
    updated[existingIndex] = {
      ...updated[existingIndex],
      shopName: shopMeta.shopName,
      shopAvatar: shopMeta.shopAvatar,
    };
    return updated;
  }

  return [
    {
      shopId: shopMeta.shopId,
      shopName: shopMeta.shopName,
      shopAvatar: shopMeta.shopAvatar,
      unreadCount: 0,
      lastMessage: '',
      lastMessageAt: Date.now(),
      messages: [
        createMessage(
          'assistant',
          `Xin chào! Shop ${shopMeta.shopName} sẵn sàng hỗ trợ bạn. Bạn cần tư vấn sản phẩm nào ạ?`,
        ),
      ],
    },
    ...conversations,
  ];
}

export function appendMessage(conversations, shopId, message, { incrementUnread = false } = {}) {
  return conversations.map((conv) => {
    if (conv.shopId !== shopId) return conv;

    const unreadCount =
      incrementUnread && message.role === 'assistant'
        ? (conv.unreadCount || 0) + 1
        : conv.unreadCount || 0;

    return {
      ...conv,
      messages: [...conv.messages, message],
      lastMessage: message.text,
      lastMessageAt: message.createdAt,
      unreadCount,
    };
  });
}

export function markConversationRead(conversations, shopId) {
  return conversations.map((conv) =>
    conv.shopId === shopId ? { ...conv, unreadCount: 0 } : conv,
  );
}

export function sortConversations(conversations) {
  return [...conversations].sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
}

export function filterConversations(conversations, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return conversations;
  return conversations.filter(
    (conv) =>
      conv.shopName?.toLowerCase().includes(q) ||
      conv.lastMessage?.toLowerCase().includes(q),
  );
}
