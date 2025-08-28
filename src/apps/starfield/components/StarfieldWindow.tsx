import React, { useState } from 'react';
import { StarfieldEngine } from '../StarfieldEngine';
import StarfieldGame from './StarfieldGame';
import '../Starfield.css';

interface StarfieldProps {
  id: string;
  onClose: () => void;
}

const StarfieldWindow: React.FC<StarfieldProps> = ({ onClose }) => {
  const [engine] = useState<StarfieldEngine>(new StarfieldEngine());
  
  return (
    <div className="starfield-window">
      <div className="starfield-container">
        <StarfieldGame engine={engine} onClose={onClose} />
      </div>
    </div>
  );
};

export default StarfieldWindow;
