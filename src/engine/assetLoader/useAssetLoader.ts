import { useState, useEffect } from 'react';

export type AssetType = 'image' | 'audio' | 'json' | 'text';

export interface Asset {
  id: string;
  type: AssetType;
  url: string;
  data?: any;
  loaded: boolean;
  error?: Error;
}

export interface AssetLoaderOptions {
  preload?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error, assetId: string) => void;
}

export interface AssetLoaderResult {
  assets: Record<string, Asset>;
  loading: boolean;
  progress: number;
  error: Error | null;
  getAsset: <T>(id: string) => T | undefined;
}

export const useAssetLoader = (
  assetList: Array<Omit<Asset, 'loaded' | 'data'>>, 
  options?: AssetLoaderOptions
): AssetLoaderResult => {
  const [assets, setAssets] = useState<Record<string, Asset>>({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (assetList.length === 0) {
      setLoading(false);
      setProgress(100);
      if (options?.onComplete) {
        options.onComplete();
      }
      return;
    }

    if (!options?.preload) {
      // Initialize assets map but don't load yet
      const initialAssets = assetList.reduce((acc, asset) => {
        acc[asset.id] = { ...asset, loaded: false };
        return acc;
      }, {} as Record<string, Asset>);
      
      setAssets(initialAssets);
      setLoading(false);
      return;
    }

    let loadedCount = 0;
    let hasErrors = false;

    const updateProgress = () => {
      const newProgress = Math.round((loadedCount / assetList.length) * 100);
      setProgress(newProgress);
      
      if (options?.onProgress) {
        options.onProgress(newProgress);
      }
      
      if (loadedCount === assetList.length) {
        setLoading(false);
        
        if (!hasErrors && options?.onComplete) {
          options.onComplete();
        }
      }
    };

    const newAssets: Record<string, Asset> = {};

    // Helper function to handle loading an asset
    const loadAsset = async (asset: Omit<Asset, 'loaded' | 'data'>) => {
      try {
        let data: any;
        
        switch (asset.type) {
          case 'image':
            data = await loadImage(asset.url);
            break;
          case 'audio':
            data = await loadAudio(asset.url);
            break;
          case 'json':
            data = await loadJSON(asset.url);
            break;
          case 'text':
            data = await loadText(asset.url);
            break;
          default:
            throw new Error(`Unsupported asset type: ${asset.type}`);
        }
        
        newAssets[asset.id] = {
          ...asset,
          data,
          loaded: true,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        newAssets[asset.id] = {
          ...asset,
          loaded: false,
          error,
        };
        
        hasErrors = true;
        
        if (options?.onError) {
          options.onError(error, asset.id);
        }
        
        setError(error);
      } finally {
        loadedCount++;
        updateProgress();
        setAssets({ ...newAssets });
      }
    };

    // Load all assets
    assetList.forEach(asset => {
      loadAsset(asset);
    });

  }, [assetList, options?.preload]);

  // Utility function to get a typed asset
  const getAsset = <T>(id: string): T | undefined => {
    const asset = assets[id];
    return asset?.loaded ? (asset.data as T) : undefined;
  };

  return { assets, loading, progress, error, getAsset };
};

// Helper functions for loading different asset types
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

const loadAudio = (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.onloadeddata = () => resolve(audio);
    audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
    audio.src = url;
  });
};

const loadJSON = async (url: string): Promise<any> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load JSON: ${url}`);
  }
  return response.json();
};

const loadText = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load text: ${url}`);
  }
  return response.text();
};

export default useAssetLoader;
