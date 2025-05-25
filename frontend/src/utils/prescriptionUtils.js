/**
 * Filter prescriptions based on search term and filters
 * @param {Array} prescriptions - Array of prescription objects
 * @param {string} searchTerm - Search term to filter by
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered prescriptions
 */
export const filterPrescriptions = (prescriptions, searchTerm, filters = {}) => {
  let filtered = [...prescriptions];

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(prescription => 
      prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filter by prescription type
  if (filters.prescriptionType) {
    filtered = filtered.filter(prescription => 
      prescription.prescriptionType === filters.prescriptionType
    );
  }

  // Filter by status
  if (filters.status) {
    filtered = filtered.filter(prescription => 
      prescription.status === filters.status
    );
  }

  // Filter by date range
  if (filters.dateRange) {
    const days = parseInt(filters.dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    filtered = filtered.filter(prescription => {
      const prescriptionDate = new Date(prescription.createdAt);
      return prescriptionDate >= cutoffDate;
    });
  }

  return filtered;
};

/**
 * Get paginated items from an array
 * @param {Array} items - Array of items to paginate
 * @param {number} currentPage - Current page number
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} Object containing current items and pagination info
 */
export const getPaginatedItems = (items, currentPage, itemsPerPage) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  return {
    currentItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}; 