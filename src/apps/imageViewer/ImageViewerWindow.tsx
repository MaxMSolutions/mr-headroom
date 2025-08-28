import React, { useState, useEffect, useRef } from 'react';
import './ImageViewer.css';
import FileSystem from '../../engine/fileSystem';

interface ImageViewerWindowProps {
  id: string;
  title?: string;
  fileSystem?: FileSystem;
  filePath?: string;
  onClose?: () => void;
}

const ImageViewerWindow: React.FC<ImageViewerWindowProps> = ({
  id,
  title = 'Image Viewer',
  fileSystem,
  filePath,
  onClose
}) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [fileName, setFileName] = useState(filePath ? filePath.split('/').pop() : 'Untitled');
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [isGlitching, setIsGlitching] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Load image data from file if path is provided
  useEffect(() => {
    const loadImage = async () => {
      if (fileSystem && filePath) {
        try {
          // Briefly show loading/glitch state
          setIsGlitching(true);
          
          // For a real implementation, we would read the actual image file
          // For this prototype, we'll simulate an image by using a placeholder with a cyberpunk style
          // In a full implementation, you'd decode base64 from the file or load via URL
          
          // Set a cyberpunk-styled placeholder
          const fileName = filePath?.split('/').pop() || 'Untitled';
          const placeholderImage = `data:image/svg+xml;utf8,
            <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
              <rect width="600" height="400" fill="#000000" />
              <rect x="1" y="1" width="598" height="398" fill="none" stroke="#00ffff" stroke-width="2" />
              <line x1="0" y1="0" x2="600" y2="400" stroke="#ff00ff" stroke-width="1" opacity="0.5" />
              <line x1="600" y1="0" x2="0" y2="400" stroke="#ff00ff" stroke-width="1" opacity="0.5" />
              <rect x="50" y="50" width="500" height="300" fill="none" stroke="#33ff33" stroke-width="1" stroke-dasharray="5,5" />
              <text x="50%" y="40%" font-family="monospace" font-size="20" fill="#33ff33" text-anchor="middle">
                FILE: ${fileName}
              </text>
              <text x="50%" y="50%" font-family="monospace" font-size="14" fill="#00ffff" text-anchor="middle">
                SECTOR 0xA7F2: IMAGE DATA LOADED
              </text>
              <text x="50%" y="60%" font-family="monospace" font-size="12" fill="#ff00ff" text-anchor="middle">
                TIMESTAMP: ${new Date().toISOString()}
              </text>
            </svg>`;
            
          // Simulate a brief loading delay
          setTimeout(() => {
            setImageData(placeholderImage);
            setIsGlitching(false);
            
            if (filePath) {
              setFileName(filePath.split('/').pop() || 'Untitled');
            }
          }, 500);
          
        } catch (error) {
          console.error('Error loading image:', error);
          setIsGlitching(false);
        }
      }
    };
    
    loadImage();
  }, [fileSystem, filePath]);

  // Zoom in with micro glitch effect
  const zoomIn = () => {
    // Brief micro-glitch when zooming
    const shouldGlitch = Math.random() < 0.2; // 20% chance of glitch
    if (shouldGlitch) setIsGlitching(true);
    
    setZoom(prev => {
      const newZoom = Math.min(prev + 20, 400);
      
      // Add brief "digital" sound effect here in a real implementation
      // const zoomSound = new Audio('/assets/sounds/zoom.mp3');
      // zoomSound.volume = 0.2;
      // zoomSound.play().catch(e => console.log('Audio play prevented:', e));
      
      if (shouldGlitch) {
        setTimeout(() => setIsGlitching(false), 100);
      }
      
      return newZoom;
    });
  };

  // Zoom out with optional micro glitch effect
  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 20, 20));
    
    // Very rare chance of triggering a glitch on zoom out (narrative element)
    if (Math.random() < 0.05) {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 150);
    }
  };

  // Reset zoom with smooth transition
  const resetZoom = () => {
    // Brief indication of reset
    setIsGlitching(true);
    
    setTimeout(() => {
      setZoom(100);
      if (contentRef.current) {
        contentRef.current.scrollLeft = 0;
        contentRef.current.scrollTop = 0;
      }
      setIsGlitching(false);
    }, 200);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      if (contentRef.current) {
        setScrollPos({
          x: contentRef.current.scrollLeft,
          y: contentRef.current.scrollTop
        });
      }
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && contentRef.current) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      contentRef.current.scrollLeft = scrollPos.x - dx;
      contentRef.current.scrollTop = scrollPos.y - dy;
    }
  };

  // Handle mouse up for dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Occasionally trigger glitches for narrative purposes
  useEffect(() => {
    // This is part of the narrative - rarely the image viewer will glitch
    const glitchInterval = setInterval(() => {
      // Only 2% chance of triggering a glitch
      if (Math.random() < 0.02) {
        setIsGlitching(true);
        
        // Potentially modify the image data slightly during glitch for narrative purposes
        if (imageData && Math.random() < 0.3) {
          // In a real implementation, we might briefly show a modified/corrupted version
          // of the image or flash subliminal messages/clues here
          
          // For demonstration, we're just using the state to trigger CSS effects
          console.log("Image data corruption detected...");
        }
        
        // Turn off glitch mode after a short time
        setTimeout(() => {
          setIsGlitching(false);
        }, 300 + Math.random() * 500); // Random duration for glitch effect (300-800ms)
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(glitchInterval);
    };
  }, [imageData]);

  return (
    <div className={`image-viewer ${isGlitching ? 'glitching' : ''}`}>
      <div className="image-viewer-toolbar">
        <button className="image-viewer-toolbar-button" onClick={zoomIn}>
          ⊕ ZOOM IN
        </button>
        <button className="image-viewer-toolbar-button" onClick={zoomOut}>
          ⊖ ZOOM OUT
        </button>
        <button className="image-viewer-toolbar-button" onClick={resetZoom}>
          ⟲ RESET
        </button>
      </div>

      <div 
        className="image-viewer-content"
        ref={contentRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {imageData ? (
          <>
            <img
              className={`image-viewer-image ${zoom > 100 ? 'zoomed' : ''}`}
              src={imageData}
              alt={fileName}
              style={{ width: `${zoom}%` }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
            <div className="image-viewer-zoom-indicator">
              MAG: {zoom}%
            </div>
            <div className="image-metadata">
              <div className="metadata-header">// IMAGE METADATA</div>
              <div className="metadata-item"><span>FILE:</span> {fileName}</div>
              <div className="metadata-item"><span>DIMENSIONS:</span> 600x400</div>
              <div className="metadata-item"><span>TYPE:</span> SVG/BINARY</div>
              <div className="metadata-item"><span>CREATED:</span> {new Date().toLocaleDateString()}</div>
              <div className="metadata-item"><span>SECTOR:</span> 0xA7F2</div>
              {isGlitching && (
                <div className="metadata-item corrupted"><span>WARNING:</span> DATA CORRUPTION DETECTED</div>
              )}
            </div>
          </>
        ) : (
          <div className="image-viewer-no-image">
            <div className="image-viewer-no-image-icon">◨</div>
            <div>NO IMAGE DATA FOUND</div>
            <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>SYSTEM ERROR CODE: 0xFE2D</div>
          </div>
        )}
      </div>

      <div className="image-viewer-status-bar">
        <div>{'>'}{'>'}  {fileName}</div>
        <div>RESOLUTION: {zoom}% | SYS: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default ImageViewerWindow;
