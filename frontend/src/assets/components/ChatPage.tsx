import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ChevronRight, Check, CheckCheck, MessageCircle, Clock, Search } from 'lucide-react';
import { Box as Package, Shop as Store } from '@solar-icons/react';
import { useTheme } from "../../context/ThemeContext";
import echo from '../../echo';

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender?: { id: number; name: string; avatar?: string };
  is_read: boolean;
  read_at?: string;
  created_at: string;
  is_optimistic?: boolean; // New field for optimistic updates
}

interface Conversation {
  id: number;
  slug: string;
  product: {
    id: number;
    title: string;
    slug: string;
    thumbnail?: string;
    price?: number;
    currency?: string;
  };
  buyer: {
    id: number;
    name: string;
    avatar?: string;
  };
  seller: {
    id: number;
    name: string;
    avatar?: string;
  };
  last_message_at: string;
  unread_count: number;
}

const ChatPage: React.FC = () => {
  const { conversationSlug } = useParams<{ conversationSlug: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  
  // Conversations list state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  
  // Active conversation state
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id || 1;

  // Fetch all conversations
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch active conversation and messages when conversationSlug changes
  useEffect(() => {
    if (conversationSlug) {
      fetchMessages(true);
      // Mark as read in the local list immediately if we find it
      setConversations(prev => prev.map(c => 
        c.slug === conversationSlug ? { ...c, unread_count: 0 } : c
      ));
    } else {
      setActiveConversation(null);
      setMessages([]);
    }
  }, [conversationSlug]);

  // Real-time listening
  useEffect(() => {
    if (!conversationSlug || !activeConversation) return;

    // Listen for new messages
    const channel = echo.private(`conversation.${activeConversation.id}`)
      .listen('.message.sent', (e: any) => {
        console.log('New message received:', e);
        setMessages((prev) => {
          if (prev.some(m => m.id === e.message.id)) return prev;
          return [...prev, e.message];
        });
      })
      .listen('.message.read', (e: any) => {
        console.log('Messages read by other user:', e);
        if (e.read_by !== currentUserId) {
          setMessages((prev) => prev.map(m => 
            m.sender_id === currentUserId ? { ...m, is_read: true, read_at: e.read_at } : m
          ));
        }
      });

    return () => {
      channel.stopListening('.message.sent');
      channel.stopListening('.message.read');
    };
  }, [conversationSlug, activeConversation]);

  // Poll for new messages in active conversation
  useEffect(() => {
    if (!conversationSlug) return;
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [conversationSlug]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/conversations');
      if (res.data.status === 'success') {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchMessages = async (showLoading = true) => {
    if (!conversationSlug) return;
    if (showLoading) setMessagesLoading(true);
    try {
      const res = await axios.get(`/api/conversations/${conversationSlug}/messages`);
      if (res.data.status === 'success') {
        const serverMessages = res.data.messages;
        
        setMessages(prev => {
          // Keep only messages that are currently "Sending..." (optimistic)
          const optimisticMessages = prev.filter(m => m.is_optimistic);
          
          // Merge server messages with pending optimistic ones
          // We filter out any server messages that might have already been confirmed by handleSendMessage
          // to prevent double-rendering while keeping the "Sending..." ones at the bottom
          return [...serverMessages, ...optimisticMessages];
        });

        setActiveConversation(res.data.conversation);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      if (showLoading) setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !conversationSlug) return;

    // 1. Create optimistic message
    const tempId = Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      content: content,
      sender_id: currentUserId,
      is_read: false,
      created_at: new Date().toISOString(),
      is_optimistic: true
    };

    // 2. Add to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const res = await axios.post(`/api/conversations/${conversationSlug}/messages`, {
        content: content,
      });

      if (res.data.status === 'success') {
        // 3. Replace optimistic message with actual message from server
        setMessages(prev => prev.map(m => 
          m.id === tempId ? res.data.message : m
        ));

        // Update last message in the list
        setConversations(prev => prev.map(c => 
          c.slug === conversationSlug 
            ? { ...c, last_message_at: new Date().toISOString() } 
            : c
        ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // 4. Handle error: remove optimistic message or show error state
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(content); // Restore message text
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (msg: Message) => msg.sender_id === currentUserId;
  
  const getOtherPerson = (conv: Conversation | null = activeConversation) => {
    if (!conv) return null;
    return conv.buyer.id === currentUserId ? conv.seller : conv.buyer;
  };

  const getImageUrl = (thumbnail: any) => {
    if (!thumbnail) return null;
    if (typeof thumbnail === 'string') {
      if (thumbnail.startsWith('http')) return thumbnail;
      return `http://127.0.0.1:8000/storage/${thumbnail.replace("public/", "")}`;
    }
    if (thumbnail.url && thumbnail.url.startsWith('http')) return thumbnail.url;
    if (thumbnail.file_path) return `http://127.0.0.1:8000/storage/${thumbnail.file_path.replace("public/", "")}`;
    return null;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const otherPerson = getOtherPerson();

  return (
    <div style={{ 
      height: 'calc(100vh - 80px)', // Assuming header is 80px
      display: 'flex', 
      backgroundColor: colors.bgPrimary,
      overflow: 'hidden'
    }}>
      {/* Sidebar - Conversation List */}
      <div style={{
        width: '380px',
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.bgSecondary,
        flexShrink: 0,
      }}>
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${colors.border}` }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: colors.textPrimary, margin: 0 }}>Messages</h1>
          <div style={{ 
            marginTop: '16px', 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: colors.textMuted }} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: colors.bgTertiary,
                color: colors.textPrimary,
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {conversationsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
              <MessageCircle size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <p>No messages yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {conversations.map((conv) => {
                const isSelected = conversationSlug === conv.slug;
                const op = getOtherPerson(conv);
                const unread = conv.unread_count > 0;
                
                return (
                  <div
                    key={conv.id}
                    onClick={() => navigate(`/chat/${conv.slug}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? colors.bgTertiary : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: colors.bgTertiary,
                      flexShrink: 0,
                      position: 'relative'
                    }}>
                      {getImageUrl(conv.product.thumbnail) ? (
                        <img 
                          src={getImageUrl(conv.product.thumbnail) || ''} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <Package size={24} style={{ margin: '16px', opacity: 0.3 }} />
                      )}
                      {unread && (
                        <div style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: colors.primary,
                          border: `2px solid ${colors.bgSecondary}`
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: unread ? '800' : '700', color: colors.textPrimary, fontSize: '15px' }}>
                          {op?.name}
                        </span>
                        <span style={{ fontSize: '11px', color: colors.textMuted }}>
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: unread ? colors.textPrimary : colors.textSecondary,
                        fontWeight: unread ? '600' : '400',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {conv.product.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.bgPrimary }}>
        {!conversationSlug ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: colors.textMuted,
            padding: '40px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: colors.bgTertiary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <MessageCircle size={40} style={{ opacity: 0.3 }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, marginBottom: '8px' }}>Select a conversation</h3>
            <p>Choose a chat from the left to start messaging</p>
          </div>
        ) : messagesLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: colors.textMuted }}>Loading messages...</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: `1px solid ${colors.border}`,
              backgroundColor: colors.bgSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.bgSecondary,
                  fontWeight: '700'
                }}>
                  {otherPerson?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.textPrimary, margin: 0 }}>
                    {otherPerson?.name}
                  </h2>
                  <div style={{ fontSize: '12px', color: colors.success, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.success }} />
                    Online
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* Product Header at the beginning */}
              {activeConversation?.product && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '32px 20px',
                  backgroundColor: colors.bgSecondary,
                  borderRadius: '20px',
                  marginBottom: '32px',
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: colors.bgTertiary,
                    marginBottom: '16px',
                    cursor: 'pointer'
                  }} onClick={() => navigate(`/announcements/${activeConversation.product.slug}`)}>
                    {getImageUrl(activeConversation.product.thumbnail) ? (
                      <img 
                        src={getImageUrl(activeConversation.product.thumbnail) || ''} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <Package size={40} style={{ margin: '30px', opacity: 0.2 }} />
                    )}
                  </div>
                  <h3 
                    style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, margin: '0 0 4px 0', cursor: 'pointer' }}
                    onClick={() => navigate(`/announcements/${activeConversation.product.slug}`)}
                  >
                    {activeConversation.product.title}
                  </h3>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: colors.primary, marginBottom: '16px' }}>
                    {activeConversation.product.price} {activeConversation.product.currency || 'DH'}
                  </div>
                  <button
                    onClick={() => navigate(`/announcements/${activeConversation.product.slug}`)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '20px',
                      backgroundColor: colors.bgTertiary,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`,
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    View Listing Details
                  </button>
                </div>
              )}

              {/* Message List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((msg, index) => {
                  const mine = isMyMessage(msg);
                  const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
                  
                  return (
                    <div key={msg.id} style={{
                      display: 'flex',
                      justifyContent: mine ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}>
                      {!mine && (
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: colors.bgTertiary, flexShrink: 0, overflow: 'hidden', visibility: showAvatar ? 'visible' : 'hidden' }}>
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: colors.textMuted }}>
                            {otherPerson?.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                      
                      <div style={{
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: mine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        backgroundColor: mine ? colors.primary : colors.bgTertiary,
                        color: mine ? colors.bgSecondary : colors.textPrimary,
                        position: 'relative',
                        boxShadow: colors.shadow
                      }}>
                        <div style={{ fontSize: '14px', lineHeight: '1.5', opacity: msg.is_optimistic ? 0.7 : 1 }}>{msg.content}</div>
                        <div style={{ 
                          fontSize: '10px', 
                          marginTop: '4px', 
                          opacity: 0.7, 
                          textAlign: 'right',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '4px'
                        }}>
                          {msg.is_optimistic ? 'Sending...' : new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {mine && !msg.is_optimistic && (msg.is_read ? <CheckCheck size={12} /> : <Check size={12} />)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} style={{
              padding: '20px 24px',
              backgroundColor: colors.bgSecondary,
              borderTop: `1px solid ${colors.border}`,
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <input 
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '24px',
                  border: `2px solid ${colors.border}`,
                  backgroundColor: colors.bgPrimary,
                  color: colors.textPrimary,
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || sending}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: colors.primary,
                  color: colors.bgSecondary,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                  opacity: sending || !newMessage.trim() ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <Send size={20} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
