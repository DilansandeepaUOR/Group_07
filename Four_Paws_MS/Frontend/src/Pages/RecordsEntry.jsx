import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  logo from '../assets/logo.png';
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useDeleteRecord } from '../hooks/useDeleteRecord';
import { FaTimes, FaExclamationCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import ViewAllRecords from './ViewAllRecords';
import { useRecordActions } from '../hooks/useRecordActions';


const PetServiceForm = () => {
    const [ownerName, setOwnerName] = useState('');
    const [petName, setPetName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [services, setServices] = useState([]);
    const [serviceDetails, setServiceDetails] = useState({});
    const [errors, setErrors] = useState({});
    const { handleDelete, isDeleting, error } = useDeleteRecord(() => {
      records.length > 5 ? handleViewAll() : handledata()});
    const { 
      handleViewAll, 
      isLoading, 
      records,
      handledata
    } = useRecordActions();
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

    
    // Function to generate PDF
    const generatePDF = (record) => {
        try {
            const doc = new jsPDF();
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
            const imgWidth = 30; 
            const imgHeight = 15; 
            const rightMargin = 10; 
            const topMargin = 10; 
            const pageWidth = doc.internal.pageSize.getWidth();
            const x = (pageWidth - imgWidth - rightMargin);
    
            // Add the logo image
            doc.addImage(logo, 'PNG', x, topMargin, imgWidth, imgHeight);

            // Add title 
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text('Service Record Details', 14, 15);
    
            // Add footer
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



    const cancelMe = () => {
        navigate('/Docprofile'); 
      };



    return (
      
      <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] z-50 p-4 overflow-y-auto">
        <div className="absolute top-5 left-5 object-cover w-[200px]">
        <img src={logo} alt="logo" />
      </div>
      <div className="bg-gradient-to-b from-[#182020] to-[#394a46] p-8 rounded-lg shadow-2xl w-full max-w-7xl relative border-2 border-gray-800">
        {/* Close Button */}
        <button
          onClick={cancelMe}
          className="absolute top-3 right-3 text-white hover:text-gray-200 text-lg cursor-pointer"
        >
          <FaTimes size={22} />
        </button>
    
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white mb-6 Poppins">
          Records Entry Section
        </h2>
        
    
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <button 
            type="button" 
            onClick={handledata} 
            className="px-4 py-2 bg-gradient-to-r from-[#028478] to-[#5ba29c] text-white rounded-lg hover:from-[#5ba29c] hover:to-[#028478] transition-all font-medium"
          >
            Recent Records
          </button>
          <ViewAllRecords 
          onClick={handleViewAll} 
          isLoading={isLoading}
          />
          <button 
            type="button" 
            onClick={handleSearch} 
            className="px-4 py-2 bg-gradient-to-r from-[#46dfd0] to-[#028478] text-white rounded-lg hover:from-[#028478] hover:to-[#46dfd0] transition-all font-medium"
          >
            Search Records
          </button>
        </div>
    
        {/* Error Message */}
        {error && (
          <p className="text-red-700 bg-red-200 p-2 rounded text-center flex items-center gap-2 mb-4">
            <FaExclamationCircle /> {error}
          </p>
        )}
    
        <form onSubmit={handleSubmit} className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center">
              <p className="text-gray-300">Loading records...</p>
            </div>
          ) : records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[#394a46]">
                    <th className="p-3 border border-gray-600 text-left text-white">ID</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Owner Name</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Pet Name</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Date</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Surgery</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Vaccination</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Other</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-[#394a46]/50 text-gray-200">
                      <td className="p-3 border border-gray-600">{record.id}</td>
                      <td className="p-3 border border-gray-600">{record.owner_name}</td>
                      <td className="p-3 border border-gray-600">{record.pet_name}</td>
                      <td className="p-3 border border-gray-600">{record.date}</td>
                      <td className="p-3 border border-gray-600">{record.surgery || 'N/A'}</td>
                      <td className="p-3 border border-gray-600">{record.vaccination || 'N/A'}</td>
                      <td className="p-3 border border-gray-600">{record.other || 'N/A'}</td>
                      <td className="p-3 border border-gray-600 space-x-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            generatePDF(record);
                          }}
                          className="px-3 py-1 bg-gradient-to-r from-[#46dfd0] to-[#028478] text-white rounded-lg hover:from-[#028478] hover:to-[#46dfd0] transition-all"
                        >
                          Download PDF
                        </button>
                        <button 
                          onClick={() => handleEdit(record.id)}
                          className="px-3 py-1 bg-gradient-to-r from-[#028478] to-[#5ba29c] text-white rounded-lg hover:from-[#5ba29c] hover:to-[#028478] transition-all"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(record.id)}
                          disabled={isDeleting}
                          className={`px-3 py-1 rounded-lg transition-all ${
                            isDeleting 
                              ? 'bg-red-300 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-500 text-white'
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
            <p className="text-gray-300 text-center">No records found.</p>
          )}
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-white">Owner Name:</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-[#394a46]/50"
                placeholder="e.g. John Doe"
              />
              {errors.ownerName && <p className="text-red-400 text-sm flex items-center gap-1"><FaExclamationCircle /> {errors.ownerName}</p>}
            </div>
    
            <div className="space-y-2">
              <label className="block text-white">Pet Name:</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
                className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-[#394a46]/50"
                placeholder="e.g. Bella"
              />
              {errors.petName && <p className="text-red-400 text-sm flex items-center gap-1"><FaExclamationCircle /> {errors.petName}</p>}
            </div>
    
            <div className="space-y-2">
              <label className="block text-white">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-[#394a46]/50"
              />
              {errors.date && <p className="text-red-400 text-sm flex items-center gap-1"><FaExclamationCircle /> {errors.date}</p>}
            </div>
    
            <div className="space-y-2">
              <label className="block text-white">Services:</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={services.includes('Surgery')}
                    onChange={() => handleServiceChange('Surgery')}
                    className="rounded text-[#46dfd0] focus:ring-[#46dfd0]"
                  />
                  <span>Surgery</span>
                </label>
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={services.includes('Vaccination')}
                    onChange={() => handleServiceChange('Vaccination')}
                    className="rounded text-[#46dfd0] focus:ring-[#46dfd0]"
                  />
                  <span>Vaccination</span>
                </label>
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={services.includes('Other')}
                    onChange={() => handleServiceChange('Other')}
                    className="rounded text-[#46dfd0] focus:ring-[#46dfd0]"
                  />
                  <span>Other</span>
                </label>
              </div>
              {errors.services && <p className="text-red-400 text-sm flex items-center gap-1"><FaExclamationCircle /> {errors.services}</p>}
            </div>
    
            {services.map((service) => (
              <div key={service} className="space-y-2">
                <label className="block text-white">{service} Details:</label>
                <input
                  type="text"
                  value={serviceDetails[service] || ''}
                  onChange={(e) => handleDetailChange(service, e.target.value)}
                  className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-[#394a46]/50"
                />
                {errors[service] && <p className="text-red-400 text-sm flex items-center gap-1"><FaExclamationCircle /> {errors[service]}</p>}
              </div>
            ))}
          </div>
    
          <div className="flex justify-center gap-4 pt-4">
            <button 
              type="submit" 
              className="px-6 py-2 bg-gradient-to-r from-[#028478] to-[#5ba29c] text-white rounded-lg hover:from-[#5ba29c] hover:to-[#028478] transition-all font-bold"
            >
              Save
            </button>
            <button 
              type="button" 
              onClick={handleCancel} 
              className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    );
};

export default PetServiceForm;
