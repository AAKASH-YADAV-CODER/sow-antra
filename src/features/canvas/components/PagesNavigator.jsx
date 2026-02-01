import React from 'react';
import { Plus, Trash2, Type } from 'lucide-react';

/**
 * PagesNavigator Component
 * Bottom navigation bar for managing pages/tabs
 * Allows adding, deleting, renaming, and switching between pages
 */
const PagesNavigator = ({
  t,
  pages,
  currentPage,
  setCurrentPage,
  addNewPage,
  deleteCurrentPage,
  renameCurrentPage
}) => {
  return (
    <div className="bg-white shadow-sm p-2 border-b flex items-center space-x-2 overflow-x-auto md:p-2 sm:p-1.5">
      <span className="text-sm font-medium whitespace-nowrap md:text-sm sm:text-xs">
        {t('pages.title')}:
      </span>
      
      {/* Page Tabs */}
      {pages.map(page => (
        <button
          key={page.id}
          onClick={() => setCurrentPage(page.id)}
          className={`px-3 py-1 rounded text-sm whitespace-nowrap md:px-3 md:py-1 sm:px-2 sm:py-0.5 md:text-sm sm:text-xs flex-shrink-0 ${
            currentPage === page.id 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {page.name}
        </button>
      ))}
      
      {/* Add Page Button */}
      <button
        onClick={addNewPage}
        className="p-1 rounded hover:bg-gray-100 flex-shrink-0"
        title="Add Page"
      >
        <Plus size={16} className="md:w-4 md:h-4 sm:w-3.5 sm:h-3.5" />
      </button>
      
      {/* Delete Page Button */}
      <button
        onClick={deleteCurrentPage}
        className="p-1 rounded hover:bg-gray-100"
        title="Delete Page"
        disabled={pages.length <= 1}
      >
        <Trash2 size={16} />
      </button>
      
      {/* Rename Page Button */}
      <button
        onClick={renameCurrentPage}
        className="p-1 rounded hover:bg-gray-100"
        title="Rename Page"
      >
        <Type size={16} />
      </button>
    </div>
  );
};

export default PagesNavigator;
