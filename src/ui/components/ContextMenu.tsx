import React, { useEffect, useRef, useState } from 'react';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onMenuItemAction?: (action: string, iconId: string) => void;
  onClose: () => void;
  className?: string;
  maxHeight?: number;
}

export interface ContextMenuItem {
  label: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
  action?: string;   // Action identifier (e.g., 'open', 'properties')
  iconId?: string;   // ID of the icon this menu item relates to
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onMenuItemAction, onClose, className = "context-menu", maxHeight }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  // Adjust position to ensure menu stays within viewport
  useEffect(() => {
    if (!menuRef.current) return;
    
    const { width, height } = menuRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const adjustedX = x + width > windowWidth ? windowWidth - width - 5 : x;
    const adjustedY = y + height > windowHeight ? windowHeight - height - 5 : y;
    
    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y]);
  
  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        console.log('Context menu: Click outside detected, closing');
        onClose();
      }
    };
    
    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('Context menu: Escape key pressed, closing');
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Handle menu item click with explicit action
  const handleItemClick = (item: ContextMenuItem) => {
    console.log(`Context menu: Item clicked - ${item.label}`);
    
    if (item.disabled) {
      console.log(`Context menu: Item ${item.label} is disabled, ignoring click`);
      return;
    }
    
    // Handle click with explicit action identifier
    if (item.action && item.iconId && onMenuItemAction) {
      console.log(`Context menu: Executing action ${item.action} for icon ${item.iconId}`);
      onMenuItemAction(item.action, item.iconId);
    }
    // Fallback to legacy onClick handler if available
    else if (item.onClick) {
      console.log(`Context menu: Using legacy onClick handler for ${item.label}`);
      try {
        item.onClick();
      } catch (error) {
        console.error('Error in context menu handler:', error);
      }
    }
    
    // Close the menu after handling the click
    onClose();
  };

  // Add a debug logger for initial render
  useEffect(() => {
    console.log('Context menu rendered with items:', items);
  }, [items]);

  return (
    <div 
      className={className} 
      ref={menuRef} 
      style={{ 
        left: position.x + 'px', 
        top: position.y + 'px',
        ...(maxHeight && { maxHeight: maxHeight + 'px', overflowY: 'auto' })
      }}
    >
      {items.map((item, index) => (
        item.separator ? (
          <div key={`separator-${index}`} className="context-menu-separator" />
        ) : (
          <button 
            key={`${item.label}-${index}`}
            className={`context-menu-item ${item.disabled ? 'disabled' : ''}`}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            type="button"
            data-item-name={item.label}
            data-action={item.action}
            data-icon-id={item.iconId}
          >
            {item.icon && <span className="context-menu-icon">{item.icon}</span>}
            {item.label}
          </button>
        )
      ))}
    </div>
  );
};

export default ContextMenu;
