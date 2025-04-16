import React from 'react';


const ViewAllRecords = ({ onClick, isLoading }) => {
  return (
    <button 
      type="button" 
      onClick={onClick}
      disabled={isLoading}
      className={`px-4 py-2 bg-gradient-to-r from-[#028478] to-[#5ba29c] text-white rounded-lg hover:from-[#5ba29c] hover:to-[#028478] transition-all font-medium flex items-center gap-2 ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? (
        'Loading...'
      ) : (
        <>
          View All Records
        </>
      )}
    </button>
  );
};

export default ViewAllRecords;