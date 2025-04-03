import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../Components/ui/PetServiceForm.css';

const EditRecords = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState({
    owner_name: '',
    pet_name: '',
    date: '',
    surgery: '',
    vaccination: '',
    other: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation functions
  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`http://localhost:3001/record/${id}`);
        if (!response.ok) throw new Error('Failed to fetch record');
        const data = await response.json();
        setRecord({
          owner_name: data.owner_name || '',
          pet_name: data.pet_name || '',
          date: data.date || '',
          surgery: data.surgery || '',
          vaccination: data.vaccination || '',
          other: data.other || ''
        });
      } catch (error) {
        console.error('Error fetching record:', error);
        alert('Failed to load record');
        navigate('/records');
      }
    };
    fetchRecord();
  }, [id, navigate]);

  const validateForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const newErrors = {};

    // Owner name validation
    if (!record.owner_name.trim()) {
      newErrors.owner_name = 'Owner name is required';
    } else if (!validateName(record.owner_name)) {
      newErrors.owner_name = 'Owner name must contain only English letters';
    }

    // Pet name validation
    if (!record.pet_name.trim()) {
      newErrors.pet_name = 'Pet name is required';
    } else if (!validateName(record.pet_name)) {
      newErrors.pet_name = 'Pet name must contain only English letters';
    }

    // Date validation
    if (!record.date) {
      newErrors.date = 'Date is required';
    } else if (record.date > today) {
      newErrors.date = 'Date cannot be in the future';
    }

    // Service details validation
    if (!record.surgery && !record.vaccination && !record.other) {
      newErrors.services = 'At least one service must be provided';
    } else {
      if (record.surgery && !record.surgery.trim()) {
        newErrors.surgery = 'Surgery details cannot be empty';
      }
      if (record.vaccination && !record.vaccination.trim()) {
        newErrors.vaccination = 'Vaccination details cannot be empty';
      }
      if (record.other && !record.other.trim()) {
        newErrors.other = 'Other service details cannot be empty';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/record/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_name: record.owner_name,
          pet_name: record.pet_name,
          date: record.date,
          surgery: record.surgery,
          vaccination: record.vaccination,
          other: record.other
        })
      });

      if (!response.ok) throw new Error('Failed to update record');
      navigate('/records');
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/records');
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Edit Pet Service Record</h2>
      <form onSubmit={handleSubmit} className="pet-service-form">
        <div className="form-group">
          <label>
            Owner Name:
            <input
              type="text"
              name="owner_name"
              value={record.owner_name}
              onChange={(e) => setRecord({...record, owner_name: e.target.value})}
              className="form-input"
              placeholder="e.g. John Doe"
            />
          </label>
          {errors.owner_name && <p className="error-message">{errors.owner_name}</p>}
        </div>

        <div className="form-group">
          <label>
            Pet Name:
            <input
              type="text"
              name="pet_name"
              value={record.pet_name}
              onChange={(e) => setRecord({...record, pet_name: e.target.value})}
              className="form-input"
              placeholder="e.g. Bella"
            />
          </label>
          {errors.pet_name && <p className="error-message">{errors.pet_name}</p>}
        </div>

        <div className="form-group">
          <label>
            Date:
            <input
              type="date"
              name="date"
              value={record.date}
              onChange={(e) => setRecord({...record, date: e.target.value})}
              className="form-input"
            />
          </label>
          {errors.date && <p className="error-message">{errors.date}</p>}
        </div>

        <div className="form-group">
          <label>Surgery Details:</label>
          <input
            type="text"
            name="surgery"
            value={record.surgery}
            onChange={(e) => setRecord({...record, surgery: e.target.value})}
            className="form-input"
            placeholder="Enter surgery details"
          />
          {errors.surgery && <p className="error-message">{errors.surgery}</p>}
        </div>

        <div className="form-group">
          <label>Vaccination Details:</label>
          <input
            type="text"
            name="vaccination"
            value={record.vaccination}
            onChange={(e) => setRecord({...record, vaccination: e.target.value})}
            className="form-input"
            placeholder="Enter vaccination details"
          />
          {errors.vaccination && <p className="error-message">{errors.vaccination}</p>}
        </div>

        <div className="form-group">
          <label>Other Services:</label>
          <input
            type="text"
            name="other"
            value={record.other}
            onChange={(e) => setRecord({...record, other: e.target.value})}
            className="form-input"
            placeholder="Enter other service details"
          />
          {errors.other && <p className="error-message">{errors.other}</p>}
        </div>

        {errors.services && <p className="error-message">{errors.services}</p>}

        <div className="button-group">
          <button 
            type="submit" 
            className="button"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Record'}
          </button>
          <button 
            type="button" 
            onClick={handleCancel}
            className="button-2"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRecords;