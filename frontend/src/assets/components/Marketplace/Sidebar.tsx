import React, { useState } from 'react';
import { 
  Search, 
  ChevronRight, 
  Check,
  Camera,
  X,
  ChevronDown
} from 'lucide-react';
import { 
  MapPoint as MapPin, 
  Bag as ShoppingBag, 
  Gift,
  Shop as Store,
  Tag,
  User,
  UsersGroupRounded as People
} from '@solar-icons/react';
import { useTheme } from '../../../context/ThemeContext';
import CustomSelect from '../Common/CustomSelect';

interface SidebarProps {
  initData: any;
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onToggleArrayFilter: (key: string, value: any) => void;
  onReset: () => void;
  onApply: () => void;
  resultsCount: number;
  loading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  initData,
  filters,
  onFilterChange,
  onToggleArrayFilter,
  onReset,
  onApply,
  resultsCount,
  loading = false
}) => {
  const { colors } = useTheme();
  const [sizeTab, setSizeTab] = useState<'clothes' | 'shoes'>('clothes');

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      fontSize: '12px',
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px'
    }}>
      {children}
    </div>
  );

  const Skeleton = () => (
    <div style={{ height: '40px', backgroundColor: colors.bgTertiary, borderRadius: '10px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }} />
  );

  if (loading && !initData) {
    return (
      <aside style={{ 
        width: '280px', 
        borderRight: `1px solid ${colors.sidebarBorder}`, 
        backgroundColor: colors.bgSecondary, 
        height: 'calc(100vh - 80px)', 
        position: 'sticky',
        top: '80px',
        padding: '16px' 
      }}>
        {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} />)}
      </aside>
    );
  }

  return (
    <aside style={{ 
      width: '280px', 
      borderRight: `1px solid ${colors.sidebarBorder}`, 
      backgroundColor: colors.bgSecondary, 
      height: 'calc(100vh - 80px)', 
      position: 'sticky', 
      top: '80px', 
      display: 'flex', 
      flexDirection: 'column',
      zIndex: 10
    }}>
      {/* Top Row — Clear Only */}
      <div style={{ 
        padding: '10px 16px', 
        backgroundColor: colors.filterBg, 
        borderBottom: `1px solid ${colors.filterBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexShrink: 0
      }}>
        <button onClick={onReset} style={{ background: 'none', border: 'none', color: colors.textSecondary, fontSize: '12px', cursor: 'pointer', padding: 0 }}>Effacer tout</button>
      </div>

      {/* Scrollable Content */}
      <div className="custom-scrollbar" style={{ 
        padding: '12px 16px', 
        overflowY: 'auto', 
        flex: 1,
        scrollbarWidth: 'thin',
        scrollbarColor: `${colors.coral} ${colors.scrollbarTrack}`
      }}>
        {/* CSS for scrollbar */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: ${colors.scrollbarTrack}; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: ${colors.coral}; border-radius: 10px; }
        `}</style>

        {/* Catégorie */}
        <div style={{ marginBottom: '20px' }}>
          <SectionLabel>Catégorie</SectionLabel>
          <CustomSelect 
            options={initData?.categories || []}
            value={filters.category}
            onChange={(val) => onFilterChange('category', val)}
            placeholder="Choisir catégorie"
            icon={<ShoppingBag size={18} weight="BoldDuotone" color={colors.iconCoral} />}
          />
        </div>

        {/* Ville - Secteur */}
        <div style={{ marginBottom: '20px' }}>
          <SectionLabel>Ville - Secteur</SectionLabel>
          <CustomSelect 
            multiple={true}
            searchable={true}
            options={initData?.cities || []}
            value={filters.cities || []}
            onChange={(val) => onFilterChange('cities', val)}
            placeholder="Choisir ville - secteur"
            icon={<MapPin size={18} weight="BoldDuotone" color={colors.iconCoral} />}
          />
          {/* Selected city pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {(filters.cities || []).map((cityId: any) => {
              const city = initData?.cities.find((c: any) => c.id === cityId);
              if (!city) return null;
              return (
                <div key={cityId} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${colors.infoText}`, backgroundColor: colors.infoBg, color: colors.infoText, fontSize: '11px', fontWeight: '600' }}>
                  {city.label}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => onToggleArrayFilter('cities', cityId)} strokeWidth={2} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Type d'annonce */}
        <div style={{ marginBottom: '20px' }}>
          <SectionLabel>Type d'annonce</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {initData?.listingTypes.map((type: any) => {
              const Icon = type.value === 'sell' ? Store : Gift;
              const active = filters.mode?.includes(type.value);
              return (
                <div 
                  key={type.value} 
                  onClick={() => onToggleArrayFilter('mode', type.value)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={20} weight="BoldDuotone" color={active ? colors.coral : colors.iconMuted} />
                    <span style={{ fontSize: '14px', color: colors.textPrimary }}>{type.label}</span>
                  </div>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '4px', 
                    border: `1px solid ${active ? colors.coral : colors.border}`,
                    backgroundColor: active ? colors.coral : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {active && <Check size={14} color={colors.bgSecondary} strokeWidth={2} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tranche d'âge */}
        <div style={{ marginBottom: '20px' }}>
          <SectionLabel>Tranche d'âge</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {initData?.ageRanges.map((age: any) => {
              const active = filters.age_range?.includes(age.value);
              return (
                <button 
                  key={age.value}
                  onClick={() => onToggleArrayFilter('age_range', age.value)}
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    border: active ? 'none' : `1px solid ${colors.border}`,
                    backgroundColor: active ? colors.coral : colors.bgSecondary,
                    color: active ? colors.bgSecondary : colors.textSecondary,
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {age.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Genre */}
        <div style={{ marginBottom: '20px' }}>
          <SectionLabel>Genre</SectionLabel>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['girl', 'boy', 'both'].map((g) => {
              const active = filters.gender === g;
              const labels: any = { girl: 'Fille', boy: 'Garçon', both: 'Mixte' };
              const Icon = g === 'both' ? People : User;
              return (
                <button 
                  key={g}
                  onClick={() => onFilterChange('gender', filters.gender === g ? "" : g)}
                  style={{ 
                    flex: 1,
                    padding: '8px 0', 
                    borderRadius: '10px', 
                    border: active ? 'none' : `1px solid ${colors.border}`,
                    backgroundColor: active ? colors.coral : colors.bgSecondary,
                    color: active ? colors.bgSecondary : colors.textSecondary,
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Icon size={18} weight="BoldDuotone" color={active ? colors.bgSecondary : colors.iconMuted} />
                  {labels[g]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Taille */}
        <div style={{ marginBottom: '20px' }}>
          <SectionLabel>Taille</SectionLabel>
          <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, marginBottom: '12px' }}>
            <button 
              onClick={() => setSizeTab('clothes')}
              style={{ flex: 1, padding: '8px 0', background: 'none', border: 'none', borderBottom: sizeTab === 'clothes' ? `2px solid ${colors.coral}` : 'none', color: sizeTab === 'clothes' ? colors.coral : colors.textSecondary, fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              Vêtements
            </button>
            <button 
              onClick={() => setSizeTab('shoes')}
              style={{ flex: 1, padding: '8px 0', background: 'none', border: 'none', borderBottom: sizeTab === 'shoes' ? `2px solid ${colors.coral}` : 'none', color: sizeTab === 'shoes' ? colors.coral : colors.textSecondary, fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              Chaussures
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(sizeTab === 'clothes' ? initData?.clothingSizes : initData?.shoeSizes || []).map((s: any) => {
              const active = filters.sizes?.includes(s.value);
              return (
                <button 
                  key={s.value}
                  onClick={() => onToggleArrayFilter('sizes', s.value)}
                  style={{ 
                    padding: '4px 10px', 
                    borderRadius: '15px', 
                    border: active ? 'none' : `1px solid ${colors.border}`,
                    backgroundColor: active ? colors.coral : colors.bgSecondary,
                    color: active ? colors.bgSecondary : colors.textSecondary,
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* État */}
        <div style={{ marginBottom: '20px' }}>
          <SectionLabel>État</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {initData?.conditions.map((cond: any) => {
              const active = filters.condition === cond.value;
              return (
                <div 
                  key={cond.value}
                  onClick={() => onFilterChange('condition', filters.condition === cond.value ? "" : cond.value)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '10px 12px', 
                    cursor: 'pointer',
                    borderRadius: '0 8px 8px 0',
                    borderLeft: active ? `3px solid ${colors.coral}` : '3px solid transparent',
                    backgroundColor: active ? colors.coralLight : 'transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cond.color }} />
                  <span style={{ fontSize: '13px', color: active ? colors.coral : colors.textPrimary, fontWeight: active ? '600' : '400' }}>{cond.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prix */}
        <div style={{ marginBottom: '20px' }}>
          <SectionLabel>Prix</SectionLabel>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="number" 
                placeholder="Min" 
                value={filters.min_price}
                onChange={(e) => onFilterChange('min_price', e.target.value)}
                style={{ width: '100%', padding: '8px 40px 8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '13px', backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
              />
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: colors.textMuted }}>MAD</span>
            </div>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="number" 
                placeholder="Max" 
                value={filters.max_price}
                onChange={(e) => onFilterChange('max_price', e.target.value)}
                style={{ width: '100%', padding: '8px 40px 8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '13px', backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
              />
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: colors.textMuted }}>MAD</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: colors.textPrimary }}>Gratuit uniquement</span>
            {/* Simple toggle placeholder */}
            <div 
              onClick={() => onFilterChange('free_only', !filters.free_only)}
              style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: filters.free_only ? colors.coral : colors.bgTertiary, position: 'relative', cursor: 'pointer' }}
            >
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: colors.bgSecondary, position: 'absolute', left: filters.free_only ? '18px' : '2px', top: '2px', transition: 'left 0.2s' }} />
            </div>
          </div>
        </div>

        {/* Toggle Switches (bottom) */}
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'with_media', label: 'Annonces avec photos-vidéos uniquement', icon: <Camera size={14} strokeWidth={2} /> }
          ].map((item) => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: colors.darkNavy, color: colors.bgSecondary, padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <span style={{ flex: 1, fontSize: '12px', color: colors.textPrimary }}>{item.label}</span>
              <div 
                onClick={() => onFilterChange(item.key, !filters[item.key])}
                style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: filters[item.key] ? colors.coral : colors.bgTertiary, position: 'relative', cursor: 'pointer' }}
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: colors.bgSecondary, position: 'absolute', left: filters[item.key] ? '18px' : '2px', top: '2px', transition: 'left 0.2s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <div style={{ 
        padding: '16px', 
        borderTop: `1px solid ${colors.border}`, 
        backgroundColor: colors.bgSecondary,
        position: 'sticky',
        bottom: 0,
        zIndex: 5
      }}>
        <button 
          onClick={onApply}
          style={{ 
            width: '100%', 
            padding: '14px', 
            backgroundColor: colors.coral, 
            color: colors.bgSecondary, 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: '700', 
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: `0 4px 12px ${colors.coral}33`,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = colors.coralHover;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = colors.coral;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {loading ? 'Chargement...' : `Voir les annonces (${resultsCount})`}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
