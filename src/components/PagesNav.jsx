import React from 'react';

const PagesNav = ({ pages, currentPage, setCurrentPage, addNewPage, deleteCurrentPage, renameCurrentPage, t }) => {
  return (
    <div className="bg-white shadow-sm p-2 border-b flex items-center space-x-2">
      <span className="text-sm font-medium">{t('pages.title')}:</span>
      {pages.map(page => (
        <button key={page.id} onClick={() => setCurrentPage(page.id)} className={`px-3 py-1 rounded text-sm ${currentPage === page.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
          {page.name}
        </button>
      ))}
      <button onClick={addNewPage} className="p-1 rounded hover:bg-gray-100" title="Add Page">+</button>
      <button onClick={deleteCurrentPage} className="p-1 rounded hover:bg-gray-100" title="Delete Page" disabled={pages.length <= 1}>-</button>
      <button onClick={renameCurrentPage} className="p-1 rounded hover:bg-gray-100" title="Rename Page">Rename</button>
    </div>
  );
};

export default PagesNav;
