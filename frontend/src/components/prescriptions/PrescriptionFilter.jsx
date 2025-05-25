import React from 'react';
import { FiFilter } from 'react-icons/fi';

const PrescriptionFilter = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="flex items-center space-x-4">
      <FiFilter className="text-gray-400" />
      <select
        name="prescriptionType"
        value={filters.prescriptionType}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      >
        <option value="">All Types</option>
        <option value="Single Vision">Single Vision</option>
        <option value="Bifocal">Bifocal</option>
        <option value="Progressive">Progressive</option>
      </select>

      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="verified">Verified</option>
        <option value="rejected">Rejected</option>
      </select>

      <select
        name="dateRange"
        value={filters.dateRange}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      >
        <option value="">All Time</option>
        <option value="7">Last 7 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="90">Last 90 Days</option>
        <option value="365">Last Year</option>
      </select>
    </div>
  );
};

export default PrescriptionFilter; 