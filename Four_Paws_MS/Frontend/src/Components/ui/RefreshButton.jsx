import React from 'react';
import { RotateCcw } from 'lucide-react';

const RefreshButton = ({ onClick, className = '', title = 'Refresh' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-full hover:bg-gray-200 transition ${className}`}
    title={title}
    aria-label={title}
  >
    <RotateCcw className="w-5 h-5 text-[#028478]" />
  </button>
);

export default RefreshButton; 