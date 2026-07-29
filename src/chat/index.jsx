import { useEffect, useRef, useState } from 'react';
import {
  FiMessageCircle,
  FiSearch,
  FiSend,
  FiX,
  FiChevronLeft,
} from 'react-icons/fi';
import { useChat } from '../context/ChatContext';
import { SHOP_ID, shopProfile } from '../data/shopProfileMock';
import './index.scss';

function formatTime(timestamp) {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function ConversationList({
  conversations,
  activeShopId,
  searchQuery,
  onSearchChange,
  onSelect,
}) {
  return (
    <aside className="site-chat__sidebar">
      <div className="site-chat__search">
        <FiSearch aria-hidden="true" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm"
          aria-label="Tìm kiếm hội thoại"
        />
      </div>

      <div className="site-chat__conv-list">
        {conversations.length === 0 ? (
          <p className="site-chat__empty-list">
            Chưa có hội thoại. Bấm Chat tại trang shop để bắt đầu.
          </p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.shopId}
              type="button"
              className={`site-chat__conv-item ${
                activeShopId === conv.shopId ? 'is-active' : ''
              }`}
              onClick={() => onSelect(conv.shopId)}
            >
              <img src={conv.shopAvatar} alt="" className="site-chat__conv-avatar" />
              <div className="site-chat__conv-body">
                <div className="site-chat__conv-top">
                  <span className="site-chat__conv-name">{conv.shopName}</span>
                  <span className="site-chat__conv-time">{formatTime(conv.lastMessageAt)}</span>
                </div>
                <div className="site-chat__conv-bottom">
                  <span className="site-chat__conv-preview">{conv.lastMessage}</span>
                  {conv.unreadCount > 0 && (
                    <span className="site-chat__conv-badge">{conv.unreadCount}</span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

function MessageThread({ conversation, isSending, error, onSend, onOpenDemo }) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isSending]);

  if (!conversation) {
    return (
      <div className="site-chat__thread site-chat__thread--empty">
        <FiMessageCircle aria-hidden="true" />
        <p>Chọn shop để bắt đầu trò chuyện</p>
        <button type="button" className="site-chat__demo-btn" onClick={onOpenDemo}>
          Chat với {shopProfile.name}
        </button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  };

  return (
    <section className="site-chat__thread">
      <header className="site-chat__thread-header">
        <img src={conversation.shopAvatar} alt="" />
        <div>
          <h3>{conversation.shopName}</h3>
          <p>Shop phản hồi tự động bằng AI</p>
        </div>
      </header>

      <div className="site-chat__messages" aria-live="polite">
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`site-chat__bubble ${
              msg.role === 'user' ? 'site-chat__bubble--user' : 'site-chat__bubble--shop'
            }`}
          >
            <p>{msg.text}</p>
            <time>{formatTime(msg.createdAt)}</time>
          </div>
        ))}

        {isSending && (
          <div className="site-chat__bubble site-chat__bubble--shop site-chat__bubble--typing">
            <span />
            <span />
            <span />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && <p className="site-chat__error">{error}</p>}

      <form className="site-chat__composer" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Nhập tin nhắn..."
          aria-label="Nhập tin nhắn"
          disabled={isSending}
        />
        <button type="submit" disabled={isSending || !draft.trim()} aria-label="Gửi tin nhắn">
          <FiSend aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}

export default function SiteChatWidget() {
  const {
    isOpen,
    unreadTotal,
    conversations,
    activeShopId,
    activeConversation,
    searchQuery,
    isSending,
    error,
    toggleChat,
    closeChat,
    selectConversation,
    setSearchQuery,
    sendMessage,
    openChat,
  } = useChat();

  const [mobileShowThread, setMobileShowThread] = useState(false);

  useEffect(() => {
    if (!isOpen) setMobileShowThread(false);
  }, [isOpen]);

  useEffect(() => {
    if (activeShopId) setMobileShowThread(true);
  }, [activeShopId]);

  const handleSelectConversation = (shopId) => {
    selectConversation(shopId);
    setMobileShowThread(true);
  };

  const handleOpenDemo = () => {
    openChat(SHOP_ID, shopProfile);
    setMobileShowThread(true);
  };

  const handleSend = (text) => {
    sendMessage(text);
  };

  return (
    <>
      <button
        type="button"
        className="site-chat-fab"
        onClick={toggleChat}
        aria-expanded={isOpen}
        aria-label="Mở chat"
      >
        <FiMessageCircle aria-hidden="true" />
        <span>Chat</span>
        {unreadTotal > 0 && (
          <span className="site-chat-fab__badge">{unreadTotal > 99 ? '99+' : unreadTotal}</span>
        )}
      </button>

      {isOpen && (
        <div className="site-chat-panel" role="dialog" aria-label="Cửa sổ chat">
          <header className="site-chat-panel__header">
            <h2>Chat</h2>
            <button type="button" onClick={closeChat} aria-label="Đóng chat">
              <FiX aria-hidden="true" />
            </button>
          </header>

          <div className="site-chat-panel__body">
            {mobileShowThread && activeConversation && (
              <button
                type="button"
                className="site-chat-panel__back"
                onClick={() => setMobileShowThread(false)}
              >
                <FiChevronLeft aria-hidden="true" />
                Danh sách
              </button>
            )}

            <div
              className={`site-chat-panel__columns ${
                mobileShowThread ? 'site-chat-panel__columns--thread' : ''
              }`}
            >
              <ConversationList
                conversations={conversations}
                activeShopId={activeShopId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelect={handleSelectConversation}
              />

              <MessageThread
                conversation={activeConversation}
                isSending={isSending}
                error={error}
                onSend={handleSend}
                onOpenDemo={handleOpenDemo}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
