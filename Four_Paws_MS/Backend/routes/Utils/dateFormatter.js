function formatDate(dateInput) {
  if (!dateInput) return 'Invalid Date';

  // If it's already a Date object, convert to ISO string (which is parseable by new Date)
  if (dateInput instanceof Date) {
    dateInput = dateInput.toISOString();
  } else if (typeof dateInput !== 'string') {
    // If it's not string or Date, convert to string
    dateInput = dateInput.toString();
  }

  // For string dates with space instead of 'T', replace space with 'T'
  dateInput = dateInput.replace(' ', 'T');

  const date = new Date(dateInput);


  if (isNaN(date)) return 'Invalid Date';

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date
    .toLocaleDateString('en-US', options)
    .replace(',', '')
    .replace(/ /g, '-'); // July-10-2025
}

  
  function formatTime(dateInput) {
    if (!dateInput) return 'Invalid Time';
    const date = new Date(dateInput.toString().replace(' ', 'T'));
    if (isNaN(date)) return 'Invalid Time';
  
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('en-US', options).replace(':', '.'); // 1.30 PM
  }
  
  module.exports = {
    formatDate,
    formatTime,
  };
  