/**
 * PatternNotification.tsx
 * A React component for showing notifications when patterns are activated
 */

import React, { useState, useEffect } from 'react';
import usePatternSystem from '../hooks/usePatternSystem';
import { PatternDefinition, PatternEvent } from '../../engine/mystery/PatternPuzzleSystem';
import './PatternNotification.css';

interface PatternNotificationProps {
  timeout?: number; // How long to show the notification in ms
}

/**
 * A component that shows a notification when a pattern is activated
 */
const PatternNotification: React.FC<PatternNotificationProps> = ({ 
  timeout = 5000
}) => {
  const [activeNotifications, setActiveNotifications] = useState<{
    pattern: PatternDefinition;
    id: string;
    timestamp: number;
    timeoutId?: number;
  }[]>([]);
  
  // Get singleton instance
  const { patterns } = usePatternSystem();

  useEffect(() => {
    // Function to handle pattern activation events
    const handlePatternEvent = (event: CustomEvent<PatternEvent>) => {
      if (event.detail.type === 'pattern_activated') {
        const patternId = event.detail.patternId;
        const pattern = patterns.find(p => p.id === patternId);
        
        if (pattern) {
          const notificationId = `${patternId}-${Date.now()}`;
          
          // Add the notification
          setActiveNotifications(prev => [...prev, {
            pattern,
            id: notificationId,
            timestamp: Date.now()
          }]);
          
          // Set a timeout to remove the notification
          const timeoutId = window.setTimeout(() => {
            setActiveNotifications(prev => 
              prev.filter(notification => notification.id !== notificationId)
            );
          }, timeout);
          
          // Store the timeout ID in the notification for cleanup
          return {
            pattern,
            id: notificationId,
            timestamp: Date.now(),
            timeoutId
          };
        }
      }
    };
    
    // Create event listener
    window.addEventListener('patternUpdate', handlePatternEvent as EventListener);
    
    return () => {
      window.removeEventListener('patternUpdate', handlePatternEvent as EventListener);
      
      // Clean up any active timeouts
      activeNotifications.forEach(notification => {
        if (notification.timeoutId) {
          window.clearTimeout(notification.timeoutId);
        }
      });
    };
  }, [patterns, timeout]);
  
  if (activeNotifications.length === 0) {
    return null;
  }
  
  return (
    <div className="pattern-notification-container">
      {activeNotifications.map(notification => (
        <div 
          key={notification.id}
          className="pattern-notification"
          style={{
            borderColor: notification.pattern.visualRepresentation?.color || '#888'
          }}
        >
          <div className="pattern-notification-icon">
            {notification.pattern.visualRepresentation?.icon && (
              <span className={`icon icon-${notification.pattern.visualRepresentation.icon}`} />
            )}
          </div>
          
          <div className="pattern-notification-content">
            <div className="pattern-notification-title">
              Pattern Discovered
            </div>
            <div className="pattern-notification-name">
              {notification.pattern.name}
            </div>
            <div className="pattern-notification-description">
              {notification.pattern.description}
            </div>
          </div>
          
          {notification.pattern.visualRepresentation?.animation && (
            <div className={`pattern-animation ${notification.pattern.visualRepresentation.animation}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default PatternNotification;
