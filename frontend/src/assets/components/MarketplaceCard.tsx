import React from 'react';
import { Link } from 'react-router-dom';
import { MapPoint as MapPin, Gift, ChatLine } from "@solar-icons/react";
import { useTheme } from '../../context/ThemeContext';
import { 
  Button, 
  Typography, 
  Avatar, 
  Box, 
  Chip,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton
} from '@mui/material';

const MarketplaceCard = ({ item }) => {
  const { colors } = useTheme();

  return (
    <Card 
      component={Link}
      to={`/product/${item.id}`}
      sx={{ 
        maxWidth: 345, 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        textDecoration: 'none',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
        },
        backgroundColor: colors.bgSecondary,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Header with user info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              fontSize: '0.9rem',
              fontWeight: 700,
              bgcolor: colors.bgTertiary,
              color: colors.textPrimary
            }}
          >
            {item.seller.avatar}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2 }}>
              {item.seller.name}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              {item.timePosted}
            </Typography>
          </Box>
        </Box>
        {item.is_boosted && (
          <Chip 
            label="Premium" 
            size="small" 
            sx={{ 
              bgcolor: colors.coralLight, 
              color: colors.coral, 
              fontWeight: 700,
              fontSize: '0.65rem',
              height: '20px'
            }} 
          />
        )}
      </Box>

      {/* Product Image */}
      <Box sx={{ position: 'relative', pt: '75%', bgcolor: colors.bgTertiary, overflow: 'hidden' }}>
        {item.image && item.image !== '??' ? (
          <CardMedia
            component="img"
            image={item.image}
            alt={item.title}
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: colors.textMuted,
            fontSize: '2rem'
          }}>
            ??
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, color: colors.textSecondary }}>
          <MapPin size={14} weight="BoldDuotone" color={colors.iconCoral} />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {item.city}, {item.district}
          </Typography>
        </Box>

        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 800, 
            color: colors.textPrimary, 
            fontSize: '1.1rem',
            lineHeight: 1.3,
            mb: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.8rem'
          }}
        >
          {item.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {item.condition && (
            <Chip 
              label={item.condition} 
              size="small" 
              variant="outlined"
              sx={{ 
                height: '24px', 
                fontSize: '0.7rem', 
                fontWeight: 600,
                color: colors.textSecondary,
                borderColor: colors.border
              }} 
            />
          )}
          {item.age_range && (
            <Chip 
              label={item.age_range} 
              size="small" 
              variant="outlined"
              sx={{ 
                height: '24px', 
                fontSize: '0.7rem', 
                fontWeight: 600,
                color: colors.textSecondary,
                borderColor: colors.border
              }} 
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {item.price ? (
            <Typography variant="h6" sx={{ fontWeight: 900, color: colors.coral }}>
              £{item.price}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: colors.success }}>
              <Gift size={20} weight="BoldDuotone" />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                FREE
              </Typography>
            </Box>
          )}

          <Button 
            variant="contained" 
            size="small"
            startIcon={<ChatLine size={16} weight="BoldDuotone" />}
            sx={{ 
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: colors.coral,
              '&:hover': {
                bgcolor: colors.coralHover,
              },
              boxShadow: 'none',
              px: 2
            }}
          >
            Contact
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MarketplaceCard;
