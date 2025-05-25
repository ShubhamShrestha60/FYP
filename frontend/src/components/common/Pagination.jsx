import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the start
      if (currentPage <= 2) {
        end = 4;
      }
      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
          ${currentPage === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
          }`}
      >
        <FiChevronLeft className="h-4 w-4" />
        <span className="ml-1">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span 
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-gray-500"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${currentPage === page
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                }`}
            >
              {page}
            </button>
          )
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
          ${currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
          }`}
      >
        <span className="mr-1">Next</span>
        <FiChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination; 