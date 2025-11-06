import { useCallback } from 'react';
import { projectAPI } from '../../../services/api';

/**
 * Custom hook for managing project save/load operations
 * Handles saving to cloud (PostgreSQL) with local backup and loading from JSON files
 * 
 * @param {Object} params - Hook parameters
 * @returns {Object} Project management functions
 */
export const useProjectManager = ({
  pages,
  currentPage,
  canvasSize,
  zoomLevel,
  canvasOffset,
  showGrid,
  snapToGrid,
  currentLanguage,
  textDirection,
  projectName,
  setProjectName,
  setShowSaveDialog,
  setPages,
  setCurrentPage,
  setCanvasSize,
  setZoomLevel,
  setCanvasOffset,
  setShowGrid,
  setSnapToGrid,
  setCurrentLanguage,
  setTextDirection,
  setSelectedElement,
  setSelectedElements,
  loadProjectInputRef
}) => {

  // Show save dialog with default project name
  const handleSaveClick = useCallback(() => {
    setProjectName(`My Design ${new Date().toLocaleDateString()}`);
    setShowSaveDialog(true);
  }, [setProjectName, setShowSaveDialog]);

  // Save project to backend (PostgreSQL) with local backup
  const saveProject = useCallback(async (customTitle = null) => {
    try {
      const projectData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        title: customTitle || `My Design ${new Date().toLocaleDateString()}`,
        description: 'Created with Sowntra',
        pages: pages,
        currentPage: currentPage,
        canvasSize: canvasSize,
        zoomLevel: zoomLevel,
        canvasOffset: canvasOffset,
        showGrid: showGrid,
        snapToGrid: snapToGrid,
        currentLanguage: currentLanguage,
        textDirection: textDirection
      };

      // Save to cloud
      // eslint-disable-next-line no-unused-vars
      const response = await projectAPI.saveProject(projectData);
      
      // Also save locally as backup
      const dataStr = JSON.stringify(projectData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sowntra-project-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Project saved successfully to cloud and locally!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project to cloud. Saving locally only...');
      
      // Fallback to local save only
      try {
        const projectData = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          pages: pages,
          currentPage: currentPage,
          canvasSize: canvasSize,
          zoomLevel: zoomLevel,
          canvasOffset: canvasOffset,
          showGrid: showGrid,
          snapToGrid: snapToGrid,
          currentLanguage: currentLanguage,
          textDirection: textDirection
        };

        const dataStr = JSON.stringify(projectData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sowntra-project-${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Project saved locally!');
      } catch (localError) {
        console.error('Error saving locally:', localError);
        alert('Error saving project. Please try again.');
      }
    }
  }, [pages, currentPage, canvasSize, zoomLevel, canvasOffset, showGrid, snapToGrid, currentLanguage, textDirection]);

  // Confirm save with project name validation
  const confirmSave = useCallback(async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }
    
    setShowSaveDialog(false);
    await saveProject(projectName.trim());
  }, [projectName, saveProject, setShowSaveDialog]);

  // Trigger file input for loading project
  const loadProject = useCallback(() => {
    loadProjectInputRef.current?.click();
  }, [loadProjectInputRef]);

  // Handle project file load from JSON
  const handleProjectFileLoad = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target.result);
          
          // Validate project data
          if (!projectData.version || !projectData.pages) {
            throw new Error('Invalid project file');
          }

          // Restore project state
          setPages(projectData.pages);
          setCurrentPage(projectData.currentPage || projectData.pages[0]?.id);
          setCanvasSize(projectData.canvasSize || { width: 800, height: 600 });
          setZoomLevel(projectData.zoomLevel || 1);
          setCanvasOffset(projectData.canvasOffset || { x: 0, y: 0 });
          setShowGrid(projectData.showGrid || false);
          setSnapToGrid(projectData.snapToGrid || false);
          setCurrentLanguage(projectData.currentLanguage || 'en');
          setTextDirection(projectData.textDirection || 'ltr');
          
          // Clear selections
          setSelectedElement(null);
          setSelectedElements(new Set());
          
          alert('Project loaded successfully!');
        } catch (error) {
          console.error('Error loading project:', error);
          alert('Error loading project. Please make sure the file is a valid Sowntra project file.');
        }
      };
      reader.readAsText(file);
    }
    
    // Reset the input value so the same file can be loaded again
    event.target.value = '';
  }, [setPages, setCurrentPage, setCanvasSize, setZoomLevel, setCanvasOffset, setShowGrid, setSnapToGrid, setCurrentLanguage, setTextDirection, setSelectedElement, setSelectedElements]);

  return {
    handleSaveClick,
    saveProject,
    confirmSave,
    loadProject,
    handleProjectFileLoad
  };
};

export default useProjectManager;
