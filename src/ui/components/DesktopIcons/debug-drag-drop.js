// Debug utility for drag and drop issues
// This script can be imported where needed for drag/drop debugging

export function enableDragDropDebugging() {
  // Add visual indicators for mouse events
  const indicatorEl = document.createElement('div');
  indicatorEl.style.cssText = `
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: #00ffff;
    padding: 5px 10px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(indicatorEl);
  
  // Track mouse state
  let mouseDown = false;
  let dragStartPos = { x: 0, y: 0 };
  
  // Monitor mouse events
  const updateIndicator = (e, eventType) => {
    indicatorEl.innerText = `Mouse: ${e.clientX},${e.clientY} | ${eventType} | Down: ${mouseDown}`;
    
    if (eventType === 'down') {
      mouseDown = true;
      dragStartPos = { x: e.clientX, y: e.clientY };
    } else if (eventType === 'up') {
      mouseDown = false;
    }
    
    if (mouseDown && eventType === 'move') {
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      indicatorEl.innerText += ` | Drag: ${dx},${dy}`;
    }
  };
  
  document.addEventListener('mousedown', (e) => updateIndicator(e, 'down'));
  document.addEventListener('mousemove', (e) => updateIndicator(e, 'move'));
  document.addEventListener('mouseup', (e) => updateIndicator(e, 'up'));
  
  console.log('Drag & drop debugging enabled');
  
  // Return function to disable debugging
  return () => {
    document.removeEventListener('mousedown', updateIndicator);
    document.removeEventListener('mousemove', updateIndicator);
    document.removeEventListener('mouseup', updateIndicator);
    document.body.removeChild(indicatorEl);
    console.log('Drag & drop debugging disabled');
  };
}
