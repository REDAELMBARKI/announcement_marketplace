import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Search, Check } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface Option {
  id: number | string;
  label: string;
  value?: string;
  icon?: string | React.ReactNode;
  districts?: { id: number; label: string }[];
}

interface CustomSelectProps {
  label?: string;
  options: Option[];
  value: any;
  onChange: (val: any) => void;
  multiple?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  renderType?: 'dropdown' | 'pills' | 'checkbox' | 'radio';
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  multiple = false,
  placeholder = "Choisir...",
  icon,
  searchable = false,
  renderType = 'dropdown'
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (optValue: any) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optValue)) {
        onChange(currentValues.filter(v => v !== optValue));
      } else {
        onChange([...currentValues, optValue]);
      }
    } else {
      onChange(optValue);
      setIsOpen(false);
    }
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (optValue: any) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optValue);
    }
    return value === optValue;
  };

  if (renderType === 'pills') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {options.map(opt => {
          const active = isSelected(opt.value || opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => handleToggle(opt.value || opt.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: active ? 'none' : `1px solid ${colors.border}`,
                backgroundColor: active ? colors.coral : colors.bgSecondary,
                color: active ? colors.bgSecondary : colors.textSecondary,
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px',
          borderRadius: '10px',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.bgSecondary,
          cursor: 'pointer',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
          {icon && <span style={{ color: colors.textSecondary, display: 'flex', alignItems: 'center' }}>{icon}</span>}
          <span style={{ 
            fontSize: '14px', 
            color: value ? colors.textPrimary : colors.textMuted,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {multiple && Array.isArray(value) && value.length > 0 
              ? `${value.length} sélectionné(s)` 
              : options.find(o => (o.value || o.id) === value)?.label || placeholder
            }
          </span>
        </div>
        <ChevronRight size={16} style={{ 
          color: colors.textMuted, 
          transform: isOpen ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.2s'
        }} strokeWidth={2} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 5px)',
          left: 0,
          right: 0,
          backgroundColor: colors.bgSecondary,
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto',
          border: `1px solid ${colors.border}`
        }}>
          {searchable && (
            <div style={{ padding: '10px', borderBottom: `1px solid ${colors.filterBorder}`, position: 'sticky', top: 0, backgroundColor: colors.bgSecondary }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} strokeWidth={2} />
                <input 
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 8px 8px 30px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    backgroundColor: colors.bgTertiary,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>
          )}
          
          <div style={{ padding: '5px' }}>
            {filteredOptions.map(opt => {
              const active = isSelected(opt.value || opt.id);
              return (
                <div 
                  key={opt.id}
                  onClick={() => handleToggle(opt.value || opt.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    backgroundColor: active ? colors.coralLight : 'transparent',
                    color: active ? colors.coral : colors.textPrimary,
                    fontSize: '14px',
                    fontWeight: active ? '600' : '400'
                  }}
                >
                  {multiple && (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: `1px solid ${active ? colors.coral : colors.border}`,
                      backgroundColor: active ? colors.coral : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {active && <Check size={12} color={colors.bgSecondary} strokeWidth={2} />}
                    </div>
                  )}
                  {opt.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{opt.icon}</span>}
                  <span style={{ flex: 1 }}>{opt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
