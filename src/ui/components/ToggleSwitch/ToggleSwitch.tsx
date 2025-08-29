import React from 'react';
import './ToggleSwitch.css';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  label?: string;
  statusLabels?: {
    on: string;
    off: string;
  };
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  statusLabels = { on: 'ENABLED', off: 'DISABLED' },
  disabled = false
}) => {
  return (
    <div className={`toggle-switch-container ${disabled ? 'disabled' : ''}`}>
      {label && (
        <label htmlFor={id} className="toggle-switch-label">
          {label}
        </label>
      )}
      
      <div className="toggle-switch-wrapper">
        <input
          type="checkbox"
          id={id}
          className="toggle-switch-input"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <label 
          htmlFor={id} 
          className={`toggle-switch-track ${checked ? 'active' : ''}`} 
          aria-label={label || "toggle switch"}
        >
          <span className="toggle-switch-thumb"></span>
        </label>
        
        <span className={`toggle-switch-status ${checked ? 'enabled' : 'disabled'}`}>
          {checked ? statusLabels.on : statusLabels.off}
        </span>
      </div>
    </div>
  );
};

export default ToggleSwitch;
