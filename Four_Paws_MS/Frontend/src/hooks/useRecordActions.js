import { useState } from 'react';

export const useRecordActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);

  const handledata = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/record');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const sortedRecords = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestRecords = sortedRecords.slice(0, 5);
      setRecords(latestRecords);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/record');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const sortedRecords = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecords(sortedRecords);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching all records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleViewAll,
    handledata,
    isLoading,
    records,
    setRecords,
    error
  };
};