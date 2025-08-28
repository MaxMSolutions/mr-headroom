import { useState, useEffect } from 'react';
import './BootSequence.css';

interface BootSequenceProps {
  progress: number;
  mode?: 'normal' | 'verbose' | 'fast';
  onComplete?: () => void;
}

interface BootMessage {
  text: string;
  type: 'normal' | 'warning' | 'error' | 'success';
  timestamp: number;
}

const BootSequence = ({ progress, mode = 'normal', onComplete }: BootSequenceProps) => {
  const [messages, setMessages] = useState<BootMessage[]>([]);
  const [showBios, setShowBios] = useState(true);
  
  // Normal boot messages
  const normalBootMessages = [
    { text: 'MRHEADROOM BIOS v1.98', type: 'normal' as const },
    { text: 'Copyright (c) 1998 Axiom Technologies', type: 'normal' as const },
    { text: 'Checking system configuration...', type: 'normal' as const },
    { text: 'CPU: Intel Pentium II 400MHz', type: 'normal' as const },
    { text: 'Memory: 64MB RAM Detected', type: 'normal' as const },
    { text: 'Initializing disk subsystem...', type: 'normal' as const },
    { text: 'IDE Primary Master: Quantum Fireball 4.3GB', type: 'normal' as const },
    { text: 'Initializing video adapter...', type: 'normal' as const },
    { text: 'Video: VGA Compatible Controller', type: 'normal' as const },
    { text: 'Loading operating system...', type: 'normal' as const },
    { text: 'NEXUS-9 Core System Loaded', type: 'success' as const },
    { text: 'Mounting file systems...', type: 'normal' as const },
    { text: 'Checking system integrity...', type: 'normal' as const },
    { text: 'Memory sector B7FF-C2DE validation...', type: 'warning' as const },
    { text: 'User profile loading...', type: 'normal' as const },
    { text: 'Welcome, Henry Hedrum', type: 'success' as const },
    { text: 'Environment initialized', type: 'success' as const },
  ];

  // Additional verbose messages
  const verboseMessages = [
    { text: 'IRQ assignments: 3,4,5,7,9,10,11,12,14,15', type: 'normal' as const },
    { text: 'DMA channels: 0,1,2,3,4,5,6,7', type: 'normal' as const },
    { text: 'PCI bus scanning complete', type: 'normal' as const },
    { text: 'Audio adapter detected: SoundBlaster 16', type: 'normal' as const },
    { text: 'CMOS checksum valid', type: 'normal' as const },
    { text: 'Loading kernel modules...', type: 'normal' as const },
    { text: 'WARNING: Anomalous memory access detected during boot', type: 'warning' as const },
    { text: 'Virtual memory initialized: 128MB swap', type: 'normal' as const },
    { text: 'System clock synchronized', type: 'normal' as const },
    { text: 'WARNING: Reality inconsistency detected in kernel', type: 'warning' as const },
    { text: 'ERROR: Reference to undefined object in bootstrap', type: 'error' as const },
    { text: 'ERROR suppressed by system administrator', type: 'warning' as const },
  ];

  // Easter egg hidden message - rarely appears
  const hiddenMessages = [
    { text: '0xF7A93B00: Memory boundary exceeded', type: 'error' as const },
    { text: 'MRHEADROOM process detected and contained', type: 'warning' as const },
    { text: 'Reality parameters restored to defaults', type: 'warning' as const },
    { text: 'Wiping unauthorized access logs...', type: 'warning' as const },
    { text: 'Simulation stability: 99.3%', type: 'success' as const },
  ];

  useEffect(() => {
    // Show BIOS screen for a moment
    setTimeout(() => {
      setShowBios(false);
    }, mode === 'fast' ? 500 : 2000);
    
    // Determine which messages to show
    let bootMessages = [...normalBootMessages];
    
    // Add verbose messages if in verbose mode
    if (mode === 'verbose') {
      // Interleave verbose messages with normal ones
      bootMessages = bootMessages.reduce((acc: BootMessage[], msg, i) => {
        acc.push(msg);
        if (i < verboseMessages.length && i % 2 === 0) {
          acc.push(verboseMessages[i / 2]);
        }
        return acc;
      }, []);
    }
    
    // Add easter egg hidden messages with small probability
    if (Math.random() < 0.1) { // 10% chance
      const randomIndex = Math.floor(Math.random() * bootMessages.length);
      bootMessages.splice(randomIndex, 0, ...hiddenMessages);
    }
    
    // If in fast mode, only show essential messages
    if (mode === 'fast') {
      bootMessages = bootMessages.filter(
        msg => msg.type === 'error' || msg.type === 'success' || Math.random() < 0.3
      );
    }
    
    // Calculate delay between messages based on mode
    const messageDelay = mode === 'fast' ? 50 : mode === 'verbose' ? 300 : 150;
    
    // Display messages with delay
    let currentMessages: BootMessage[] = [];
    bootMessages.forEach((msg, index) => {
      setTimeout(() => {
        currentMessages = [
          ...currentMessages, 
          { ...msg, timestamp: Date.now() }
        ];
        setMessages([...currentMessages]);
        
        // Call onComplete after last message
        if (index === bootMessages.length - 1 && onComplete) {
          setTimeout(onComplete, 1000);
        }
      }, messageDelay * (index + 1));
    });
  }, [mode, onComplete]);

  // Show BIOS screen at start
  if (showBios) {
    return (
      <div className="boot-sequence bios-screen">
        <div className="bios-content">
          <h1>AXIOM BIOS</h1>
          <p>Version 4.51PG</p>
          <p>Copyright (C) 1998 Axiom Technologies</p>
          <p className="bios-memory">Memory Test: 65535KB OK</p>
          <div className="bios-message">Press DEL to enter setup</div>
        </div>
      </div>
    );
  }

  return (
    <div className="boot-sequence">
      <div className="boot-messages">
        {messages.map((msg, index) => (
          <div 
            key={`${index}-${msg.timestamp}`} 
            className={`boot-message ${msg.type}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="boot-progress">
        <div className="boot-progress-bar" style={{ width: `${progress}%` }}></div>
        <div className="boot-progress-text">{`Loading... ${progress}%`}</div>
      </div>
    </div>
  );
};

export default BootSequence;
