import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ui/ThemeContext';
import FileSystem from '../../engine/fileSystem';
import './SettingsWindow.css';

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
        <h2>:: System Settings ::</h2>
        
        <section className="settings-section">
          <h3>⚡ Interface Configuration</h3>
          <div className="settings-group">
            <label>Visual Theme</label>
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
            <label htmlFor="crt-effect">CRT Effect</label>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                id="crt-effect" 
                checked={crtEffect} 
                onChange={toggleCrtEffect}
              />
              <div className="switch-container" onClick={() => document.getElementById('crt-effect')?.click()}></div>
              <span className="status-text">{crtEffect ? 'ENABLED' : 'DISABLED'}</span>
            </div>
          </div>
          
          <div className="settings-group">
            <label htmlFor="accessibility-mode">Accessibility Mode</label>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                id="accessibility-mode" 
                checked={accessibilityMode} 
                onChange={toggleAccessibilityMode}
              />
              <div className="switch-container" onClick={() => document.getElementById('accessibility-mode')?.click()}></div>
              <span className="status-text">{accessibilityMode ? 'ENABLED' : 'DISABLED'}</span>
            </div>
          </div>
        </section>
        
        <section className="settings-section">
          <h3>⚙ System Configuration</h3>
          <div className="settings-group">
            <label htmlFor="boot-mode">Boot Sequence</label>
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
          <h3>⚠ System Diagnostics</h3>
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
          <button className="save-button" onClick={saveSettings}>⌘ SAVE CONFIG</button>
          <button className="close-button" onClick={onClose}>⊗ CLOSE</button>
        </div>
        
        {saveStatus && (
          <div className={`save-status ${saveStatus.includes('Error') ? 'error' : 'success'}`}>
            {saveStatus.includes('Error') ? '! ERROR !' : '// SUCCESS //'}
            <br />
            {saveStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsWindow;
