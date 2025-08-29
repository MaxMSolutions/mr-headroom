import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ui/ThemeContext';
import FileSystem from '../../engine/fileSystem';
import './SettingsWindow.css';
import ToggleSwitch from '../../ui/components/ToggleSwitch';
import { 
  IoColorPaletteOutline, 
  IoDesktopOutline, 
  IoAccessibilityOutline,
  IoSpeedometerOutline,
  IoSaveOutline,
  IoCloseOutline,
  IoWarningOutline,
  IoStatsChartOutline,
  IoHardwareChipOutline
} from 'react-icons/io5';

interface SettingsWindowProps {
  id: string;
  onClose: () => void;
  fileSystem?: FileSystem;
  title?: string; // Added title prop to match other window components
}

const SettingsWindow: React.FC<SettingsWindowProps> = ({ id, onClose, fileSystem, title }) => {
  const { 
    currentTheme, 
    setTheme, 
    crtEffect, 
    toggleCrtEffect, 
    accessibilityMode, 
    toggleAccessibilityMode 
  } = useTheme();

  const [bootMode, setBootMode] = useState<'normal' | 'verbose' | 'fast'>('normal');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    // Load saved boot mode setting
    const savedBootMode = localStorage.getItem('bootMode');
    if (savedBootMode && ['normal', 'verbose', 'fast'].includes(savedBootMode)) {
      setBootMode(savedBootMode as 'normal' | 'verbose' | 'fast');
    }

    // Rare random glitch effect for narrative purposes
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.01) { // 1% chance of glitch
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 500);
      }
    }, 15000);

    return () => clearInterval(glitchInterval);
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    // Brief visual glitch when saving
    setIsGlitching(true);
    
    try {
      localStorage.setItem('bootMode', bootMode);
      setSaveStatus('Configuration parameters updated successfully');
      
      setTimeout(() => {
        setIsGlitching(false);
        setTimeout(() => setSaveStatus(null), 2500);
      }, 300);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Error: Unable to write configuration data');
      
      // Longer glitch for error state
      setTimeout(() => {
        setIsGlitching(false);
        setTimeout(() => setSaveStatus(null), 3000);
      }, 500);
    }
  };

  const handleBootModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Brief micro-glitch when changing boot mode
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 150);
    
    setBootMode(e.target.value as 'normal' | 'verbose' | 'fast');
  };

  return (
    <div className={`settings-window ${isGlitching ? 'glitching' : ''}`} id={`settings-${id}`}>
      <div className="settings-content">
        <h2>
          <span className="header-icon-wrapper">
            <IoHardwareChipOutline className="settings-header-icon" />
          </span>
          <span>SYSTEM SETTINGS</span>
        </h2>
        
        <section className="settings-section">
          <h3>
            <span className="section-icon-wrapper">
              <IoDesktopOutline className="settings-section-icon" />
            </span>
            <span>Interface Configuration</span>
          </h3>
          <div className="settings-group">
            <label>
              <span className="label-icon-wrapper">
                <IoColorPaletteOutline className="settings-icon" />
              </span>
              <span>Visual Theme</span>
            </label>
            <div className="theme-selector">
              <button 
                className={`theme-option amber ${currentTheme === 'amber' ? 'selected' : ''}`} 
                onClick={() => setTheme('amber')}
              >
                Amber
              </button>
              <button 
                className={`theme-option matrix ${currentTheme === 'matrix' ? 'selected' : ''}`} 
                onClick={() => setTheme('matrix')}
              >
                Matrix
              </button>
              <button 
                className={`theme-option sunset ${currentTheme === 'sunset' ? 'selected' : ''}`} 
                onClick={() => setTheme('sunset')}
              >
                Sunset
              </button>
            </div>
          </div>
          
          <div className="settings-group">
            <label>
              <span className="label-icon-wrapper">
                <IoDesktopOutline className="settings-icon" />
              </span>
              <span>CRT Effect</span>
            </label>
            <ToggleSwitch
              id="crt-effect"
              checked={crtEffect}
              onChange={toggleCrtEffect}
              statusLabels={{ on: 'ENABLED', off: 'DISABLED' }}
            />
          </div>
          
          <div className="settings-group">
            <label>
              <span className="label-icon-wrapper">
                <IoAccessibilityOutline className="settings-icon" />
              </span>
              <span>Accessibility Mode</span>
            </label>
            <ToggleSwitch
              id="accessibility-mode"
              checked={accessibilityMode}
              onChange={toggleAccessibilityMode}
              statusLabels={{ on: 'ENABLED', off: 'DISABLED' }}
            />
          </div>
        </section>
        
        <section className="settings-section">
          <h3>
            <span className="section-icon-wrapper">
              <IoHardwareChipOutline className="settings-section-icon" />
            </span>
            <span>System Configuration</span>
          </h3>
          <div className="settings-group">
            <label htmlFor="boot-mode">
              <span className="label-icon-wrapper">
                <IoSpeedometerOutline className="settings-icon" />
              </span>
              <span>Boot Sequence</span>
            </label>
            <select 
              id="boot-mode" 
              value={bootMode} 
              onChange={handleBootModeChange}
            >
              <option value="normal">STANDARD</option>
              <option value="verbose">VERBOSE</option>
              <option value="fast">ACCELERATED</option>
            </select>
          </div>
        </section>
        
        <section className="settings-section system-monitor">
          <h3>
            <span className="section-icon-wrapper">
              <IoStatsChartOutline className="settings-section-icon" />
            </span>
            <span>System Diagnostics</span>
          </h3>
          <div className="system-stats">
            <div className="stat-item">
              <div className="stat-label">CPU USAGE</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${Math.floor(Math.random() * 40) + 20}%` }}></div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">MEMORY</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${Math.floor(Math.random() * 30) + 50}%` }}></div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">DISK I/O</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${Math.floor(Math.random() * 60) + 10}%` }}></div>
              </div>
            </div>
            <div className="system-uptime">
              SYSTEM UPTIME: {Math.floor(Math.random() * 100) + 20}:43:12
            </div>
          </div>
        </section>
        
        <div className="settings-actions">
          <button className="save-button" onClick={saveSettings}>
            <IoSaveOutline className="button-icon" /> SAVE CONFIG
          </button>
          <button className="close-button" onClick={onClose}>
            <IoCloseOutline className="button-icon" /> CLOSE
          </button>
        </div>
        
        {saveStatus && (
          <div className={`save-status ${saveStatus.includes('Error') ? 'error' : 'success'}`}>
            {saveStatus.includes('Error') ? <IoWarningOutline className="status-icon" /> : <IoSaveOutline className="status-icon" />}
            <span className="status-text">{saveStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsWindow;
