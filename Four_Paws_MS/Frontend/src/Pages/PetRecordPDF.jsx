import { useState } from 'react';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import { FaSearch, FaFilePdf, FaUser, FaPaw, FaNotesMedical } from 'react-icons/fa';
import { GiMedicines } from 'react-icons/gi';
import logo from '../assets/logo.png';
import autoTable from 'jspdf-autotable';


const PetRecordPDF = () => {
  // State for search, selections, data, and errors
  const [searchTerm, setSearchTerm] = useState('');
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]); // New state for selected record IDs
  const [loading, setLoading] = useState(false);
  const [ownerError, setOwnerError] = useState(null);
  const [petError, setPetError] = useState(null);
  const [recordsError, setRecordsError] = useState(null);

  /**
   * Resets the entire state of the component.
   */
  const resetState = () => {
    setOwners([]);
    setSelectedOwner(null);
    setPets([]);
    setSelectedPet(null);
    setRecords([]);
    setSelectedRecords([]);
    setOwnerError(null);
    setPetError(null);
    setRecordsError(null);
  };

  /**
   * Searches for owners based on the search term.
   */
  const searchOwners = async () => {
    if (!searchTerm.trim()) return;
    
    resetState();
    
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
      setOwnerError(error.response?.data?.error || 'Failed to search owners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches pets for a selected owner.
   * @param {string} ownerId - The ID of the owner.
   */
  const getPetsByOwner = async (ownerId) => {
    setPets([]);
    setSelectedPet(null);
    setRecords([]);
    setSelectedRecords([]);
    setPetError(null);
    setRecordsError(null);
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/get-pets', { ownerId });
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

  /**
   * Fetches medical records for a selected pet.
   * @param {string} petId - The ID of the pet.
   */
  const getPetRecords = async (petId) => {
    setRecords([]);
    setSelectedRecords([]); // Reset selection when fetching new records
    setRecordsError(null);
    
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/get-records-with-vaccination', {
        params: { petId }
      });
      
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

  /**
   * Toggles the selection of a single record.
   * @param {string} recordId - The ID of the record to select/deselect.
   */
  const handleRecordSelection = (recordId) => {
    setSelectedRecords(prevSelected =>
      prevSelected.includes(recordId)
        ? prevSelected.filter(id => id !== recordId)
        : [...prevSelected, recordId]
    );
  };

  /**
   * Toggles the selection of all records.
   * @param {object} e - The event object from the checkbox.
   */
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allRecordIds = records.map(record => record.id);
      setSelectedRecords(allRecordIds);
    } else {
      setSelectedRecords([]);
    }
  };

  /**
   * Generates a PDF document from the selected records.
   */
