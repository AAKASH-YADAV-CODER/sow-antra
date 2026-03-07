import { useCallback } from 'react';
import { projectAPI } from '../../../services/api';

/**
 * Custom hook for managing project save/load operations
 * Handles saving to cloud (PostgreSQL) with local backup and loading from JSON files
 * 
 * @param {Object} params - Hook parameters
 * @returns {Object} Project management functions
 */
const useProjectManager = ({
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
  loadProjectInputRef,
  centerCanvas,
  projectId // New parameter
}) => {

  // Show save dialog with current project name
  const handleSaveClick = useCallback(() => {
    // Only set a default if it's currently "Untitled project" or empty
    if (!projectName || projectName === 'Untitled project') {
      setProjectName(`My Design ${new Date().toLocaleDateString()}`);
    }
    setShowSaveDialog(true);
  }, [projectName, setProjectName, setShowSaveDialog]);

  // Save project to backend (PostgreSQL) with local backup
  const saveProject = useCallback(async (customTitle = null, isSilent = false) => {
    try {
      const now = new Date().toISOString();
      let finalTitle = projectName || 'Untitled project';
      let thumbnail = null;

      if (typeof customTitle === 'string') {
        finalTitle = customTitle;
      } else if (typeof customTitle === 'object' && customTitle !== null) {
        finalTitle = customTitle.title || finalTitle;
        thumbnail = customTitle.thumbnail || null;
      }

      const projectData = {
        version: '1.0',
        timestamp: now,
        lastModified: now,
        title: String(finalTitle).trim(),
        description: 'Created with Sowntra',
        pages: pages,
        currentPage: currentPage,
        canvasSize: canvasSize,
        zoomLevel: zoomLevel,
        canvasOffset: canvasOffset,
        showGrid: showGrid,
        snapToGrid: snapToGrid,
        currentLanguage: currentLanguage,
        textDirection: textDirection,
        thumbnail: thumbnail
      };

      // Only include ID if it is truthy (not null/undefined/empty)
      if (projectId) {
        projectData.id = projectId;
      }

      // Save to cloud
      let response;
      if (projectId) {
        response = await projectAPI.updateProject(projectId, projectData);
      } else {
        response = await projectAPI.saveProject(projectData);
      }

      if (!isSilent) {
        alert(projectId ? 'Project updated successfully!' : 'Project saved successfully!');
      }

      return response; // Return response so caller can get new ID if needed
    } catch (error) {
      if (!isSilent) {
        console.error('Error saving project:', error);
        alert('Error saving project to cloud. Please try again.');
      } else {
        console.warn('Silent save failed:', error);
      }
    }
  }, [pages, currentPage, canvasSize, zoomLevel, canvasOffset, showGrid, snapToGrid, currentLanguage, textDirection, projectName, projectId]);

  // Confirm save with project name validation
  const confirmSave = useCallback(async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    setShowSaveDialog(false);
    const response = await saveProject(projectName.trim());

    // Update URL if new project created and ID returned
    if (!projectId && response?.data?.id) {
      const newId = response.data.id;
      const url = new URL(window.location);
      url.searchParams.set('project', newId);
      window.history.replaceState({}, '', url);
    }
  }, [projectName, saveProject, setShowSaveDialog, projectId]);

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
          if (projectData.title) {
            setProjectName(projectData.title);
          }

          // Clear selections
          setSelectedElement(null);
          setSelectedElements(new Set());

          // Force center and fit
          const newSize = projectData.canvasSize || { width: 800, height: 600 };
          setTimeout(() => centerCanvas(newSize), 50);

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
  }, [setPages, setCurrentPage, setCanvasSize, setZoomLevel, setCanvasOffset, setShowGrid, setSnapToGrid, setCurrentLanguage, setTextDirection, setSelectedElement, setSelectedElements, centerCanvas, setProjectName]);

  return {
    handleSaveClick,
    saveProject,
    confirmSave,
    loadProject,
    handleProjectFileLoad
  };
};

export default useProjectManager;
