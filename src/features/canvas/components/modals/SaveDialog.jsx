import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

const SaveDialog = ({ show, projectName, onProjectNameChange, onSave, onCancel }) => {
  const { t } = useTranslation();
  
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (projectName.trim()) {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl 
                      md:p-6 sm:p-4 
                      transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold md:text-2xl sm:text-lg">
            {t('save.projectName') || 'Save Project'}
          </h2>
          <button 
            onClick={onCancel}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder={t('save.enterProjectName') || 'Enter project name'}
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 
                       focus:border-blue-500 focus:outline-none
                       md:p-3 sm:p-2 sm:text-sm
                       transition-colors"
            autoFocus
          />
          
          <div className="flex space-x-2 md:space-x-3 sm:space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 p-3 bg-gray-200 rounded-lg hover:bg-gray-300 
                         font-medium transition-colors
                         md:p-3 sm:p-2 sm:text-sm"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 p-3 bg-blue-500 text-white rounded-lg 
                         hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed
                         font-medium transition-colors
                         md:p-3 sm:p-2 sm:text-sm"
              disabled={!projectName.trim()}
            >
              {t('common.save') || 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveDialog;
