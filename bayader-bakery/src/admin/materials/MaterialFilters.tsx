import React from 'react';

interface Props {
  search: string;
  onSearchChange: (search: string) => void;
  isActiveFilter: boolean | undefined;
  onIsActiveFilterChange: (isActive: boolean | undefined) => void;
}

const MaterialFilters: React.FC<Props> = ({
  search,
  onSearchChange,
  isActiveFilter,
  onIsActiveFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Search materials..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border border-gray-300 px-3 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <select
        title="Filter by Status"
        value={isActiveFilter === undefined ? 'all' : isActiveFilter.toString()}
        onChange={(e) => {
          const value = e.target.value;
          onIsActiveFilterChange(
            value === 'all' ? undefined : value === 'true'
          );
        }}
        className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] focus:border-transparent"
      >
        <option value="all">All Materials</option>
        <option value="true">Active Only</option>
        <option value="false">Inactive Only</option>
      </select>
    </div>
  );
};

export default MaterialFilters;