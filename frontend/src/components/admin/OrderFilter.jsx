import React from 'react';

const OrderFilter = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onFilterChange({
      status: 'all',
      customer: '',
      orderId: '',
      dateFrom: '',
      dateTo: '',
      minTotal: '',
      maxTotal: ''
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 items-end mb-6">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-40"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Customer</label>
        <input
          type="text"
          name="customer"
          value={filters.customer}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-40"
          placeholder="Name or Email"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Order ID</label>
        <input
          type="text"
          name="orderId"
          value={filters.orderId}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-40"
          placeholder="Order ID"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-36"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-36"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Min Total</label>
        <input
          type="number"
          name="minTotal"
          value={filters.minTotal}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-28"
          placeholder="Min"
          min="0"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Max Total</label>
        <input
          type="number"
          name="maxTotal"
          value={filters.maxTotal}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-28"
          placeholder="Max"
          min="0"
        />
      </div>
      <button
        className="ml-auto px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        type="button"
        onClick={handleReset}
      >
        Reset
      </button>
    </div>
  );
};

export default OrderFilter; 