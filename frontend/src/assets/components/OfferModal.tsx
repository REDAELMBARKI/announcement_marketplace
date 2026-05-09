import React, { useState } from 'react';
import axios from 'axios';
import { X, Send, Tag } from 'lucide-react';
import { Banknote } from '@solar-icons/react';
import { useTheme } from "../../context/ThemeContext";

interface OfferModalProps {
  product: {
    id: number;
    title: string;
    price: number;
    slug: string;
    currency?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const OfferModal: React.FC<OfferModalProps> = ({ product, onClose, onSuccess }) => {
  const { colors } = useTheme();
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currency = product.currency || 'DH';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`/api/announcements/${product.slug}/offers`, {
        offer_price: parseFloat(offerPrice),
        message: message || undefined,
      });

      if (res.data.status === 'success') {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit offer');
    } finally {
      setLoading(false);
    }
  };

  const discount = offerPrice 
    ? Math.round(((product.price - parseFloat(offerPrice)) / product.price) * 100)
    : 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
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
        maxWidth: '420px',
        padding: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: colors.textPrimary }}>Make an Offer</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: colors.textSecondary }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ backgroundColor: colors.bgTertiary, padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '4px' }}>Original Price</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={20} color={colors.primary} />
            {product.price} {currency}
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: colors.bgTertiary, border: `1px solid ${colors.danger}`, color: colors.danger, padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: colors.textPrimary }}>
              Your Offer
            </label>
            <div style={{ position: 'relative' }}>
              <Banknote size={20} weight="BoldDuotone" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.primary }} />
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={product.price}
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder={`Enter your offer in ${currency}`}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: `2px solid ${colors.border}`,
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: colors.bgPrimary,
                  color: colors.textPrimary,
                  outline: 'none'
                }}
                required
              />
            </div>
            {offerPrice && (
              <div style={{ marginTop: '8px', fontSize: '13px' }}>
                {discount > 0 ? (
                  <span style={{ color: colors.success, fontWeight: '600' }}>
                    You save {discount}% ({ (product.price - parseFloat(offerPrice)).toFixed(2) } {currency})
                  </span>
                ) : (
                  <span style={{ color: colors.danger }}>Offer must be less than original price</span>
                )}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: colors.textPrimary }}>
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to the seller..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${colors.border}`,
                borderRadius: '10px',
                fontSize: '14px',
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                backgroundColor: colors.bgPrimary,
                color: colors.textPrimary,
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !offerPrice || parseFloat(offerPrice) >= product.price}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading || !offerPrice || parseFloat(offerPrice) >= product.price ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Send size={18} />
            {loading ? 'Sending...' : 'Send Offer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;
