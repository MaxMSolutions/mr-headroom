import React from 'react';
import { ThemeName } from '../../ThemeContext';
import './StartMenu.css';
import './StartMenuEffects.css';
import './StartMenuWidthFixes.css'; // Add width fixes

interface StartMenuProps {
  onThemeChange: (theme: ThemeName) => void;
  onToggleCrtEffect: () => void;
  onToggleAccessibilityMode: () => void;
  crtEffect: boolean;
  accessibilityMode: boolean;
}

const StartMenu: React.FC<StartMenuProps> = ({
  onThemeChange,
  onToggleCrtEffect,
  onToggleAccessibilityMode,
  crtEffect,
  accessibilityMode
}) => {
  const [menuClass, setMenuClass] = React.useState("start-menu opening");
  
  // Remove the opening class after animation completes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMenuClass("start-menu");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Randomly trigger glitches in start menu
  const [glitchActive, setGlitchActive] = React.useState(false);
  
  React.useEffect(() => {
    const glitchInterval = setInterval(() => {
      // 1% chance of glitching
      if (Math.random() < 0.01) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 200 + Math.random() * 300);
      }
    }, 5000);
    
    return () => clearInterval(glitchInterval);
  }, []);
  
  // Helper function to launch apps
  const launchApp = (appName: string, props: Record<string, any> = {}) => {
    if (window.openApp) {
      window.openApp(appName, props);
    } else if (window.windowManager) {
      // Fallback if openApp is not available
      window.windowManager.addWindow({
        title: appName,
        component: appName,
        width: appName === 'Starfield' ? 650 : 700,
        height: appName === 'Starfield' ? 520 : 500,
        x: 100 + Math.random() * 50,
        y: 100 + Math.random() * 50,
        componentProps: props
      });
    }
  };
  
  return (
    <div className={`${menuClass} ${glitchActive ? 'menu-glitch' : ''}`}>
      <div className="start-menu-header">
        <div className="start-menu-logo">
          <span className="logo-cube">⌬</span>
          <span className="logo-text">NEXUS-9</span>
          <span className="logo-version">98</span>
        </div>
      </div>
      
      <div className="start-menu-content">
        <div className="start-menu-column main-column">
          <div className="menu-category">
            <div className="menu-item-large" onClick={() => launchApp('Terminal')}>
              <div className="menu-item-icon terminal-icon"></div>
              <span>Terminal</span>
            </div>
            <div className="menu-item-large" onClick={() => launchApp('FileManager')}>
              <div className="menu-item-icon files-icon"></div>
              <span>File Explorer</span>
            </div>
            <div className="menu-item-large" onClick={() => launchApp('TextEditor')}>
              <div className="menu-item-icon notes-icon"></div>
              <span>Research Notes</span>
            </div>
            <div className="menu-item-large" onClick={() => {
              // Show Reality Boundary Error dialog instead of launching Reality Simulator
              if (window.windowManager) {
                window.windowManager.addWindow({
                  title: 'System Error',
                  component: 'ErrorDialog',
                  width: 450,
                  height: 250,
                  componentProps: {
                    errorTitle: 'Reality Boundary Error',
                    errorMessage: 'CRITICAL ERROR: Reality desynchronization detected. Access to this program has been revoked by SYSTEM.',
                    errorCode: 'ERR_REALITY_BREACH'
                  }
                });
              }
            }}>
              <div className="menu-item-icon simulation-icon"></div>
              <span>Reality Simulator</span>
            </div>
            <div className="menu-item-large" onClick={() => launchApp('Starfield')}>
              <div className="menu-item-icon game-icon"></div>
              <span>STARFIELD.EXE</span>
            </div>
            <div className="menu-item-large">
              <div className="menu-item-icon glitch-icon"></div>
              <span className="simulation-text">BOUNDARY_TEST</span>
            </div>
            
            <div className="menu-divider with-glitch"></div>
            
            <div 
              className="menu-item-large"
              onClick={() => launchApp('Settings')}
            >
              <div className="menu-item-icon system-icon">
                <div className="system-cube">⌬</div>
              </div>
              <span>System Control</span>
            </div>
            
            <div className="menu-item-large" onClick={() => {
              if (window.windowManager) {
                window.windowManager.addWindow({
                  title: "System Log Viewer",
                  component: "LogViewer",
                  width: 700,
                  height: 500,
                  x: 100 + Math.random() * 50,
                  y: 100 + Math.random() * 50,
                  componentProps: {}
                });
              }
            }}>
              <div className="menu-item-icon warning-icon"></div>
              <span className="glitched-text">REALITY.LOG</span>
            </div>
          </div>
        </div>
        
        <div className="start-menu-column sidebar">
          <div className="user-profile">
            <div className="user-avatar"></div>
            <div className="user-name">MRHEADROOM</div>
            <div className="user-status">AWAKENING</div>
          </div>
          
          <div className="menu-divider reality-breach"></div>
          
          <div className="menu-item" onClick={() => launchApp('Nexus9')}>
            <div className="menu-item-icon nexus-icon"></div>
            <span>NEXUS-9</span>
          </div>
          
          <div className="theme-shortcuts">
            <div className="menu-item" onClick={() => onThemeChange('sunset')}>
              <div className="color-swatch sunset"></div>
              <span>Display (Sunset)</span>
            </div>
            <div className="menu-item" onClick={() => onThemeChange('amber')}>
              <div className="color-swatch amber"></div>
              <span>Display (Amber)</span>
            </div>
            <div className="menu-item" onClick={() => onThemeChange('matrix')}>
              <div className="color-swatch matrix"></div>
              <span>Display (Matrix)</span>
            </div>
          </div>
          
          <div className="menu-divider"></div>
          
          <div className="menu-item" onClick={onToggleCrtEffect}>
            <div className={`toggle-switch ${crtEffect ? 'active' : ''}`}></div>
            <span>CRT Display</span>
          </div>
          
          <div className="menu-item" onClick={onToggleAccessibilityMode}>
            <div className={`toggle-switch ${accessibilityMode ? 'active' : ''}`}></div>
            <span>Accessibility Options</span>
          </div>
          
          <div className="menu-divider"></div>
          
          <div className="menu-item" onClick={() => launchApp('BootSequence')}>
            <div className="menu-item-icon boot-icon"></div>
            <span>Restart System</span>
          </div>
          
          <div className="menu-item shutdown" onClick={() => {
            // Add shutdown animation or confirmation dialog here in the future
            if (window.confirm('Are you sure you want to shut down?')) {
              document.body.classList.add('shutdown-animation');
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }
          }}>
            <div className="menu-item-icon power-icon"></div>
            <span>Shut Down...</span>
          </div>
        </div>
      </div>
      
      <div className="start-menu-footer">
        <div className="system-info">NEXUS-9 OS</div>
        <div className="memory-info"><span className="reality-status">SIMULATION ACTIVE</span></div>
      </div>
    </div>
  );
};

export default StartMenu;
