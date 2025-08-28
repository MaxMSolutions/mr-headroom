import React, { useEffect, useRef } from 'react';
import { ThemeName } from '../../ThemeContext';
import './DesktopMenu.css';

interface MenuItemProps {
  icon: string;
  label: string;
  onClick?: () => void;
  isToggle?: boolean;
  isActive?: boolean;
}

interface DesktopMenuProps {
  position: { x: number; y: number };
  onThemeChange: (theme: ThemeName) => void;
  onToggleCrtEffect: () => void;
  onToggleAccessibilityMode: () => void;
  crtEffect: boolean;
  accessibilityMode: boolean;
  onClose: () => void;
  onOpenApp?: (appName: string) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  icon, 
  label, 
  onClick, 
  isToggle = false,
  isActive = false
}) => {
  return (
    <div className="menu-item" onClick={onClick}>
      {isToggle ? (
        <div className={`toggle-switch ${isActive ? 'active' : ''}`}></div>
      ) : icon.startsWith('color-') ? (
        <div className={`color-swatch ${icon.replace('color-', '')}`}></div>
      ) : (
        <div className={`menu-item-icon ${icon}-icon`}></div>
      )}
      <span>{label}</span>
    </div>
  );
};

const DesktopMenu: React.FC<DesktopMenuProps> = ({ 
  position, 
  onThemeChange, 
  onToggleCrtEffect,
  onToggleAccessibilityMode,
  crtEffect,
  accessibilityMode,
  onClose,
  onOpenApp
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="desktop-menu"
      style={{ 
        top: `${Math.min(position.y, window.innerHeight - 320)}px`, 
        left: `${Math.min(position.x, window.innerWidth - 220)}px` 
      }}
    >
      <MenuItem 
        icon="new" 
        label="New File" 
        onClick={() => {
          onOpenApp?.('TextEditor');
          onClose();
        }}
      />
      <MenuItem 
        icon="terminal" 
        label="Open Terminal" 
        onClick={() => {
          onOpenApp?.('Terminal');
          onClose();
        }}
      />
      <MenuItem 
        icon="settings" 
        label="Settings" 
        onClick={() => {
          onOpenApp?.('Settings');
          onClose();
        }}
      />
      <div className="menu-divider"></div>
      <MenuItem 
        icon="color-sunset" 
        label="Sunset Theme" 
        onClick={() => {
          onThemeChange('sunset');
          onClose();
        }} 
      />
      <MenuItem 
        icon="color-neon" 
        label="Neon Theme" 
        onClick={() => {
          onThemeChange('neonCrt');
          onClose();
        }} 
      />
      <MenuItem 
        icon="color-amber" 
        label="Amber Theme" 
        onClick={() => {
          onThemeChange('amber');
          onClose();
        }} 
      />
      <MenuItem 
        icon="color-matrix" 
        label="Matrix Theme" 
        onClick={() => {
          onThemeChange('matrix');
          onClose();
        }} 
      />
      <div className="menu-divider"></div>
      <MenuItem 
        isToggle={true}
        isActive={crtEffect}
        icon="" 
        label={crtEffect ? 'Disable CRT Effect' : 'Enable CRT Effect'} 
        onClick={() => {
          onToggleCrtEffect();
          onClose();
        }}
      />
      <MenuItem 
        isToggle={true}
        isActive={accessibilityMode}
        icon="" 
        label={accessibilityMode ? 'Disable Accessibility Mode' : 'Enable Accessibility Mode'} 
        onClick={() => {
          onToggleAccessibilityMode();
          onClose();
        }}
      />
      <div className="menu-divider"></div>
      <MenuItem 
        icon="boot" 
        label="Replay Boot Sequence" 
        onClick={() => {
          // Add Boot Sequence replay handler here
          onClose();
        }}
      />
    </div>
  );
};

export default DesktopMenu;
