import React, { useEffect } from 'react';
import './GlitchEffect.css';

interface GlitchEffectProps {
  children: React.ReactNode;
}

const GlitchEffect: React.FC<GlitchEffectProps> = ({ children }) => {
  useEffect(() => {
    // Set data attribute for glitched text
    const glitchedTexts = document.querySelectorAll('.glitched-text');
    glitchedTexts.forEach(el => {
      el.setAttribute('data-text', el.textContent || '');
    });
  }, []);
  
  return (
    <div className="glitch-container">
      {children}
    </div>
  );
};

export default GlitchEffect;
