import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Components/ui/PetServiceForm.css';
import  logo from '../assets/logo.png';
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useDeleteRecord } from '../hooks/useDeleteRecord';

const PetServiceForm = () => {
    const [ownerName, setOwnerName] = useState('');
    const [petName, setPetName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [services, setServices] = useState([]);
    const [serviceDetails, setServiceDetails] = useState({});
    const [errors, setErrors] = useState({});
    const [records, setRecords] = useState([]);
    const { handleDelete, isDeleting, error } = useDeleteRecord(() => {
        records.length > 5 ? handleViewAll() : handledata();
      });


    const navigate = useNavigate();

    const handleEdit = (recordId) => {
        navigate(`/edit/${recordId}`);
      };

      const handleSearch = () => {
        navigate('/search');
      };


    const handleServiceChange = (service) => {
      setServices((prev) => {
          const newServices = prev.includes(service) 
              ? prev.filter(s => s !== service)
              : [...prev, service];
          
          // Clear details when unchecking a service
          if (!newServices.includes(service)) {
              setServiceDetails(prevDetails => {
                  const newDetails = {...prevDetails};
                  delete newDetails[service];
                  return newDetails;
              });
          }
          return newServices;
      });
  };

    const handleDetailChange = (service, value) => {
        setServiceDetails((prev) => ({
            ...prev,
            [service]: value,
        }));
    };

    const validateName = (name) => /^[A-Za-z\s]+$/.test(name);

    const handleSubmit = async (e) => {
      e.preventDefault();
      const today = new Date().toISOString().split('T')[0];
      let validationErrors = {};
    
      if (!validateName(ownerName)) {
          validationErrors.ownerName = 'Owner name must contain only English letters';
      }
    
      if (!validateName(petName)) {
          validationErrors.petName = 'Pet name must contain only English letters';
      }
    
      if (date > today) {
          validationErrors.date = 'Date cannot be in the future';
      }
    
      if (services.length === 0) {
          validationErrors.services = 'At least one service must be selected';
      }
    
      services.forEach(service => {
          if (!serviceDetails[service] || serviceDetails[service].trim() === '') {
              validationErrors[service] = `${service} details cannot be empty`;
          }
      });
    
      if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
      }
    
      // Create an object with all possible services, filling in the selected ones
      const details = {
        Surgery: services.includes('Surgery') ? serviceDetails['Surgery'] : '',
        Vaccination: services.includes('Vaccination') ? serviceDetails['Vaccination'] : '',
        Other: services.includes('Other') ? serviceDetails['Other'] : ''
      };
    
      const formData = {
        ownerName,
        petName,
        date,
        ...details // Spread the service details directly into the object
      };
    
      console.log("Sending:", formData);
    
      try {
          const response = await fetch('http://localhost:3001/record/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
          });
    
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
    
          const data = await response.json();
          console.log(data.message);
      } catch (error) {
          console.error('Error:', error);
      }
    };
  

    const handleCancel = () => {
        setOwnerName('');
        setPetName('');
        setDate(new Date().toISOString().split('T')[0]);
        setServices([]);
        setServiceDetails({});
        setErrors({});
    };

    
    const [isLoading, setIsLoading] = useState(false);

    const handledata = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3001/record');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched Latest 10 Records:", data);
            // Sort by date (newest first) and take first 10
            const sortedRecords = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            const latestRecords = sortedRecords.slice(0, 5);
        
            setRecords(latestRecords);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };


    



    // Function to generate PDF

    const generatePDF = (record) => {
        try {
            // Initialize jsPDF
            const doc = new jsPDF();
           // const imgData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'; // Base64 image data
           // doc.addImage(imgData, 'PNG', 10, 10, 50, 20); // Add logo image
            

           
            // Manually apply autoTable plugin
            autoTable(doc, {
                startY: 25,
                head: [['Field', 'Value']],
                body: [
                    ['Owner Name', record.owner_name || 'N/A'],
                    ['Pet Name', record.pet_name || 'N/A'],
                    ['Date', record.date || 'N/A'],
                    ['Surgery', record.surgery || 'N/A'],
                    ['Vaccination', record.vaccination || 'N/A'],
                    ['Other', record.other || 'N/A']
                ],
                theme: 'grid',
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold'
                }
            });
    
            // Add logo from assets
            const imgWidth = 30; // Width in mm (adjust as needed)
            const imgHeight = 15; // Height in mm (adjust to maintain aspect ratio)
            const rightMargin = 10; // Margin
            const topMargin = 10; // Margin
            const pageWidth = doc.internal.pageSize.getWidth();
            const x = (pageWidth - imgWidth - rightMargin); // Center horizontally
    
            // Add the logo image
            doc.addImage(logo, 'PNG', x, topMargin, imgWidth, imgHeight);

            // Add title (after table to ensure proper positioning)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text('Pet Service Record', 14, 15);
    
            // Add footer (optional)
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Generated by Four Paws Animal Clinic', 105, doc.internal.pageSize.height - 10, { align: 'center' });


            // Save PDF
            const filename = `Pet_Record_${record.pet_name}.pdf`;
            doc.save(filename);
    
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert(`Failed to generate PDF. Please try again. Error: ${error.message}`);
        }
    };



    const handleViewAll = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3001/record');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            // Sort by date (newest first) but don't limit
            const sortedRecords = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecords(sortedRecords);
        } catch (error) {
            console.error('Error fetching all records:', error);
        } finally {
            setIsLoading(false);
        }

    };



