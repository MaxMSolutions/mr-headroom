import { useState, useEffect } from 'react';

export interface IconData {
  type: string;
  label: string;
  id: string;
  isGlitched: boolean;
  hidden?: boolean;
  filePath?: string;
  gridPosition?: { row: number, col: number };
  size?: string;
  created?: string;
  modified?: string;
  attributes?: string[];
}

export function useIconsData() {
  const [icons, setIcons] = useState<IconData[]>([
    { 
      type: 'folder', 
      label: 'File Explorer', 
      id: 'files', 
      isGlitched: false, 
      filePath: '/home/hedrum/documents',
      gridPosition: { row: 1, col: 1 },
      size: '4.2 MB',
      created: '1998-03-12 09:45:32',
      modified: '1998-08-10 16:22:15',
      attributes: ['Directory', 'Read/Write']
    },
    { 
      type: 'system', 
      label: 'NEXUS-9', 
      id: 'nexus9', 
      isGlitched: true, 
      filePath: '/system/NEXUS9.EXE',
      gridPosition: { row: 1, col: 2 },
      size: '1.8 MB',
      created: '1997-11-05 00:00:00',
      modified: '1998-01-15 03:15:42',
      attributes: ['System', 'Executable', 'Read-only']
    },
    { 
      type: 'terminal', 
      label: 'Terminal', 
      id: 'terminal', 
      isGlitched: false, 
      filePath: '/system/TERMINAL.EXE',
      gridPosition: { row: 1, col: 3 },
      size: '845 KB',
      created: '1998-02-20 14:30:00',
      modified: '1998-02-20 14:30:00',
      attributes: ['System', 'Executable']
    },
    { 
      type: 'executable', 
      label: 'REALITY_PROBE.EXE', 
      id: 'reality-probe', 
      isGlitched: true, 
      filePath: '/system/hidden/REALITY_PROBE.EXE',
      gridPosition: { row: 1, col: 4 },
      size: '3.1 MB',
      created: '1998-06-12 23:17:46',
      modified: '1998-08-23 04:42:11',
      attributes: ['System', 'Hidden'] // Removed 'Executable' attribute
    },
    { 
      type: 'notes', 
      label: 'Text Editor', 
      id: 'notepad', 
      isGlitched: false, 
      filePath: '/system/TEXTEDITOR.EXE',
      gridPosition: { row: 2, col: 1 },
      size: '512 KB',
      created: '1998-01-10 11:30:00',
      modified: '1998-01-10 11:30:00',
      attributes: ['System', 'Executable']
    },
    { 
      type: 'settings', 
      label: 'Settings', 
      id: 'settings', 
      isGlitched: false, 
      filePath: '/system/SETTINGS.EXE',
      gridPosition: { row: 2, col: 2 },
      size: '720 KB',
      created: '1997-12-30 08:15:22',
      modified: '1998-01-05 16:20:00',
      attributes: ['System', 'Executable', 'Read/Write']
    },
    { 
      type: 'doom', 
      label: 'DOOM', 
      id: 'doom', 
      isGlitched: false, 
      filePath: '/home/hedrum/apps/DOOM.EXE',
      gridPosition: { row: 2, col: 3 },
      size: '2.7 MB',
      created: '1993-12-10 12:00:00',
      modified: '1998-07-21 19:45:33',
      attributes: ['Executable', 'Read/Write']
    },
    { 
      type: 'wolf3d', 
      label: 'WOLF3D', 
      id: 'wolf3d', 
      isGlitched: false, 
      filePath: '/home/hedrum/apps/WOLF3D.EXE',
      gridPosition: { row: 2, col: 4 },
      size: '2.1 MB',
      created: '1992-05-05 10:00:00',
      modified: '1998-07-15 14:32:21',
      attributes: ['Executable', 'Read/Write']
    },
    { 
      type: 'keen', 
      label: 'KEEN', 
      id: 'keen', 
      isGlitched: false, 
      filePath: '/home/hedrum/apps/KEEN.EXE',
      gridPosition: { row: 3, col: 3 },
      size: '1.8 MB',
      created: '1991-12-14 09:30:00',
      modified: '1998-06-30 11:27:45',
      attributes: ['Executable', 'Read/Write']
    },
    { 
      type: 'oregontrail', 
      label: 'OREGON', 
      id: 'oregontrail', 
      isGlitched: false, 
      filePath: '/home/hedrum/apps/OREGON.EXE',
      gridPosition: { row: 3, col: 4 },
      size: '1.2 MB',
      created: '1985-01-20 08:15:00',
      modified: '1998-07-05 16:42:08',
      attributes: ['Executable', 'Read/Write']
    },
    { 
      type: 'paint', 
      label: 'PAINT', 
      id: 'paint', 
      isGlitched: false, 
      filePath: '/home/hedrum/apps/PAINT.EXE',
      gridPosition: { row: 4, col: 3 },
      size: '987 KB',
      created: '1995-08-24 14:30:15',
      modified: '1996-11-12 09:22:33',
      attributes: ['Executable', 'Read/Write']
    },
    { 
      type: 'win95', 
      label: 'WIN95', 
      id: 'win95', 
      isGlitched: false, 
      filePath: '/home/hedrum/apps/WIN95.EXE',
      gridPosition: { row: 4, col: 4 },
      size: '2.3 MB',
      created: '1995-08-24 15:45:22',
      modified: '1996-12-01 11:15:44',
      attributes: ['Executable', 'Read/Write']
    },
    { 
      type: 'corrupted', 
      label: 'BOUNDARY_TEST.DAT', 
      id: 'boundary-test', 
      hidden: true, 
      isGlitched: true, 
      filePath: '/system/hidden/BOUNDARY_TEST.DAT',
      gridPosition: { row: 2, col: 4 },
      size: '8.4 MB',
      created: '1998-08-24 02:12:45',
      modified: '1998-08-24 03:01:17',
      attributes: ['System', 'Hidden', 'Corrupted']
    },
    { 
      type: 'locked', 
      label: 'ADMIN_ACCESS', 
      id: 'admin-access', 
      hidden: true, 
      isGlitched: true, 
      filePath: '/system/ADMIN_ACCESS.EXE',
      gridPosition: { row: 3, col: 1 },
      size: '1.1 MB',
      created: '1998-01-01 00:00:00',
      modified: '1998-01-01 00:00:00',
      attributes: ['System', 'Executable', 'Read-only', 'Hidden', 'Locked']
    }
  ]);

  // Grid bounds - used in multiple functions
  const maxRow = 5; // Reduced from 8 to ensure icons don't appear behind taskbar
  const maxCol = 8;

  // Function to randomize all icon positions on the desktop
  const randomizeIconPositions = () => {
    // Create a new array to track occupied positions
    const occupiedPositions: {[key: string]: boolean} = {};
    
    // Create a copy of icons to modify
    const updatedIcons = [...icons];
    
    // Shuffle the array to randomize assignment order
    shuffleArray(updatedIcons);
    
    // Assign random positions to each icon
    updatedIcons.forEach(icon => {
      let row: number, col: number, posKey: string;
      let attempts = 0;
      const maxAttempts = 50; // Prevent infinite loops
      
      // Keep trying until we find an unoccupied position or hit max attempts
      do {
        // Limit the row to ensure icons don't appear behind the taskbar
        // maxRow is now 7 instead of 8 to leave space for the taskbar
        row = Math.floor(Math.random() * maxRow) + 1;
        col = Math.floor(Math.random() * maxCol) + 1;
        posKey = `${row}-${col}`;
        attempts++;
      } while (occupiedPositions[posKey] && attempts < maxAttempts);
      
      // Mark this position as occupied
      occupiedPositions[posKey] = true;
      
      // Update the icon's grid position
      icon.gridPosition = { row, col };
    });
    
    // Update all icons with their new positions
    setIcons(updatedIcons);
    
    console.log('Desktop icons have been randomly arranged');
  };
  
  // Helper function to shuffle an array (Fisher-Yates algorithm)
  const shuffleArray = <T,>(array: T[]): void => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  // Randomly reveal the hidden "glitch" icon after some time
  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setIcons(prev => 
        prev.map(icon => 
          icon.id === 'boundary-test' ? {...icon, hidden: false} : icon
        )
      );
    }, 60000 + Math.random() * 180000); // Between 1-4 minutes
    
    return () => clearTimeout(revealTimer);
  }, []);
  
  // Randomly place icons when the component first mounts
  useEffect(() => {
    randomizeIconPositions();
  }, []);

  // Function to update an icon's position
  const updateIconPosition = (iconId: string, row: number, col: number) => {
    setIcons(prev => prev.map(icon => 
      icon.id === iconId ? { ...icon, gridPosition: { row, col } } : icon
    ));
  };

  // Function to find an icon by ID
  const getIconById = (iconId: string) => {
    return icons.find(icon => icon.id === iconId);
  };

  // Function to check if a grid position is occupied
  const isPositionOccupied = (row: number, col: number, excludeIconId?: string) => {
    return icons.some(icon => 
      (!excludeIconId || icon.id !== excludeIconId) && 
      icon.gridPosition?.row === row && 
      icon.gridPosition?.col === col
    );
  };

  // Function to find the next available position from a given position
  const findNextAvailablePosition = (row: number, col: number, excludeIconId?: string) => {
    // Define positions to check in order of preference
    const checkPositions = [
      { row, col },               // Original position
      { row, col: col + 1 },      // Right
      { row: row + 1, col },      // Down
      { row, col: col - 1 },      // Left
      { row: row - 1, col },      // Up
      { row: row + 1, col: col + 1 }, // Down-Right
      { row: row + 1, col: col - 1 }, // Down-Left
      { row: row - 1, col: col + 1 }, // Up-Right
      { row: row - 1, col: col - 1 }  // Up-Left
    ];
    
    // Check each position in order
    for (const pos of checkPositions) {
      // Ensure position is within grid bounds
      if (pos.row < 1 || pos.row > maxRow || pos.col < 1 || pos.col > maxCol) continue;
      
      // Check if position is free
      if (!isPositionOccupied(pos.row, pos.col, excludeIconId)) {
        return pos;
      }
    }
    
    // If all checked positions are occupied, find any free position
    for (let r = 1; r <= maxRow; r++) {
      for (let c = 1; c <= maxCol; c++) {
        if (!isPositionOccupied(r, c, excludeIconId)) {
          return { row: r, col: c };
        }
      }
    }
    
    // Fallback to original position if grid is full
    return { row, col };
  };

  return {
    icons,
    setIcons,
    updateIconPosition,
    getIconById,
    isPositionOccupied,
    findNextAvailablePosition,
    randomizeIconPositions
  };
}
