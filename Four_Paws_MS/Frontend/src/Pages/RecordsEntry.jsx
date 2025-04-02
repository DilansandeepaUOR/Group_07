import React, { useState } from 'react';
import '../Components/ui/PetServiceForm.css';

const PetServiceForm = () => {
    const [ownerName, setOwnerName] = useState('');
    const [petName, setPetName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [services, setServices] = useState([]);
    const [serviceDetails, setServiceDetails] = useState({});
  
    const handleServiceChange = (service) => {
      setServices((prev) => {
        if (prev.includes(service)) {
          return prev.filter((s) => s !== service);
        } else {
          return [...prev, service];
        }
      });
    };
  
    const handleDetailChange = (service, value) => {
      setServiceDetails((prev) => ({
        ...prev,
        [service]: value,
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const formData = {
        ownerName,
        petName,
        date,
        services,
        serviceDetails,
      };
  
      try {
        const response = await fetch('http://localhost:3001/record/', {  // Add trailing slash
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
        console.log(data.message); // Handle success message
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
    };
  
    return (
      <div className="form-container">
        <h2 className="form-title">Pet Service Form</h2>
        <form onSubmit={handleSubmit} className="pet-service-form">
          <div className="form-group">
            <label>
              Owner Name:
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                className="form-input"
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Pet Name:
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
                className="form-input"
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Date:
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="form-input"
              />
            </label>
          </div>
          <div className="form-group">
            <label>Services:</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={services.includes('Surgery')}
                  onChange={() => handleServiceChange('Surgery')}
                />
                Surgery
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={services.includes('Vaccination')}
                  onChange={() => handleServiceChange('Vaccination')}
                />
                Vaccination
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={services.includes('Other')}
                  onChange={() => handleServiceChange('Other')}
                />
                Other
              </label>
            </div>
          </div>
          {services.map((service) => (
            <div key={service} className="form-group">
              <label>
                {service} Details:
                <input
                  type="text"
                  value={serviceDetails[service] || ''}
                  onChange={(e) => handleDetailChange(service, e.target.value)}
                  className="form-input"
                />
              </label>
            </div>
          ))}
          <div className="button-group">
            <button type="submit" className="button">Save</button>{" "}
            <button type="button" onClick={handleCancel} className="button-2">Cancel</button>
          </div>
        </form>
      </div>
    );
  };
  
  export default PetServiceForm;