const generatePDF = () => {
  const recordsToPrint = records.filter(record => selectedRecords.includes(record.id));

  if (!selectedOwner || !selectedPet || recordsToPrint.length === 0) {
    alert('Please select at least one record to generate the PDF.');
    return;
  }

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let cursorY = 45; // Start after header

    // --- Color and Font Definitions ---
    const primaryColor = '#028478';
    const secondaryColor = '#4A4A4A';
    const lightGrayColor = '#F3F4F6';
    const headerColor = '#2D3748';
    const whiteColor = '#FFFFFF';
    
    doc.setFont('helvetica');

    // === HEADER ===
    doc.setFillColor(whiteColor);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.addImage(logo, 'PNG', margin, 3, 45, 25);
    doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(primaryColor);
    doc.text('Four Paws Animal Clinic', margin + 50, 15);
    doc.setFont('helvetica', 'normal').setFontSize(9);
    doc.text('No. 03 New Town, Ratnapura | +94 760 999 899 | 4pawsbusiness4@gmail.com', margin + 50, 22);

    // ... (The rest of your document generation code remains the same) ...
    // Main Document Title, Patient Information, Medical Records, etc.
    doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor(headerColor);
    doc.text('Pet Medical Record', margin, cursorY);
    cursorY += 15;

    doc.setDrawColor(lightGrayColor).setLineWidth(0.5);
    doc.line(margin, cursorY - 7, pageWidth - margin, cursorY - 7);
    
    doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(primaryColor);
    doc.text('Pet Details', margin, cursorY);
    
    const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(secondaryColor);
    doc.text(`Report Date: ${reportDate}`, pageWidth - margin, cursorY, { align: 'right' });
    cursorY += 8;

    autoTable(doc, {
      startY: cursorY,
      body: [
        [
          { content: 'Pet Name:', styles: { fontStyle: 'bold' } },
          selectedPet.Pet_name,
          { content: 'Species:', styles: { fontStyle: 'bold' } },
          selectedPet.Pet_type,
        ],
        [
          { content: 'Breed:', styles: { fontStyle: 'bold' } },
          selectedPet.Pet_Breed || 'N/A',
          { content: 'Gender:', styles: { fontStyle: 'bold' } },
          selectedPet.Pet_gender || 'N/A',
        ],
        [
          { content: 'Owner:', styles: { fontStyle: 'bold' } },
          selectedOwner.Owner_name,
          { content: 'Owner Email:', styles: { fontStyle: 'bold' } },
          selectedOwner.E_mail,
        ],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 1.5 },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 65 }, 2: { cellWidth: 25 } }
    });
    cursorY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(headerColor);
    doc.text('Visit History', margin, cursorY);
    cursorY += 10;

    const checkAndAddPage = (neededSpace = 20) => {
      if (cursorY + neededSpace > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
        doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(headerColor);
        doc.text('Visit History (continued)', margin, cursorY);
        cursorY += 15;
      }
    };

    recordsToPrint.forEach(record => {
      const formattedDate = new Date(record.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const contentLines = [
        record.formattedVaccination,
        record.surgery,
        record.other
      ].filter(Boolean).map(content => doc.splitTextToSize(content, pageWidth - margin * 3 - 5).length);
      
      const estimatedHeight = 30 + (contentLines.reduce((sum, len) => sum + len, 0) * 5);
      
      checkAndAddPage(estimatedHeight);

      const cardStartY = cursorY;
      
      doc.setFillColor(lightGrayColor);
      doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 10, 3, 3, 'F');
      doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(headerColor);
      doc.text(formattedDate, margin + 5, cursorY + 7);
      cursorY += 15;

      const addRecordSection = (title, content) => {
        if (!content) return;
        
        const lines = doc.splitTextToSize(content, pageWidth - margin * 3 - 5);
        const sectionHeight = 8 + (lines.length * 5);
        
        checkAndAddPage(sectionHeight);
        
        doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(primaryColor);
        doc.text(title, margin + 5, cursorY);
        
        doc.setFont('helvetica', 'normal').setTextColor(secondaryColor);
        doc.text(lines, margin + 10, cursorY + 6);
        
        cursorY += sectionHeight;
      };
      
      addRecordSection('Vaccination:', record.formattedVaccination);
      addRecordSection('Surgery:', record.surgery);
      addRecordSection('Additional Notes:', record.other);

      doc.setDrawColor('#E2E8F0');
      doc.roundedRect(margin, cardStartY, pageWidth - margin * 2, cursorY - cardStartY + 5, 3, 3, 'S');
      cursorY += 10;
    });


    // === FOOTER ===
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // --- START: WATERMARK ---
      // This will add the logo to the center of the page with low opacity.
      const watermarkWidth = 100; // Adjust the size of the watermark as needed
      const watermarkHeight = 70; // Adjust the size of the watermark as needed
      const watermarkX = (pageWidth - watermarkWidth) / 2;
      const watermarkY = (pageHeight - watermarkHeight) / 2;

      // Set the opacity for the watermark
      doc.setGState(new doc.GState({opacity: 0.1})); 
      
      doc.addImage(logo, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
      
      // IMPORTANT: Reset the opacity to 1 so other elements are not transparent
      doc.setGState(new doc.GState({opacity: 1}));
      // --- END: WATERMARK ---


      // --- START: SIGNATURE AND NOTES SECTION ---
      let startY = pageHeight - 80;
      doc.setFontSize(10).setTextColor('#000000');
      doc.text("Special Notes:", margin, startY);
      doc.text("................................................................................", margin, startY += 10);
      doc.text("................................................................................", margin, startY += 5);
      doc.text("................................................................................", margin, startY += 5);
      doc.text("................................................................................", margin, startY += 5);

      let signatureY = pageHeight - 35;
      doc.text("..................................................", margin, signatureY);
      doc.setFontSize(9).setTextColor('#000000');
      doc.text("Veterinarian's Signature", margin, signatureY + 5);
      // --- END: SIGNATURE AND NOTES SECTION ---

      // Footer Content (at the very bottom)
      doc.setFontSize(9).setTextColor('#718096');
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    const sanitizeName = (name) => name.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    const fileName = `Medical_Record_${sanitizeName(selectedOwner.Owner_name)}_${sanitizeName(selectedPet.Pet_name)}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('PDF generation error:', error);
    alert(`Failed to generate PDF. Error: ${error.message}`);
  }
};



  return (
    <div className="p-6 max-w-5xl mx-auto">
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
                  <p className="font-medium text-gray-800 flex items-center gap-2"><FaUser className="text-gray-500" /> {owner.Owner_name}</p>
                  <p className="text-sm text-gray-600 mt-2">{owner.E_mail}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
              {loading ? <p>Searching...</p> : <p>Search for owners to display results</p>}
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
              <div className="text-center p-4 bg-red-50 border-l-4 border-red-400 text-red-600 rounded-lg">{petError}</div>
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
                      selectedPet?.Pet_id === pet.Pet_id ? 'bg-teal-50 border-teal-300 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-800 flex items-center gap-2"><FaPaw className="text-gray-500" /> {pet.Pet_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                {loading ? <p>Loading pets...</p> : <p>No pets registered for this owner</p>}
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
              <FaNotesMedical className="text-blue-500" /> Medical Records for {selectedPet.Pet_name}
            </h2>
            {records.length > 0 && (
              <button
                onClick={generatePDF}
                disabled={selectedRecords.length === 0 || loading}
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFilePdf size={16} /> Generate PDF for Selected ({selectedRecords.length})
              </button>
            )}
          </div>
          
          <div>
            {recordsError ? (
              <div className="text-center p-4 bg-red-50 border-l-4 border-red-400 text-red-600 rounded-lg">{recordsError}</div>
            ) : records.length > 0 ? (
              <>
                <div className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
                  <input
                    type="checkbox"
                    id="selectAll"
                    onChange={handleSelectAll}
                    checked={records.length > 0 && selectedRecords.length === records.length}
                    className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="selectAll" className="ml-3 font-medium text-gray-700">Select All Records</label>
                </div>
                <div className="space-y-4">
                  {records.map((record, index) => (
                    <div 
                      key={record.id} 
                      className={`p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all ${selectedRecords.includes(record.id) ? 'border-teal-300' : 'border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`record-${record.id}`}
                            checked={selectedRecords.includes(record.id)}
                            onChange={() => handleRecordSelection(record.id)}
                            className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <label htmlFor={`record-${record.id}`} className="ml-3 font-medium text-gray-800 flex items-center gap-2">
                            <GiMedicines className="text-gray-500" /> Record #{index + 1}
                          </label>
                        </div>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                      <div className="pl-8">
                        {record.surgery && <div className="bg-blue-50 p-3 rounded-lg mb-2"><h4 className="text-sm font-medium text-blue-800 mb-1">Surgery</h4><p className="text-sm text-gray-700">{record.surgery}</p></div>}
                        {record.hasVaccination && <div className="bg-green-50 p-3 rounded-lg mb-2"><h4 className="text-sm font-medium text-green-800 mb-1">Vaccination</h4><div className="text-sm text-gray-700 whitespace-pre-line">{record.formattedVaccination}</div></div>}
                        {record.other && <div className="bg-gray-100 p-3 rounded-lg"><h4 className="text-sm font-medium text-gray-800 mb-1">Additional Notes</h4><p className="text-sm text-gray-700">{record.other}</p></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center p-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                {loading ? <p>Loading records...</p> : <p>No medical records found for this pet</p>}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default PetRecordPDF;