const cancelMe=()=>{
    window.history.back();
};



    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
  <h2 className="text-2xl font-bold text-gray-800 mb-6">Pet Service Form</h2>
  
  <div className="flex flex-wrap gap-3 mb-6">
    <button 
      type="button" 
      onClick={handledata} 
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      Recent Records
    </button>
    <button 
      type="button" 
      onClick={handleViewAll} 
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      View All Records
    </button>
    <button 
      type="button" 
      onClick={handleSearch} 
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
    >
      Search Records
    </button>
    <button 
      type="button" 
      onClick={cancelMe} 
      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
    >
      Close
    </button>
  </div>

  <form onSubmit={handleSubmit} className="space-y-6">
    {isLoading ? (
      <div className="flex justify-center">
        <p className="text-gray-600">Loading records...</p>
      </div>
    ) : records.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border text-left">ID</th>
              <th className="p-2 border text-left">Owner Name</th>
              <th className="p-2 border text-left">Pet Name</th>
              <th className="p-2 border text-left">Date</th>
              <th className="p-2 border text-left">Surgery</th>
              <th className="p-2 border text-left">Vaccination</th>
              <th className="p-2 border text-left">Other</th>
              <th className="p-2 border text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="p-2 border">{record.id}</td>
                <td className="p-2 border">{record.owner_name}</td>
                <td className="p-2 border">{record.pet_name}</td>
                <td className="p-2 border">{record.date}</td>
                <td className="p-2 border">{record.surgery || 'N/A'}</td>
                <td className="p-2 border">{record.vaccination || 'N/A'}</td>
                <td className="p-2 border">{record.other || 'N/A'}</td>
                <td className="p-2 border space-x-2">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      generatePDF(record);
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    Download PDF
                  </button>
                  <button 
                    onClick={() => handleEdit(record.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(record.id)}
                    disabled={isDeleting}
                    className={`px-3 py-1 rounded transition ${
                      isDeleting 
                        ? 'bg-red-300 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-gray-600">No records found.</p>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-gray-700">Owner Name:</label>
        <input
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. John Doe"
        />
        {errors.ownerName && <p className="text-red-500 text-sm">{errors.ownerName}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-gray-700">Pet Name:</label>
        <input
          type="text"
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          required
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. Bella"
        />
        {errors.petName && <p className="text-red-500 text-sm">{errors.petName}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-gray-700">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-gray-700">Services:</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={services.includes('Surgery')}
              onChange={() => handleServiceChange('Surgery')}
              className="rounded text-blue-500"
            />
            <span>Surgery</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={services.includes('Vaccination')}
              onChange={() => handleServiceChange('Vaccination')}
              className="rounded text-blue-500"
            />
            <span>Vaccination</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={services.includes('Other')}
              onChange={() => handleServiceChange('Other')}
              className="rounded text-blue-500"
            />
            <span>Other</span>
          </label>
        </div>
        {errors.services && <p className="text-red-500 text-sm">{errors.services}</p>}
      </div>

      {services.map((service) => (
        <div key={service} className="space-y-2">
          <label className="block text-gray-700">{service} Details:</label>
          <input
            type="text"
            value={serviceDetails[service] || ''}
            onChange={(e) => handleDetailChange(service, e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors[service] && <p className="text-red-500 text-sm">{errors[service]}</p>}
        </div>
      ))}
    </div>

    <div className="flex space-x-4">
      <button 
        type="submit" 
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        Save
      </button>
      <button 
        type="button" 
        onClick={handleCancel} 
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
      >
        Cancel
      </button>
    </div>

    {error && (
      <div className="p-3 bg-red-100 text-red-700 rounded">
        {error}
      </div>
    )}
  </form>
</div>
    );
};

export default PetServiceForm;
