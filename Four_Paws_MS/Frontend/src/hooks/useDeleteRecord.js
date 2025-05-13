import { useState } from 'react';
import { deleteRecord } from '../services/recordService';

export const useDeleteRecord = (refreshData) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    console.log(`[DEBUG] Starting delete for record ${recordId}`);
    setIsDeleting(true);
    setError(null);
    
    try {
      const result = await deleteRecord(recordId);
      console.log('[DEBUG] Delete successful:', result);
      
      alert(result.message);
      refreshData?.(); // Optional chaining in case refreshData is undefined
    } catch (error) {
      console.error('[DEBUG] Delete error:', error.message); // Only log the message
      
      const userMessage = error.message.includes('Failed to fetch')
        ? 'Network error - please check your connection'
        : error.message || 'Could not delete record';
      
      setError(userMessage);
      alert(`Error: ${userMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return {handleDelete, isDeleting, error };
};