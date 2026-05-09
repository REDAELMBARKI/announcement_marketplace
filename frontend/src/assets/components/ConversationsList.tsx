import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronRight, Clock } from 'lucide-react';
import { Box as Package } from '@solar-icons/react';
import { useTheme } from "../../context/ThemeContext";

interface Conversation {
  id: number;
  slug: string;
  product: {
    id: number;
    title: string;
    slug: string;
    thumbnail?: string;
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

const ConversationsList: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id || 1;

  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/conversations');
      if (res.data.status === 'success') {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOtherPerson = (conversation: Conversation) => {
    return conversation.buyer.id === currentUserId 
      ? conversation.seller 
      : conversation.buyer;
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
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: colors.textSecondary }}>
        <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: colors.textPrimary,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <MessageCircle size={32} color={colors.primary} />
          Messages
        </h1>
        <p style={{ color: colors.textSecondary, marginTop: '8px' }}>
          {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
        </p>
      </div>

      {conversations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: colors.bgTertiary,
          borderRadius: '16px',
        }}>
          <Package size={64} style={{ opacity: 0.3, marginBottom: '20px', color: colors.primary }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, marginBottom: '8px' }}>
            No conversations yet
          </h3>
          <p style={{ color: colors.textSecondary, maxWidth: '400px', margin: '0 auto' }}>
            Start chatting with sellers by clicking "Chat with Seller" on any product listing.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {conversations.map((conversation) => {
            const otherPerson = getOtherPerson(conversation);
            const isUnread = conversation.unread_count > 0;

            return (
              <div
                key={conversation.id}
                onClick={() => navigate(`/chat/${conversation.slug}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: isUnread ? colors.bgTertiary : colors.bgSecondary,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: `1px solid ${isUnread ? colors.primary : 'transparent'}`,
                  boxShadow: isUnread ? `0 0 0 2px ${colors.primary}20` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {/* Product Image */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: colors.bgTertiary,
                }}>
                  {getImageUrl(conversation.product.thumbnail) ? (
                    <img
                      src={getImageUrl(conversation.product.thumbnail) || ''}
                      alt={conversation.product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Package size={32} style={{ margin: '14px', opacity: 0.4 }} />
                  )}
                </div>

                {/* Conversation Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ 
                      fontWeight: isUnread ? '700' : '600', 
                      color: colors.textPrimary,
                      fontSize: '16px',
                    }}>
                      {otherPerson.name}
                    </span>
                    {isUnread && (
                      <span style={{
                        backgroundColor: colors.primary,
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}>
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                  <p style={{
                    color: colors.textSecondary,
                    fontSize: '14px',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    Re: {conversation.product.title}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    marginTop: '4px',
                    fontSize: '12px',
                    color: colors.textMuted,
                  }}>
                    <Clock size={12} />
                    {formatTime(conversation.last_message_at)}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight size={20} color={colors.textMuted} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationsList;
