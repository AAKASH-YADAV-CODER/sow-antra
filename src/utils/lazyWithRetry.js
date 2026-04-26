import { lazy } from 'react';

/**
 * A wrapper for React.lazy that handles ChunkLoadError by retrying the import.
 * If the import fails again, it reloads the page once to get the latest bundle manifest.
 * 
 * @param {Function} componentImport - A function that returns a dynamic import()
 * @returns {React.Component} A lazy-loaded component with retry logic
 */
export const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      
      // If successful, reset the refresh flag
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      // Check if it's a ChunkLoadError
      if (!pageHasAlreadyBeenForceRefreshed && (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk'))) {
        // Set flag to avoid infinite loops
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        
        console.warn('ChunkLoadError detected. Reloading page to fetch latest version...');
        window.location.reload();
        
        // This promise will technically never resolve because the page reloads, 
        // which is exactly what we want.
        return new Promise(() => {});
      }

      // If it's another error or we already retried, propagate it
      throw error;
    }
  });

export default lazyWithRetry;
