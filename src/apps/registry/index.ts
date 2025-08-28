import React from 'react';
import FileSystem from '../../engine/fileSystem';

// Import all app components
import TerminalWindow from '../terminal';
import FileManagerWindow from '../fileManager';
import TextEditorWindow from '../textEditor';
import ImageViewerWindow from '../imageViewer';
import SettingsWindow from '../settings';
import DoomWindow from '../doom';
import ErrorDialog from '../../ui/components/ErrorDialog';
import StarfieldWindow from '../starfield';
import LabyrinthWindow from '../labyrinth';
import LogViewerWindow from '../logViewer';
import { GuideWindow } from '../guide';
import Nexus9Window from '../nexus9';

// Import DOS game components
import Wolfenstein3DWindow from '../wolfenstein';
import CommanderKeenWindow from '../keenGame';
import OregonTrailWindow from '../oregonTrail';

// Define the interface for the registry
export interface AppRegistryItem {
  title: string;
  component: React.ComponentType<any>;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  icon: string;
  description?: string;
  category?: string;
  isGame?: boolean;
  showInMenu?: boolean;
}

export interface AppRegistry {
  [key: string]: AppRegistryItem;
}

// Define the interface for app props
export interface AppProps {
  id: string;
  fileSystem?: FileSystem;
  [key: string]: any;
}

// Create the registry of all available apps
const appRegistry: AppRegistry = {
  Terminal: {
    title: "Terminal",
    component: TerminalWindow,
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 400, height: 300 },
    icon: "terminal",
    description: "Command-line interface for system operations",
    category: "System",
    showInMenu: true
  },
  FileManager: {
    title: "File Explorer",
    component: FileManagerWindow,
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 500, height: 400 },
    icon: "folder",
    description: "Browse and manage system files",
    category: "System",
    showInMenu: true
  },
  TextEditor: {
    title: "Text Editor",
    component: TextEditorWindow,
    defaultSize: { width: 700, height: 550 },
    minSize: { width: 400, height: 300 },
    icon: "document",
    description: "Create and edit text files",
    category: "Productivity",
    showInMenu: true
  },
  ImageViewer: {
    title: "Image Viewer",
    component: ImageViewerWindow,
    defaultSize: { width: 650, height: 500 },
    minSize: { width: 400, height: 300 },
    icon: "image",
    description: "View image files",
    category: "Productivity",
    showInMenu: true
  },
  Settings: {
    title: "Settings",
    component: SettingsWindow,
    defaultSize: { width: 600, height: 500 },
    minSize: { width: 400, height: 350 },
    icon: "settings",
    description: "Configure system settings",
    category: "System",
    showInMenu: true
  },
  Doom: {
    title: "DOOM.EXE",
    component: DoomWindow,
    defaultSize: { width: 640, height: 480 },
    minSize: { width: 640, height: 480 },
    icon: "game",
    description: "Classic first-person shooter game",
    category: "Games",
    isGame: true,
    showInMenu: true
  },
  Starfield: {
    title: "STARFIELD.EXE",
    component: StarfieldWindow,
    defaultSize: { width: 650, height: 520 },
    minSize: { width: 640, height: 480 },
    icon: "arcade",
    description: "Anomaly detection simulator",
    category: "Games",
    isGame: true,
    showInMenu: true
  },
  Labyrinth: {
    title: "LABYRINTH.EXE",
    component: LabyrinthWindow,
    defaultSize: { width: 600, height: 500 },
    minSize: { width: 580, height: 400 },
    icon: "maze",
    description: "Neural pathway simulation",
    category: "Games",
    isGame: true,
    showInMenu: true
  },
  LogViewer: {
    title: "System Log Viewer",
    component: LogViewerWindow,
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 500, height: 300 },
    icon: "log",
    description: "View system and application logs",
    category: "System",
    showInMenu: true
  },
  Guide: {
    title: "GUIDE.EXE",
    component: GuideWindow,
    defaultSize: { width: 720, height: 540 },
    minSize: { width: 600, height: 400 },
    icon: "question",
    description: "Mystery Guide and Hint System",
    category: "System",
    showInMenu: false
  },
  Wolfenstein3D: {
    title: "WOLF3D.EXE",
    component: Wolfenstein3DWindow,
    defaultSize: { width: 640, height: 480 },
    minSize: { width: 640, height: 480 },
    icon: "game",
    description: "Classic first-person shooter game from id Software",
    category: "Games",
    isGame: true,
    showInMenu: true
  },
  CommanderKeen: {
    title: "KEEN4.EXE",
    component: CommanderKeenWindow,
    defaultSize: { width: 640, height: 480 },
    minSize: { width: 640, height: 480 },
    icon: "game",
    description: "Platformer game featuring Commander Keen",
    category: "Games",
    isGame: true,
    showInMenu: true
  },
  OregonTrail: {
    title: "OREGON.EXE",
    component: OregonTrailWindow,
    defaultSize: { width: 640, height: 480 },
    minSize: { width: 640, height: 480 },
    icon: "game",
    description: "Educational game about the Oregon Trail",
    category: "Games",
    isGame: true,
    showInMenu: true
  },
  Nexus9: {
    title: "NEXUS9.EXE",
    component: Nexus9Window,
    defaultSize: { width: 900, height: 600 },
    minSize: { width: 650, height: 450 },
    icon: "computer",
    description: "Reality Simulation Engine",
    category: "System",
    showInMenu: false
  }
};

/**
 * Render an app component by name with props
 */
export const renderApp = (appName: string, props: AppProps): React.ReactNode => {
  // Try the exact name first, then with first letter capitalized
  let appEntry = appRegistry[appName];
  
  if (!appEntry) {
    // Try with first letter capitalized (e.g., "guide" -> "Guide")
    const normalizedName = appName.charAt(0).toUpperCase() + appName.slice(1).toLowerCase();
    appEntry = appRegistry[normalizedName];
  }
  
  if (!appEntry) {
    console.error(`App component "${appName}" not found in registry`);
    return React.createElement(
      'div', 
      { style: { padding: '16px' } },
      React.createElement('h3', null, 'Error: App Not Found'),
      React.createElement('p', null, `The app "${appName}" could not be found.`)
    );
  }
  
  const { component: AppComponent } = appEntry;
  return React.createElement(AppComponent, props);
};

/**
 * Register a new app in the registry
 */
export const registerApp = (name: string, appItem: AppRegistryItem): void => {
  appRegistry[name] = appItem;
};

// Register ErrorDialog component
appRegistry['ErrorDialog'] = {
  title: "System Error",
  component: ErrorDialog,
  defaultSize: { width: 450, height: 250 },
  minSize: { width: 400, height: 200 },
  icon: "error",
  description: "System error dialog",
  category: "System",
  showInMenu: false
};

export default appRegistry;
