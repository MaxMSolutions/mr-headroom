// Define global types for the RetroOS system
interface WindowConfig {
  title: string;
  component: string;
  width: number;
  height: number;
  x: number;
  y: number;
  componentProps?: Record<string, any>;
}

interface WindowManagerInterface {
  addWindow: (config: WindowConfig) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
}

declare global {
  interface Window {
    __MYSTERY_ENGINE__?: any; // Global reference to MysteryEngine instance
    openApp?: (appName: string, props?: Record<string, any>) => void;
    windowManager?: WindowManagerInterface;
  }
}

export {};
