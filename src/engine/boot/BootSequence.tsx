import { useState, useEffect, useRef } from 'react';
import './BootSequence.css';

interface BootSequenceProps {
  progress: number;
  mode?: 'normal' | 'verbose' | 'fast';
  onComplete?: () => void;
  skipBoot?: boolean;
}

interface BootMessage {
  text: string;
  type: 'normal' | 'warning' | 'error' | 'success' | 'glitch';
  timestamp: number;
  delay?: number; // Optional delay override for specific messages
}

const BootSequence = ({ progress, mode = 'normal', onComplete, skipBoot = false }: BootSequenceProps) => {
  const [messages, setMessages] = useState<BootMessage[]>([]);
  const [showBios, setShowBios] = useState(true);
  const [showMemoryTest, setShowMemoryTest] = useState(false);
  const [bootPhase, setBootPhase] = useState<'bios' | 'memoryTest' | 'bootMessages'>('bios');
  const [memoryProgress, setMemoryProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Enhanced normal boot messages with more depth and mystery elements
  const normalBootMessages: Partial<BootMessage>[] = [
    { text: 'MRHEADROOM BIOS v1.98.42', type: 'normal' },
    { text: 'Copyright (c) 1998 Axiom Technologies', type: 'normal' },
    { text: 'Checking system configuration...', type: 'normal' },
    { text: 'CPU: Intel Pentium II 400MHz', type: 'normal' },
    { text: 'Memory: 64MB RAM Detected', type: 'normal' },
    { text: '[OK] System timer initialized', type: 'success' },
    { text: '[OK] CMOS RTC initialized', type: 'success' },
    { text: 'Initializing disk subsystem...', type: 'normal' },
    { text: 'IDE Primary Master: Quantum Fireball 4.3GB', type: 'normal' },
    { text: 'Initializing video adapter...', type: 'normal' },
    { text: 'Video: VGA Compatible Controller', type: 'normal' },
    { text: 'NEXUS-9 Core System v9.4.1', type: 'normal', delay: 500 },
    { text: 'Loading NEXUS kernel...', type: 'normal' },
    { text: 'Initializing core subsystems', type: 'normal' },
    { text: '[OK] Base system loaded', type: 'success' },
    { text: '[OK] Network subsystem initialized', type: 'success' },
    { text: '[OK] Display subsystem initialized', type: 'success' },
    { text: 'Mounting file systems...', type: 'normal' },
    { text: '[WARN] Anomalous metadata detected in sector 7G', type: 'warning', delay: 800 },
    { text: 'Checking system integrity...', type: 'normal' },
    { text: 'Memory sector B7FF-C2DE validation...', type: 'warning' },
    { text: '[ERR] Hash mismatch in temporal matrix', type: 'error', delay: 1000 },
    { text: 'Auto-correction engaged...', type: 'warning' },
    { text: '[OK] Matrix rebuilt successfully', type: 'success' },
    { text: '[ATTN] Updating reality parameters', type: 'warning', delay: 700 },
    { text: 'Loading user profiles...', type: 'normal' },
    { text: 'User profile "Henry Hedrum" identified', type: 'normal' },
    { text: 'Welcome, Henry Hedrum', type: 'success' },
    { text: 'Environment initialized', type: 'success', delay: 600 },
    { text: '.', type: 'normal', delay: 200 },
    { text: '..', type: 'normal', delay: 200 },
    { text: '...', type: 'normal', delay: 200 },
    { text: '[NEXUS-9 Ready]', type: 'success', delay: 500 },
  ];

  // Additional verbose messages with enhanced technical details
  const verboseMessages: Partial<BootMessage>[] = [
    { text: 'IRQ assignments: 3,4,5,7,9,10,11,12,14,15', type: 'normal' },
    { text: 'DMA channels: 0,1,2,3,4,5,6,7', type: 'normal' },
    { text: 'PCI bus scanning complete - 4 devices found', type: 'normal' },
    { text: 'Loading I/O driver: kb_ps2.sys', type: 'normal' },
    { text: 'Loading I/O driver: mouse.sys', type: 'normal' },
    { text: 'Audio adapter detected: SoundBlaster 16', type: 'normal' },
    { text: 'CMOS checksum valid: 0xA77E', type: 'normal' },
    { text: 'Loading kernel modules: [base.sys] [mem.sys] [io.sys] [fs.sys]', type: 'normal' },
    { text: '[WARN] Anomalous memory access at 0xF7A93B00-0xF7A93BFF', type: 'warning' },
    { text: '[WARN] Memory integrity exception at 0x7FFFFFFF', type: 'warning' },
    { text: 'Virtual memory initialized: 128MB swap', type: 'normal' },
    { text: 'System clock synchronized to internal RTC', type: 'normal' },
    { text: '[WARN] Reality inconsistency #42F7 detected in kernel', type: 'warning' },
    { text: '[ERR] Reference to undefined object in bootstrap: "HEADROOM"', type: 'error' },
    { text: '[WARN] Error suppressed by system policy NXS-994', type: 'warning' },
    { text: 'Loading security module: [sandbox.sys]', type: 'normal' },
    { text: 'Loading reality module: [perception.sys]', type: 'normal' },
    { text: '[WARN] Quantum state decoherence detected', type: 'warning' },
    { text: 'Stabilizing dimensional parameters...', type: 'warning' },
    { text: '[WARN] Timeline fork at branch point 7734-A', type: 'warning' },
  ];

  // Mystery-related hidden messages - appear randomly
  const hiddenMessages: Partial<BootMessage>[] = [
    { text: '[ERR] 0xF7A93B00: Memory boundary exceeded - reality leak', type: 'error' },
    { text: '[WARN] MRHEADROOM process detected and contained in sector 9', type: 'warning' },
    { text: '[SYS] Reality parameters restored to defaults after breach', type: 'warning' },
    { text: '[SEC] Wiping unauthorized access logs from timeline 7734-B', type: 'warning' },
    { text: '[WARN] Simulation stability: 93.7% - degradation detected', type: 'warning' },
    { text: '[ERR] User "Henry" consciousness fragmentation at 17%', type: 'error' },
    { text: '[SYS] Emergency containment protocols initiated', type: 'warning' },
    { text: '[SEC] MRHEADROOM signature detected in memory dump', type: 'error' },
    { text: '[SYS] Quantum state branching detected - running cleanup', type: 'warning' },
    { text: '01001000 01000101 00100000 01001001 01010011 00100000 01001000 01000101 01010010 01000101', type: 'glitch' },
    { text: 'T̷h̶e̷ ̴w̵a̸l̵l̶s̴ ̶o̸f̸ ̸r̵e̸a̸l̴i̵t̸y̶ ̷a̵r̷e̵ ̸t̷h̵i̵n̷n̸i̴n̵g̴', type: 'glitch' },
  ];

  // Boot sequence initialization
  useEffect(() => {
    // Sound preloading removed
  }, []);

  // Memory test animation - slowed down for better readability
  const runMemoryTest = () => {
    return new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 1; // Reduced from 2 to 1 for slower progress
        if (progress > 100) {
          clearInterval(interval);
          // Add a small pause at the end of memory test
          setTimeout(() => {
            resolve();
          }, 800);
        } else {
          setMemoryProgress(progress);
        }
      }, 80); // Increased from 50ms to 80ms for slower updates
    });
  };

  useEffect(() => {
    // Skip boot sequence if requested
    if (skipBoot && onComplete) {
      onComplete();
      return;
    }
    
    // Boot sound removed
    
    // Boot sequence phases - extended timing for better readability
    const initBootSequence = async () => {
      // BIOS screen - longer display time
      setBootPhase('bios');
      await new Promise(resolve => setTimeout(resolve, mode === 'fast' ? 1000 : 3500));
      
      // Memory test screen
      setShowBios(false);
      setBootPhase('memoryTest');
      setShowMemoryTest(true);
      
      // Skip memory test in fast mode
      if (mode === 'fast') {
        await new Promise(resolve => setTimeout(resolve, 800));
      } else {
        await runMemoryTest();
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
      
      // Boot messages phase
      setShowMemoryTest(false);
      setBootPhase('bootMessages');
      
      // Process and show boot messages
      processAndShowMessages();
    };
    
    // Start boot sequence
    initBootSequence();
    
    // Process and show boot messages
    const processAndShowMessages = () => {
      // Convert partial messages to full BootMessage objects with timestamps
      const completeBootMessages: BootMessage[] = normalBootMessages.map(msg => ({
        text: msg.text || '',
        type: msg.type || 'normal',
        timestamp: Date.now(),
        delay: msg.delay
      }));
      
      // Complete verbose messages
      const completeVerboseMessages: BootMessage[] = verboseMessages.map(msg => ({
        text: msg.text || '',
        type: msg.type || 'normal',
        timestamp: Date.now(),
        delay: msg.delay
      }));
      
      // Complete hidden messages
      const completeHiddenMessages: BootMessage[] = hiddenMessages.map(msg => ({
        text: msg.text || '',
        type: msg.type || 'normal',
        timestamp: Date.now(),
        delay: msg.delay
      }));
      
      // Determine which messages to show
      let bootMessages = [...completeBootMessages];
      
      // Add verbose messages if in verbose mode
      if (mode === 'verbose') {
        // Interleave verbose messages with normal ones
        const combinedMessages: BootMessage[] = [];
        
        completeBootMessages.forEach((msg, i) => {
          combinedMessages.push(msg);
          if (i < completeVerboseMessages.length && i % 2 === 0) {
            combinedMessages.push(completeVerboseMessages[Math.floor(i / 2)]);
          }
        });
        
        bootMessages = combinedMessages;
      }
      
      // Add mystery-related hidden messages with reduced probability to avoid too many glitches
      const randomThreshold = mode === 'verbose' ? 0.2 : 0.1; // Reduced probability
      
      if (Math.random() < randomThreshold) {
        const insertCount = Math.floor(Math.random() * 2) + 1; // Insert 1-2 hidden messages instead of 1-3
        
        for (let i = 0; i < insertCount; i++) {
          const randomIndex = Math.floor(Math.random() * bootMessages.length * 0.7) + Math.floor(bootMessages.length * 0.3);
          const randomHiddenMessage = completeHiddenMessages[Math.floor(Math.random() * completeHiddenMessages.length)];
          bootMessages.splice(randomIndex, 0, randomHiddenMessage);
        }
      }
      
      // If in fast mode, only show essential messages
      if (mode === 'fast') {
        bootMessages = bootMessages.filter(
          msg => msg.type === 'error' || msg.type === 'success' || msg.type === 'glitch' || Math.random() < 0.3
        );
      }
      
      // Calculate base delay between messages based on mode - significantly increased for better readability
      const baseMessageDelay = mode === 'fast' ? 150 : mode === 'verbose' ? 400 : 300;
      
      // Display messages with variable delays for more realistic feel
      let currentMessages: BootMessage[] = [];
      let totalDelay = 0;
      
      bootMessages.forEach((msg, index) => {
        // Calculate a dynamic base delay that gradually speeds up toward the end
        // This creates a more natural boot sequence that starts slow and speeds up
        const progressFactor = Math.min(1, index / bootMessages.length * 1.5);
        const dynamicBaseDelay = baseMessageDelay * (1 - progressFactor * 0.4);
        
        // Calculate this message's delay (reduced random variation + any specific delay)
        // Less variation makes text more readable and predictable
        const variation = Math.random() * 30;
        const thisMessageDelay = (msg.delay || 0) + dynamicBaseDelay + variation;
        totalDelay += thisMessageDelay;
        
        setTimeout(() => {
          // Sound effects removed
          
          // Add message to display
          currentMessages = [...currentMessages, msg];
          setMessages([...currentMessages]);
          
          // Call onComplete after last message - longer pause at the end
          if (index === bootMessages.length - 1 && onComplete) {
            setTimeout(onComplete, 2500); // Increased from 1500ms to 2500ms
          }
        }, totalDelay);
      });
    };
  }, [mode, onComplete, skipBoot]);

  // Audio element for boot sounds
  return (
    <>
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* BIOS screen */}
      {showBios && (
        <div className="boot-sequence bios-screen">
          <div className="bios-content">
            <h1>AXIOM BIOS</h1>
            <p>Version 6.14TF</p>
            <p>Copyright (C) 1998 Axiom Technologies</p>
            <div className="bios-details">
              <p>Intel(R) Pentium(R) II Processor</p>
              <p>CPU Speed: 400 MHz</p>
              <p>L2 Cache: 512 KB</p>
              <p>System Memory: 64 MB</p>
              <p>IDE Primary Master: Quantum Fireball 4.3GB</p>
            </div>
            <p className="bios-memory">Memory Test: 65535KB OK</p>
            <div className="bios-message">Press DEL to enter setup</div>
          </div>
        </div>
      )}
      
      {/* Memory Test screen */}
      {!showBios && bootPhase === 'memoryTest' && (
        <div className="boot-sequence memory-test">
          <div className="memory-test-content">
            <h2>Memory Test</h2>
            <div className="memory-addresses">
              <div>Testing: 0x0000-0xFFFF</div>
              <div className="current-address">Current: 0x{(memoryProgress * 655.35).toString(16).toUpperCase().padStart(4, '0')}</div>
            </div>
            <div className="memory-progress-bar">
              <div className="memory-progress-fill" style={{ width: `${memoryProgress}%` }}></div>
            </div>
            <div className="memory-status">
              {memoryProgress < 100 ? 'Testing memory...' : 'Memory test complete. No errors.'}
            </div>
            {memoryProgress > 80 && memoryProgress < 85 && (
              <div className="memory-glitch">Warning: Anomaly at 0xF7A9-0xF7FF</div>
            )}
          </div>
        </div>
      )}
      
      {/* Boot messages */}
      {!showBios && bootPhase === 'bootMessages' && (
        <div className="boot-sequence">
          <div className="boot-header">
            <div className="boot-title">NEXUS-9 BOOT SEQUENCE</div>
            <div className="boot-datetime">
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
          </div>
          
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
            <div className="boot-progress-text">{`Loading NEXUS-9... ${progress}%`}</div>
          </div>
          
          <div className="boot-footer">
            <div className="boot-manufacturer">AXIOM TECHNOLOGIES</div>
            <div className="boot-version">NEXUS-9 v9.4.1</div>
          </div>
        </div>
      )}
    </>
  );
};

export default BootSequence;
