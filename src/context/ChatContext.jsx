import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { askShopAI } from '../services/geminiService';
import {
  appendMessage,
  createMessage,
  filterConversations,
  getTotalUnread,
  loadConversations,
  markConversationRead,
  saveConversations,
  sortConversations,
  upsertConversation,
} from '../services/chatStorageService';
import { getShopById } from '../data/shopProfileMock';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState(() => loadConversations());
  const [activeShopId, setActiveShopId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const persist = useCallback((next) => {
    setConversations(next);
    saveConversations(next);
  }, []);

  const unreadTotal = useMemo(() => getTotalUnread(conversations), [conversations]);

  const filteredConversations = useMemo(
    () => sortConversations(filterConversations(conversations, searchQuery)),
    [conversations, searchQuery],
  );

  const activeConversation = useMemo(
    () => conversations.find((c) => c.shopId === activeShopId) || null,
    [conversations, activeShopId],
  );

  const openChat = useCallback((shopId, shopMeta) => {
    const shop = shopMeta || getShopById(shopId);
    if (!shop) return;

    const id = shop.id || shopId;
    setActiveShopId(id);
    setIsOpen(true);
    setError(null);

    setConversations((prev) => {
      let next = upsertConversation(prev, {
        shopId: id,
        shopName: shop.name,
        shopAvatar: shop.avatar,
      });
      next = markConversationRead(next, id);
      saveConversations(next);
      return next;
    });
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
    setError(null);
  }, []);

  const selectConversation = useCallback(
    (shopId) => {
      setActiveShopId(shopId);
      setError(null);
      setConversations((prev) => {
        const next = markConversationRead(prev, shopId);
        saveConversations(next);
        return next;
      });
    },
    [],
  );

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text?.trim();
      if (!trimmed || !activeShopId || isSending) return;

      const userMessage = createMessage('user', trimmed);
      const afterUser = appendMessage(conversations, activeShopId, userMessage);
      persist(afterUser);
      setIsSending(true);
      setError(null);

      try {
        const history = afterUser
          .find((c) => c.shopId === activeShopId)
          ?.messages.filter((m) => m.id !== userMessage.id)
          .map((m) => ({ role: m.role, text: m.text }));

        const replyText = await askShopAI({
          shopId: activeShopId,
          message: trimmed,
          history,
        });

        const assistantMessage = createMessage('assistant', replyText);
        const afterReply = appendMessage(afterUser, activeShopId, assistantMessage, {
          incrementUnread: !isOpen,
        });
        persist(afterReply);
      } catch (err) {
        setError(err.message || 'Không gửi được tin nhắn. Vui lòng thử lại.');
      } finally {
        setIsSending(false);
      }
    },
    [activeShopId, conversations, isOpen, isSending, persist],
  );

  const value = useMemo(
    () => ({
      isOpen,
      unreadTotal,
      conversations: filteredConversations,
      activeShopId,
      activeConversation,
      searchQuery,
      isSending,
      error,
      openChat,
      closeChat,
      toggleChat,
      selectConversation,
      setSearchQuery,
      sendMessage,
    }),
    [
      isOpen,
      unreadTotal,
      filteredConversations,
      activeShopId,
      activeConversation,
      searchQuery,
      isSending,
      error,
      openChat,
      closeChat,
      toggleChat,
      selectConversation,
      sendMessage,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return ctx;
}
