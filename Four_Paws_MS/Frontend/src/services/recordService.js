export const deleteRecord = async (recordId) => {
    try {
      const response = await fetch(`http://localhost:3001/record/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage;
        
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message;
        } else {
          const text = await response.text();
          // Handle HTML error responses
          if (text.startsWith('<!DOCTYPE html>')) {
            errorMessage = `Endpoint not found (${response.status})`;
          } else {
            errorMessage = text || `HTTP error! status: ${response.status}`;
          }
        }
        
        throw new Error(errorMessage);
      }
  
      return { success: true, message: 'Record deleted successfully!' };
    } catch (error) {
      console.error('Delete error:', error.message);
      throw error;
    }
  };