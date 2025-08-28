import React from 'react';
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
  accessibilityMode
}) => {
  return (
    <div 
      className="desktop-menu"
      style={{ 
        top: `${Math.min(position.y, window.innerHeight - 320)}px`, 
        left: `${Math.min(position.x, window.innerWidth - 220)}px` 
      }}
    >
      <MenuItem icon="new" label="New File" />
      <MenuItem icon="terminal" label="Open Terminal" />
      <MenuItem icon="settings" label="Settings" />
      <div className="menu-divider"></div>
      <MenuItem 
        icon="color-sunset" 
        label="Sunset Theme" 
        onClick={() => onThemeChange('sunset')} 
      />
      <MenuItem 
        icon="color-neon" 
        label="Neon Theme" 
        onClick={() => onThemeChange('neonCrt')} 
      />
      <MenuItem 
        icon="color-amber" 
        label="Amber Theme" 
        onClick={() => onThemeChange('amber')} 
      />
      <MenuItem 
        icon="color-matrix" 
        label="Matrix Theme" 
        onClick={() => onThemeChange('matrix')} 
      />
      <div className="menu-divider"></div>
      <MenuItem 
        isToggle={true}
        isActive={crtEffect}
        icon="" 
        label={crtEffect ? 'Disable CRT Effect' : 'Enable CRT Effect'} 
        onClick={onToggleCrtEffect}
      />
      <MenuItem 
        isToggle={true}
        isActive={accessibilityMode}
        icon="" 
        label={accessibilityMode ? 'Disable Accessibility Mode' : 'Enable Accessibility Mode'} 
        onClick={onToggleAccessibilityMode}
      />
      <div className="menu-divider"></div>
      <MenuItem icon="boot" label="Replay Boot Sequence" />
    </div>
  );
};

export default DesktopMenu;
