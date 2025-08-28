/**
 * useRedHerringSystem.ts
 * A React hook for interacting with the RedHerringSystem
 */

import { useState, useEffect } from 'react';
import redHerringSystemInstance, { RedHerring } from '../../engine/mystery/RedHerringSystem';

/**
 * Hook for using the RedHerringSystem in React components
 */
export const useRedHerringSystem = () => {
  const [redHerrings, setRedHerrings] = useState<RedHerring[]>([]);
  const [exposedHerrings, setExposedHerrings] = useState<RedHerring[]>([]);
  const [exposurePercentage, setExposurePercentage] = useState<number>(0);
  
  useEffect(() => {
    // Get initial state from RedHerringSystem
    setRedHerrings(redHerringSystemInstance.getAllRedHerrings());
    setExposedHerrings(redHerringSystemInstance.getExposedRedHerrings());
    setExposurePercentage(redHerringSystemInstance.getRedHerringExposurePercentage());
    
    // Listen for red herring events
    const handleRedHerringEvent = (event: CustomEvent) => {
      // Refresh state when red herring events occur
      setRedHerrings(redHerringSystemInstance.getAllRedHerrings());
      setExposedHerrings(redHerringSystemInstance.getExposedRedHerrings());
      setExposurePercentage(redHerringSystemInstance.getRedHerringExposurePercentage());
    };
    
    // Add event listener
    window.addEventListener('redHerringUpdate', handleRedHerringEvent as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('redHerringUpdate', handleRedHerringEvent as EventListener);
    };
  }, []);
  
  /**
   * Expose a red herring
   * @param id The ID of the red herring to expose
   * @param byClueId Optional clue that exposed this red herring
   */
  const exposeRedHerring = (id: string, byClueId?: string): boolean => {
    return redHerringSystemInstance.processRedHerringExposure(id);
  };
  
  /**
   * Check if a clue is a red herring
   * @param clueId The ID of the clue to check
   */
  const isRedHerring = (clueId: string): boolean => {
    return redHerringSystemInstance.isRedHerring(clueId);
  };
  
  /**
   * Check if a red herring has been exposed
   * @param id The ID of the red herring to check
   */
  const isExposed = (id: string): boolean => {
    return redHerringSystemInstance.isRedHerringExposed(id);
  };
  
  /**
   * Get red herrings related to a specific ending path
   * @param path The ending path
   */
  const getRedHerringsForPath = (path: 'alpha' | 'beta' | 'gamma'): RedHerring[] => {
    return redHerringSystemInstance.getRedHerringsForPath(path);
  };
  
  return {
    redHerrings,
    exposedHerrings,
    exposurePercentage,
    exposeRedHerring,
    isRedHerring,
    isExposed,
    getRedHerringsForPath,
    totalRedHerrings: redHerringSystemInstance.getTotalRedHerrings(),
    exposedCount: redHerringSystemInstance.getExposedRedHerringCount()
  };
};

export default useRedHerringSystem;
