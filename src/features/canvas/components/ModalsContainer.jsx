import React from 'react';
import SaveDialog from './modals/SaveDialog';
import TemplatesModal from './modals/TemplatesModal';
import CustomTemplateModal from './modals/CustomTemplateModal';
import LanguageHelpModal from './modals/LanguageHelpModal';

/**
 * ModalsContainer Component
 * Groups all modal dialogs in one place for better organization
 * Includes: Templates, Custom Template, Save, and Language Help modals
 */
const ModalsContainer = ({
  // Templates Modal
  showTemplates,
  setShowTemplates,
  applyTemplate,
  
  // Custom Template Modal
  showCustomTemplateModal,
  setShowCustomTemplateModal,
  customTemplateSize,
  setCustomTemplateSize,
  createCustomTemplate,
  
  // Language Help Modal
  showLanguageHelp,
  setShowLanguageHelp,
  currentLanguage,
  
  // Save Dialog
  showSaveDialog,
  setShowSaveDialog,
  projectName,
  setProjectName,
  confirmSave
}) => {
  return (
    <>
      {/* Template Selector - Responsive */}
      <TemplatesModal 
        show={showTemplates}
        onClose={() => setShowTemplates(false)}
        onApplyTemplate={applyTemplate}
      />

      {/* Custom Template Modal */}
      <CustomTemplateModal 
        show={showCustomTemplateModal}
        templateSize={customTemplateSize}
        onSizeChange={setCustomTemplateSize}
        onCreate={createCustomTemplate}
        onCancel={() => setShowCustomTemplateModal(false)}
      />

      {/* Language Help Modal */}
      <LanguageHelpModal 
        show={showLanguageHelp}
        currentLanguage={currentLanguage}
        onClose={() => setShowLanguageHelp(false)}
      />

      {/* Save Dialog */}
      <SaveDialog 
        show={showSaveDialog}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onSave={confirmSave}
        onCancel={() => setShowSaveDialog(false)}
      />
    </>
  );
};

export default ModalsContainer;
