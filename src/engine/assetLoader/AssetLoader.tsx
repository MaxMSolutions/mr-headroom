import React from 'react';
import useAssetLoader, { AssetLoaderOptions, Asset } from './useAssetLoader';

interface AssetLoaderProps {
  assets: Array<Omit<Asset, 'loaded' | 'data'>>;
  options?: AssetLoaderOptions;
  loadingScreen?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * AssetLoader Component
 * A component that wraps content that requires assets to be loaded.
 * Shows a loading screen until assets are loaded, then renders children.
 */
const AssetLoader: React.FC<AssetLoaderProps> = ({ 
  assets, 
  options, 
  loadingScreen, 
  children 
}) => {
  const { loading, progress } = useAssetLoader(assets, options);

  if (loading) {
    if (loadingScreen) {
      return <>{loadingScreen}</>;
    }
    
    // Default loading screen if none is provided
    return (
      <div className="asset-loader-screen">
        <div className="asset-loader-progress">
          <div className="asset-loader-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="asset-loader-status">Loading assets... {progress}%</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AssetLoader;
