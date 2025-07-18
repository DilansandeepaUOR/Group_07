import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';
import { FaTimes, FaSearch, FaFilePdf, FaArrowLeft } from 'react-icons/fa';

const SearchRecords = () => {
  const [ownerName, setOwnerName] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOwnerSelection, setShowOwnerSelection] = useState(false);
  const [showPetSelection, setShowPetSelection] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedPet] = useState('');
  const [groupedData, setGroupedData] = useState({});
  const navigate = useNavigate();

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:3001/record/search?owner=${encodeURIComponent(ownerName)}`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(`Search failed: ${error.message}`);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const groupRecordsByOwnerAndPet = () => {
    const grouped = {};
    results.forEach(record => {
      if (!grouped[record.owner_name]) grouped[record.owner_name] = {};
      if (!grouped[record.owner_name][record.pet_name]) {
        grouped[record.owner_name][record.pet_name] = [];
      }
      grouped[record.owner_name][record.pet_name].push(record);
    });
    return grouped;
  };

  const handleGeneratePDF = () => {
    const grouped = groupRecordsByOwnerAndPet();
    setGroupedData(grouped);
    const owners = Object.keys(grouped);
    
    if (owners.length === 1) {
      const pets = Object.keys(grouped[owners[0]]);
      if (pets.length === 1) {
        generatePDF(owners[0], pets[0]);
      } else {
        setSelectedOwner(owners[0]);
        setShowPetSelection(true);
      }
    } else {
      setShowOwnerSelection(true);
    }
  };

  const generatePDF = (owner, pet) => {
    const records = groupedData[owner]?.[pet];
    if (!records?.length) {
      alert('No records found for selected pet');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add logo
      doc.addImage(logo, 'PNG', pageWidth - 40, 10, 30, 15);

      // Title and info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Pet Service Record', 14, 20);
      doc.setFontSize(12);
      doc.text(`Owner: ${owner}`, 14, 30);
      doc.text(`Pet: ${pet}`, 14, 40);

      // Table data
      autoTable(doc, {
        startY: 50,
        head: [['Date', 'Surgery', 'Vaccination', 'Other']],
        body: records.map(record => [
          record.date ? new Date(record.date).toLocaleDateString() : 'N/A',
          record.surgery || '-',
          record.vaccination || '-',
          record.other || '-'
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        }
      });

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('Generated by Four Paws Animal Clinic', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

      doc.save(`Pet_Record_${owner.replace(/[^a-z0-9]/gi, '_')}_${pet.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (error) {
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setShowPetSelection(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-b from-[#E3FDFD] via-[#71C9CE] to-[#A6E3E9] z-50 p-4 overflow-y-auto">
      <div className="absolute top-5 left-5 object-cover w-[200px]">
        <img src={logo} alt="logo" />
      </div>
      
      <div className="bg-gradient-to-b from-[#182020] to-[#394a46] p-8 rounded-lg shadow-2xl w-full max-w-7xl relative border-2 border-gray-800">
        {/* Close Button */}
        <button
          onClick={() => navigate('/records')}
          className="absolute top-3 right-3 text-white hover:text-gray-200 text-lg cursor-pointer"
        >
          <FaTimes size={22} />
        </button>
    
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white mb-6 Poppins">
          Search Records
        </h2>
        
        {/* Search Bar */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <div className="relative flex-1 min-w-[300px]">
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Enter owner name..."
              className="w-full p-3 border border-[#46dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028478] text-white bg-[#394a46]/50"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <button 
            onClick={handleSearch} 
            disabled={isLoading}
            className={`px-6 py-3 bg-gradient-to-r from-[#46dfd0] to-[#028478] text-white rounded-lg hover:from-[#028478] hover:to-[#46dfd0] transition-all font-medium flex items-center gap-2 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <FaSearch /> {isLoading ? 'Searching...' : 'Search'}
          </button>
          
          <button 
            onClick={handleGeneratePDF} 
            disabled={results.length === 0}
            className={`px-6 py-3 bg-gradient-to-r from-[#028478] to-[#5ba29c] text-white rounded-lg hover:from-[#5ba29c] hover:to-[#028478] transition-all font-medium flex items-center gap-2 ${
              results.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaFilePdf /> Generate PDF
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-700 bg-red-200 p-2 rounded text-center flex items-center gap-2 mb-4">
            <FaExclamationCircle /> {error}
          </p>
        )}

        {/* Results */}
        <div className="space-y-4">
          <p className="text-gray-300 text-center">
            {ownerName 
              ? (isLoading ? 'Searching...' : `Found ${results.length} records`) 
              : 'Enter an owner name to search'}
          </p>

          {results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[#394a46]">
                    <th className="p-3 border border-gray-600 text-left text-white">ID</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Owner</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Pet</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Date</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Surgery</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Vaccination</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Other</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((record) => (
                    <tr key={record.id} className="hover:bg-[#394a46]/50 text-gray-200">
                      <td className="p-3 border border-gray-600">{record.id}</td>
                      <td className="p-3 border border-gray-600">{record.owner_name || 'N/A'}</td>
                      <td className="p-3 border border-gray-600">{record.pet_name || 'N/A'}</td>
                      <td className="p-3 border border-gray-600">{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3 border border-gray-600">{record.surgery || 'N/A'}</td>
                      <td className="p-3 border border-gray-600">{record.vaccination || 'N/A'}</td>
                      <td className="p-3 border border-gray-600">{record.other || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Owner Selection Modal */}
        {showOwnerSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-b from-[#182020] to-[#394a46] p-6 rounded-lg shadow-2xl w-full max-w-md relative border-2 border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Select Owner</h3>
              <div className="max-h-60 overflow-y-auto mb-4">
                {Object.keys(groupedData).map(owner => (
                  <div 
                    key={owner} 
                    className={`p-3 mb-2 cursor-pointer rounded text-white hover:bg-[#394a46] ${
                      selectedOwner === owner ? 'bg-[#028478]' : ''
                    }`}
                    onClick={() => {
                      setSelectedOwner(owner);
                      setShowOwnerSelection(false);
                      setShowPetSelection(true);
                    }}
                  >
                    {owner}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowOwnerSelection(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pet Selection Modal */}
        {showPetSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-b from-[#182020] to-[#394a46] p-6 rounded-lg shadow-2xl w-full max-w-md relative border-2 border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Select Pet for {selectedOwner}</h3>
              <div className="max-h-60 overflow-y-auto mb-4">
                {Object.keys(groupedData[selectedOwner] || {}).map(pet => (
                  <div 
                    key={pet} 
                    className={`p-3 mb-2 cursor-pointer rounded text-white hover:bg-[#394a46] ${
                      selectedPet === pet ? 'bg-[#028478]' : ''
                    }`}
                    onClick={() => generatePDF(selectedOwner, pet)}
                  >
                    {pet}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowPetSelection(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchRecords;