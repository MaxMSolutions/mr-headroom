import React, { useEffect, useRef } from 'react';
import { ThemeName } from '../../ThemeContext';
import ContextMenu, { ContextMenuItem } from '../ContextMenu';
import './DesktopMenu.css';

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

  // Generate menu items
  const getMenuItems = (): ContextMenuItem[] => {
    return [
      {
        label: 'New File',
        icon: '+',
        onClick: () => {
          onOpenApp?.('TextEditor');
          onClose();
        }
      },
      {
        label: 'Open Terminal',
        icon: '>',
        onClick: () => {
          onOpenApp?.('Terminal');
          onClose();
        }
      },
      {
        label: 'Settings',
        icon: '⚙',
        onClick: () => {
          onOpenApp?.('Settings');
          onClose();
        }
      },
      { separator: true, label: '' },
      {
        label: 'Sunset Theme',
        icon: '🎨',
        onClick: () => {
          onThemeChange('sunset');
          onClose();
        }
      },
      {
        label: 'Amber Theme',
        icon: '🟡',
        onClick: () => {
          onThemeChange('amber');
          onClose();
        }
      },
      {
        label: 'Matrix Theme',
        icon: '🟢',
        onClick: () => {
          onThemeChange('matrix');
          onClose();
        }
      },
      { separator: true, label: '' },
      {
        label: crtEffect ? 'Disable CRT Effect' : 'Enable CRT Effect',
        icon: crtEffect ? '📺' : '📺',
        onClick: () => {
          onToggleCrtEffect();
          onClose();
        }
      },
      {
        label: accessibilityMode ? 'Disable Accessibility Mode' : 'Enable Accessibility Mode',
        icon: accessibilityMode ? '♿' : '♿',
        onClick: () => {
          onToggleAccessibilityMode();
          onClose();
        }
      },
      { separator: true, label: '' },
      {
        label: 'Replay Boot Sequence',
        icon: '↻',
        onClick: () => {
          // Add Boot Sequence replay handler here
          onClose();
        }
      }
    ];
  };

  return (
    <ContextMenu
      x={Math.min(position.x, window.innerWidth - 220)}
      y={Math.min(position.y, window.innerHeight - 320)}
      items={getMenuItems()}
      onClose={onClose}
      className="desktop-menu"
      maxHeight={320}
    />
  );
};

export default DesktopMenu;
