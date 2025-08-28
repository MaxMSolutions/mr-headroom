declare global {
  interface Window {
    openApp?: (appName: string, props?: any) => void;
    windowManager?: {
      addWindow: (config: any) => void;
    };
  }
}
