import React from 'react';
import { FiSearch } from 'react-icons/fi';

const PrescriptionSearch = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search by patient name..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
      />
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
};

export default PrescriptionSearch; 