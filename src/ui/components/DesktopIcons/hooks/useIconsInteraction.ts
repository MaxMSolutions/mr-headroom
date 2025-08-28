import { useState, useCallback, RefObject } from 'react';
import { IconData } from './useIconsData';

interface UseIconsInteractionProps {
  icons: IconData[];
  updateIconPosition: (iconId: string, row: number, col: number) => void;
  findNextAvailablePosition: (row: number, col: number, excludeIconId?: string) => { row: number, col: number };
  onIconSelect: (iconId: string) => void;
  desktopRef: RefObject<HTMLDivElement>;
}

export function useIconsInteraction({
  icons,
  updateIconPosition,
  findNextAvailablePosition,
  onIconSelect,
  desktopRef
}: UseIconsInteractionProps) {
  const [draggedIcon, setDraggedIcon] = useState<string | null>(null);
  const gridSize = { width: 100, height: 120 }; // Match grid cell size

  // Handle drag start using HTML5 drag API
  const handleDragStart = useCallback((id: string, e: React.DragEvent) => {
    // Set selected icon and dragged icon state
    onIconSelect(id);
    setDraggedIcon(id);
    
    // Store data about which icon is being dragged
    e.dataTransfer.setData('text/plain', id);
    
    // Allow move operations
    e.dataTransfer.effectAllowed = 'move';
    
    // Store current icon position for grid calculation later
    const iconData = icons.find(icon => icon.id === id);
    if (iconData && iconData.gridPosition) {
      e.dataTransfer.setData('application/json', JSON.stringify({
        sourceId: id,
        sourceRow: iconData.gridPosition.row,
        sourceCol: iconData.gridPosition.col
      }));
    }
    
    // Log start of drag for debugging
    console.log(`Started dragging icon ${id} using HTML5 drag and drop`);
  }, [icons, onIconSelect]);

  // Handle drag (not much needed with HTML5 drag and drop)
  const handleDrag = useCallback((_id: string, _e: React.DragEvent) => {
    // This is mostly for compatibility with the component API
    // HTML5 drag and drop handles most of the visual feedback automatically
  }, []);

  // Handle drag end with HTML5 drag and drop
  const handleDragEnd = useCallback((id: string, e: React.DragEvent) => {
    if (draggedIcon === id) {
      try {
        // Get drop coordinates relative to the desktop
        if (desktopRef.current) {
          const desktopRect = desktopRef.current.getBoundingClientRect();
          
          // Calculate the grid cell based on drop position
          const dropX = e.clientX - desktopRect.left;
          const dropY = e.clientY - desktopRect.top;
          
          // Make sure the drop was within the desktop area
          if (dropX >= 0 && dropY >= 0 && dropX <= desktopRect.width && dropY <= desktopRect.height) {
            // Calculate grid position (1-based)
            const col = Math.max(1, Math.min(10, Math.ceil(dropX / gridSize.width)));
            const row = Math.max(1, Math.min(8, Math.ceil(dropY / gridSize.height)));
            
            console.log(`Dropped icon ${id} at grid position ${row},${col}`);
            
            // Find next available position (this function will check if position is occupied)
            const { row: finalRow, col: finalCol } = findNextAvailablePosition(row, col, id);
            
            // Update the icon's grid position
            updateIconPosition(id, finalRow, finalCol);
          }
        }
      } catch (error) {
        console.error("Error in handleDragEnd:", error);
      } finally {
        // Always reset dragging state
        setDraggedIcon(null);
        document.body.classList.remove('dragging-in-progress');
      }
    }
  }, [draggedIcon, desktopRef, findNextAvailablePosition, updateIconPosition]);

  // Handle desktop drop (when icon is dropped on the desktop)
  const handleDesktopDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      // Get the ID of the icon being dragged
      const iconId = e.dataTransfer.getData('text/plain');
      
      if (iconId) {
        // Calculate drop position on desktop grid
        const desktopRect = desktopRef.current?.getBoundingClientRect();
        if (desktopRef.current && desktopRect) {
          const dropX = e.clientX - desktopRect.left;
          const dropY = e.clientY - desktopRect.top;
          
          // Convert to grid coordinates (1-based)
          const col = Math.max(1, Math.min(10, Math.ceil(dropX / gridSize.width)));
          const row = Math.max(1, Math.min(8, Math.ceil(dropY / gridSize.height)));
          
          // Find next available position
          const { row: finalRow, col: finalCol } = findNextAvailablePosition(row, col, iconId);
          
          // Update icon position
          updateIconPosition(iconId, finalRow, finalCol);
        }
      }
    } catch (err) {
      console.error('Error handling drop:', err);
    } finally {
      setDraggedIcon(null);
      document.body.classList.remove('dragging-in-progress');
    }
  }, [desktopRef, findNextAvailablePosition, updateIconPosition]);

  // Handle drag over for drop target
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Required for drop to work
    e.dataTransfer.dropEffect = 'move';
  }, []);

  return {
    draggedIcon,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleDesktopDrop,
    handleDragOver
  };
}
