import React from 'react';

interface SidebarLocation {
  name: string;
  icon: string;
  path: string;
}

interface FileManagerSidebarProps {
  locations: SidebarLocation[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

const FileManagerSidebar: React.FC<FileManagerSidebarProps> = ({
  locations,
  currentPath,
  onNavigate
}) => {
  // Check if current path is a sub-path of the location
  const isPathInLocation = (locationPath: string): boolean => {
    // Root is a special case
    if (locationPath === '/' && currentPath === '/') return true;
    if (locationPath === '/' && currentPath !== '/') return false;
    
    // Check if current path starts with the location path
    return currentPath.startsWith(locationPath + '/') || currentPath === locationPath;
  };
  
  return (
    <div className="file-manager-sidebar">
      {locations.map((location, index) => (
        <div
          key={index}
          className={`file-manager-sidebar-item ${isPathInLocation(location.path) ? 'selected' : ''}`}
          onClick={() => onNavigate(location.path)}
        >
          <div className="file-manager-sidebar-icon">{location.icon}</div>
          <div className="file-manager-sidebar-label">{location.name}</div>
        </div>
      ))}
    </div>
  );
};

export default FileManagerSidebar;
