import React, { useState, useEffect, lazy } from 'react';
import{message} from 'antd';
import axios from 'axios';

//import { on } from 'events';

const DewormRecords = lazy(() => import('./DewormRecords'));

const DewormEdit = ({ id, onCancel }) => {
    const [record, setRecord] = useState({
        date: '',
        weight: '',
        wormer: '',
        Pet_name: '',
        Owner_name: ''
    });
    const [loading, setLoading] = useState(true);
    // State to hold validation errors
    const [errors, setErrors] = useState({});

    useEffect(() => {
        axios.get(`http://localhost:3001/api/deworm-records/${id}`)
            .then(response => {
                const fetchedRecord = response.data;
                setRecord(fetchedRecord);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch deworming record", err);
                setErrors({ general: 'Failed to load record data.' });
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Update the record state
        setRecord(prev => ({ ...prev, [name]: value }));

        // Clear the error for the field being edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // --- VALIDATION LOGIC ---
    const validateForm = () => {
        const newErrors = {};
        const today = new Date().toISOString().split('T')[0];

        // Date validation
        if (!record.date) {
            newErrors.date = 'Date is required.';
        } else if (record.date > today) {
            newErrors.date = 'Future dates are not allowed.';
        }

        // Weight validation
        if (!record.weight) {
            newErrors.weight = 'Weight is required.';
        } else if (isNaN(record.weight) || record.weight <= 0) {
            newErrors.weight = 'Weight must be a positive number.';
        }

        // Wormer validation
        if (!record.wormer?.trim()) {
            newErrors.wormer = 'Wormer/Brand is required.';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate the form first
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return; // Stop submission if there are errors
        }

        const { date, weight, wormer } = record;
        
        axios.put(`http://localhost:3001/api/deworm-records/${id}`, { date, weight, wormer })
            .then(() => {
               // onSuccess();
                message.success('Deworming record updated successfully!');
                onCancel(); // Call the onCancel prop to close the editor
                
            })
            .catch(err => {
                console.error("Failed to update record", err);
                message.error('Failed to update record. Please check the fields and try again.');
                setErrors({ general: 'Failed to update record. Please check the fields and try again.' });
                onCancel(); // Call the onCancel prop to close the editor
                
            });
    };

    if (loading) return <div className="p-6 text-center">Loading editor...</div>;

    return (
        <div className="p-6 max-w-lg mx-auto bg-white">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Deworming Record</h2>
            <div className="mb-4 p-4 bg-gray-100 rounded-md">
                <p><strong>Owner:</strong> {record.Owner_name}</p>
                <p><strong>Pet:</strong> {record.Pet_name}</p>
            </div>
            
            <form onSubmit={handleSubmit}>
                {errors.general && <p className="text-red-500 mb-4">{errors.general}</p>}
                
                <div className="mb-4">
                    <label htmlFor="date" className="block text-gray-700 font-bold mb-2">Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={record.date}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 ${errors.date ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
                
                <div className="mb-4">
                    <label htmlFor="weight" className="block text-gray-700 font-bold mb-2">Weight (kg)</label>
                    <input
                        type="number"
                        step="1"
                        id="weight"
                        name="weight"
                        value={record.weight}
                        onChange={handleChange}
                        onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 ${errors.weight ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                </div>
                
                <div className="mb-4">
                    <label htmlFor="wormer" className="block text-gray-700 font-bold mb-2">Wormer</label>
                    <input
                        type="text"
                        id="wormer"
                        name="wormer"
                        value={record.wormer}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 ${errors.wormer ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.wormer && <p className="text-red-500 text-xs mt-1">{errors.wormer}</p>}
                </div>
                
                <div className="flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DewormEdit;