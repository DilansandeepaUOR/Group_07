import React, { useState } from 'react';
import '../Components/ui/PetServiceForm.css';

const PetServiceForm = () => {
    const [ownerName, setOwnerName] = useState('');
    const [petName, setPetName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [services, setServices] = useState([]);
    const [serviceDetails, setServiceDetails] = useState({});
    const [errors, setErrors] = useState({});

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
                            placeholder="e.g. John Doe"
                        />
                    </label>
                    {errors.ownerName && <p className="error-message">{errors.ownerName}</p>}
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
                            placeholder="e.g. Bella"
                        />
                    </label>
                    {errors.petName && <p className="error-message">{errors.petName}</p>}
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
                    {errors.date && <p className="error-message">{errors.date}</p>}
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
                    {errors.services && <p className="error-message">{errors.services}</p>}
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
                        {errors[service] && <p className="error-message">{errors[service]}</p>}
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