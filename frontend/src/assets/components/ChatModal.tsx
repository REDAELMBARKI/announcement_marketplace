import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Send } from 'lucide-react';
import { useTheme } from "../../context/ThemeContext";

interface ChatModalProps {
  product: {
    id: number;
    title: string;
    slug: string;
    user?: {
      id: number;
      name: string;
      avatar?: string;
    };
  };
  currentUserId: number;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ product, currentUserId, onClose }) => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    try {
      // 1. Get or create conversation
      const convRes = await axios.post(`/api/announcements/${product.slug}/conversation`);
      
      if (convRes.data.status === 'success') {
        const conversationSlug = convRes.data.conversation.slug;
        
        // 2. Send initial message
        await axios.post(`/api/conversations/${conversationSlug}/messages`, {
          content: message.trim()
        });
        
        // 3. Navigate to chat page
        onClose();
        navigate(`/chat/${conversationSlug}`);
      }
    } catch (err: any) {
      console.error('Failed to start conversation:', err);
      const errorMessage = err.response?.data?.message || 'Failed to start conversation. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: colors.bgSecondary,
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        padding: '24px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: colors.textMuted
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          marginBottom: '8px',
          color: colors.textPrimary 
        }}>
          Chat with Seller
        </h2>
        <p style={{ color: colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>
          Interested in "{product.title}"? Send a message to {product.user?.name || 'the seller'}.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            autoFocus
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '16px',
              borderRadius: '12px',
              border: `2px solid ${colors.border}`,
              backgroundColor: colors.bgPrimary,
              color: colors.textPrimary,
              fontSize: '15px',
              marginBottom: '20px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />

          <button
            type="submit"
            disabled={!message.trim() || loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: !message.trim() || loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Send size={18} />
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
