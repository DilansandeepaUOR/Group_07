import { useState } from 'react';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import { FaSearch, FaFilePdf, FaTimes, FaUser, FaPaw, FaNotesMedical } from 'react-icons/fa';
import { GiMedicines } from 'react-icons/gi';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';


const PetRecordPDF = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ownerError, setOwnerError] = useState(null);
  const [petError, setPetError] = useState(null);
  const [recordsError, setRecordsError] = useState(null);


  const searchOwners = async () => {
    if (!searchTerm.trim()) return;
    
    setOwners([]);
    setSelectedOwner(null);
    setPets([]);
    setSelectedPet(null);
    setRecords([]);
    setOwnerError(null);
    setPetError(null);
    setRecordsError(null);
    
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/search-owners', {
        params: { searchTerm }
      });
  
      if (response.data.success) {
        setOwners(response.data.data || []);
        if (!response.data.data || response.data.data.length === 0) {
          setOwnerError('No owners found matching your search.');
        }
      } else {
        setOwnerError(response.data.error || response.data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching owners:', error);
      setOwnerError(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Failed to search owners. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPetsByOwner = async (ownerId) => {
    setPets([]);
    setSelectedPet(null);
    setRecords([]);
    setPetError(null);
    setRecordsError(null);
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/get-pets', {
        ownerId
      });
      setPets(response.data);
      if (response.data.length === 0) {
        setPetError('No pets registered for this owner.');
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      setPetError(error.response?.data?.error || 'Failed to fetch pets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPetRecords = async (petId) => {
    setRecords([]);
    setRecordsError(null);
    
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/get-records-with-vaccination', {
        params: { petId }
      });
      
      // Format vaccination information for display
      const formattedRecords = response.data.map(record => {
        let formattedVaccination = '';
        if (record.vaccine_name) {
          formattedVaccination = `${record.vaccine_type === 'core' ? 'Core' : 'Lifestyle'}: ${record.vaccine_name}`;
        }
        if (record.other_vaccine) {
          formattedVaccination += formattedVaccination ? `\nOther: ${record.other_vaccine}` : `Other: ${record.other_vaccine}`;
        }
        
        return {
          ...record,
          formattedVaccination,
          hasVaccination: !!record.vaccine_name || !!record.other_vaccine
        };
      });
      
      setRecords(formattedRecords);
      
      if (formattedRecords.length === 0) {
        setRecordsError('No medical records found for this pet.');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecordsError(error.response?.data?.error || 'Failed to fetch records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!selectedOwner || !selectedPet || records.length === 0) {
      alert('No records available to generate PDF');
      return;
    }
  
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const primaryColor = [2, 132, 120]; // Teal
      const secondaryColor = [80, 80, 80]; // Dark gray
      const lightColor = [240, 240, 240]; // Light gray for backgrounds
  
      // Set document metadata
      doc.setProperties({
        title: `Medical Record - ${selectedPet.Pet_name}`,
        subject: 'Animal Medical Record',
        author: 'Four Paws Animal Clinic',
        keywords: 'medical, record, pet, animal',
        creator: 'Four Paws Animal Clinic'
      });
  
      // Add logo with better positioning
      doc.addImage(logo, 'PNG', margin, margin, 30, 15);
  
      // Title section with improved typography
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...primaryColor);
      doc.text('FOUR PAWS ANIMAL CLINIC', pageWidth / 2, margin + 10, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(...secondaryColor);
      doc.text('MEDICAL REPORT', pageWidth / 2, margin + 18, { align: 'center' });
  
      // Decorative line with better styling
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.8);
      doc.line(margin, margin + 22, pageWidth - margin, margin + 22);
  
      // Information section with better organization
      const infoSectionY = margin + 30;
      
      // Owner Info Box with subtle background
      doc.setFillColor(...lightColor);
      doc.roundedRect(margin, infoSectionY, pageWidth - margin * 2, 25, 3, 3, 'F');
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('OWNER INFORMATION', margin + 5, infoSectionY + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${selectedOwner.Owner_name}`, margin + 5, infoSectionY + 15);
      doc.text(`Email: ${selectedOwner.E_mail}`, margin + 5, infoSectionY + 22);
  
      // Pet Info Box with consistent styling
     // doc.roundedRect(margin, infoSectionY + 30, pageWidth - margin * 2, 20, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('PET INFORMATION', margin + 5, infoSectionY + 38);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${selectedPet.Pet_name} (${selectedPet.Pet_type})`, margin + 5, infoSectionY + 45);
      doc.text(`Breed: ${selectedPet.Breed || 'Unknown'} | Age: ${selectedPet.Age || 'N/A'}`, margin + 5, infoSectionY + 52);
  
      // Generate current date for report
      const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report generated: ${reportDate}`, pageWidth - margin, infoSectionY + 60, { align: 'right' });
  
      // Prepare table data with better formatting
      const tableData = records.map(record => {
        let vaccineInfo = '';
        if (record.hasVaccination) {
          vaccineInfo = record.formattedVaccination || '-';
        }
        
        const formattedDate = record.date 
          ? new Date(record.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          : 'N/A';
        
        return [
          formattedDate,
          record.surgery || '-',
          vaccineInfo,
          record.other || '-'
        ];
      });
  
      // Medical Records Table with professional styling
      autoTable(doc, {
        startY: infoSectionY + 70,
        margin: { left: margin, right: margin },
        head: [['Date', 'Procedure', 'Vaccination', 'Notes']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10
        },
        bodyStyles: {
          textColor: secondaryColor,
          fontSize: 9,
          cellPadding: 4
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248]
        },
        styles: {
          lineColor: [220, 220, 220],
          lineWidth: 0.5
        },
        columnStyles: {
          0: { cellWidth: 22, halign: 'center' },
          1: { cellWidth: 35 },
          2: { cellWidth: 45 },
          3: { cellWidth: 'auto' }
        },
        didDrawPage: function (data) {
          // Add page number
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Page ${data.pageNumber} of ${data.pageCount}`,
            pageWidth - margin,
            pageHeight - margin,
            { align: 'right' }
          );
        }
      });
  
      // Footer with professional layout
      const footerY = pageHeight - 30;
      
      // Clinic information
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('FOUR PAWS ANIMAL CLINIC', margin, footerY);
      doc.setFont('helvetica', 'normal');
      doc.text('No. 03 New Town, Ratnapura', margin, footerY + 5);
      doc.text('Tel: +94 76 123 4567 | Email: 4pawsbusiness4@gmail.com', margin, footerY + 10);
      
      // Signature area
      doc.setFontSize(9);
      doc.text('Authorized Signature:', pageWidth - margin - 60, footerY);
      doc.setDrawColor(...secondaryColor);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - margin - 60, footerY + 2, pageWidth - margin, footerY + 2);
      doc.text('Dr. Veterinarian Name', pageWidth - margin - 40, footerY + 10, { align: 'right' });
  
      // Confidential notice
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('CONFIDENTIAL - For authorized use only', pageWidth / 2, pageHeight - margin / 2, { align: 'center' });
  
      // Save PDF with better filename convention
      const sanitizeName = (name) => name.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
      const fileName = `Medical_Record_${sanitizeName(selectedOwner.Owner_name)}_${sanitizeName(selectedPet.Pet_name)}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`Failed to generate PDF. Please try again or contact support. Error: ${error.message}`);
    }
  };


  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Close Button */}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">PDF Medical Records</h1>
      </div>

      {/* Search Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <FaSearch className="text-blue-500" /> Search for Owner
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter owner name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchOwners()}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
          <button
            onClick={searchOwners}
            disabled={loading || !searchTerm.trim()}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSearch /> Search
          </button>
        </div>
      </section>

      {/* Owners Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <FaUser className="text-blue-500" /> Select Owner
        </h2>
        <div className="min-h-40">
          {ownerError ? (
            <div className="text-center p-4 bg-red-50 border-l-4 border-red-400 text-red-600 rounded-lg">
              {ownerError}
            </div>
          ) : owners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {owners.map(owner => (
                <div
                  key={owner.Owner_id}
                  onClick={() => {
                    setSelectedOwner(owner);
                    getPetsByOwner(owner.Owner_id);
                  }}
                  className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    selectedOwner?.Owner_id === owner.Owner_id 
                      ? 'bg-teal-50 border-teal-300 shadow-sm' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <FaUser className="text-gray-500" /> {owner.Owner_name}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{owner.E_mail}</p>
                  <p className="text-sm text-gray-600">{owner.Phone_number || 'No phone number'}</p>
                  <p className="text-xs text-gray-400 mt-2">ID: {owner.Owner_id}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500 mb-3"></div>
                  <p>Searching for owners...</p>
                </div>
              ) : (
                <p>Search for owners to display results</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Pets Section */}
      {selectedOwner && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <FaPaw className="text-blue-500" /> Select Pet for {selectedOwner.Owner_name}
          </h2>
          <div className="min-h-40">
            {petError ? (
              <div className="text-center p-4 bg-red-50 border-l-4 border-red-400 text-red-600 rounded-lg">
                {petError}
              </div>
            ) : pets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pets.map(pet => (
                  <div
                    key={pet.Pet_id}
                    onClick={() => {
                      setSelectedPet(pet);
                      getPetRecords(pet.Pet_id);
                    }}
                    className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      selectedPet?.Pet_id === pet.Pet_id
                        ? 'bg-teal-50 border-teal-300 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <FaPaw className="text-gray-500" /> {pet.Pet_name}
                    </p>
                    <div className="flex gap-3 mt-2 text-sm">
                      <span className="bg-gray-100 px-2 py-1 rounded capitalize">{pet.Pet_type}</span>
                      {pet.Breed && <span className="bg-gray-100 px-2 py-1 rounded">{pet.Breed}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">ID: {pet.Pet_id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500 mb-3"></div>
                    <p>Loading pets...</p>
                  </div>
                ) : (
                  <p>No pets registered for this owner</p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Records Section */}
      {selectedPet && (
        <section className="mb-8 bg-gray-50 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaNotesMedical className="text-blue-500" /> 
              Medical Records for {selectedPet.Pet_name}
            </h2>
            {records.length > 0 && (
              <button
                onClick={generatePDF}
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
              >
                <FaFilePdf size={16} /> Generate PDF
              </button>
            )}
          </div>
          
          <div className="min-h-40">
            {recordsError ? (
              <div className="text-center p-4 bg-red-50 border-l-4 border-red-400 text-red-600 rounded-lg">
                {recordsError}
              </div>
            ) : records.length > 0 ? (
              <div className="space-y-4">
                {records.map((record, index) => (
                  <div 
                    key={record.id} 
                    className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-800 flex items-center gap-2">
                        <GiMedicines className="text-gray-500" />
                        Record #{index + 1}
                      </h3>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {record.surgery && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-800 mb-1">Surgery</h4>
                          <p className="text-sm text-gray-700">{record.surgery}</p>
                        </div>
                      )}
                      
                      {(record.hasVaccination) && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-green-800 mb-1">Vaccination</h4>
                          <div className="text-sm text-gray-700 whitespace-pre-line">
                            {record.formattedVaccination}
                          </div>
                          {record.vaccination_notes && (
                            <div className="mt-2 text-xs text-gray-500">
                              <span className="font-medium">Notes:</span> {record.vaccination_notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {record.other && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-800 mb-1">Additional Notes</h4>
                        <p className="text-sm text-gray-700">{record.other}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500 mb-3"></div>
                    <p>Loading records...</p>
                  </div>
                ) : (
                  <p>No medical records found for this pet</p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Processing Your Request</h3>
            <p className="text-gray-600">Please wait while we fetch the data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetRecordPDF;