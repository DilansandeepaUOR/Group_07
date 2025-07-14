import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Save, X, Check } from 'lucide-react';
import { message } from 'antd';
import ConfirmDialog from '../../Components/ui/ConfirmDialog';
import RefreshButton from '../../Components/ui/RefreshButton';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, serviceId: null });
  
  // Form states
  const [formData, setFormData] = useState({
    reason_name: '',
    ServiceType: {
      mobile: false,
      clinic: false
    }
  });

  const API_URL = 'http://localhost:3001/api/appointment/services';

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle success/error messages
  useEffect(() => {
    if (error) {
      message.error(error);
      setError(null);
    }
  }, [error]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setServices(response.data || []);
    } catch (err) {
      setError('Failed to fetch services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setShowAddForm(true);
    setEditingId(null);
    setFormData({
      reason_name: '',
      ServiceType: {
        mobile: false,
        clinic: false
      }
    });
  };

  const handleEditService = (service) => {
    setEditingId(service.id);
    setShowAddForm(false);
    setFormData({
      reason_name: service.reason_name,
      ServiceType: {
        mobile: service.ServiceType?.includes('mobile') || false,
        clinic: service.ServiceType?.includes('clinic') || false
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      reason_name: '',
      ServiceType: {
        mobile: false,
        clinic: false
      }
    });
  };

  const handleSaveService = async () => {
    if (!formData.reason_name.trim()) {
      message.error('Service name is required');
      return;
    }

    if (!formData.ServiceType.mobile && !formData.ServiceType.clinic) {
      message.error('Please select at least one service type');
      return;
    }

    try {
      let serviceTypeValue = '';
      if (formData.ServiceType.mobile && formData.ServiceType.clinic) {
        serviceTypeValue = 'All';
      } else if (formData.ServiceType.mobile) {
        serviceTypeValue = 'mobile';
      } else if (formData.ServiceType.clinic) {
        serviceTypeValue = 'clinic';
      }

      const serviceData = {
        reason_name: formData.reason_name.trim(),
        ServiceType: serviceTypeValue
      };

      if (editingId) {
        // Update existing service
        await axios.put(`${API_URL}/${editingId}`, serviceData);
        message.success('Service updated successfully');
      } else {
        // Add new service
        await axios.post(API_URL, serviceData);
        message.success('Service added successfully');
      }

      handleCancelEdit();
      fetchServices();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save service';
      message.error(errorMsg);
    }
  };

  const handleDeleteService = (serviceId) => {
    setDeleteDialog({ open: true, serviceId });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteDialog.serviceId}`);
      message.success('Service deleted successfully');
      setDeleteDialog({ open: false, serviceId: null });
      fetchServices();
    } catch (err) {
      message.error('Failed to delete service');
    }
  };

  const handleCheckboxChange = (type) => {
    setFormData(prev => ({
      ...prev,
      ServiceType: {
        ...prev.ServiceType,
        [type]: !prev.ServiceType[type]
      }
    }));
  };

  const getServiceTypeDisplay = (serviceType) => {
    if (!serviceType) return 'None';
    const types = serviceType.split(',').map(t => t.trim());
    return types.map(type => 
      type === 'mobile' ? 'Mobile Service' : 
      type === 'clinic' ? 'Clinic Appointment' : type
    ).join(', ');
  };

  const getServiceTypeBadge = (serviceType) => {
    if (!serviceType) return null;
    if (serviceType === 'All') {
      return (
        <>
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full mr-1 bg-green-100 text-green-800">
            Clinic
          </span>
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full mr-1 bg-blue-100 text-blue-800">
            Mobile
          </span>
        </>
      );
    }
    if (serviceType === 'clinic' || serviceType === 'Clinic') {
      return (
        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full mr-1 bg-green-100 text-green-800">
          Clinic
        </span>
      );
    }
    if (serviceType === 'mobile' || serviceType === 'Mobile') {
      return (
        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full mr-1 bg-blue-100 text-blue-800">
          Mobile
        </span>
      );
    }
    // fallback for any other value
    return (
      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full mr-1 bg-gray-100 text-gray-800">
        {serviceType}
      </span>
    );
  };

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.reason_name.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'Mobile') {
      return matchesSearch && (service.ServiceType === 'Mobile' || service.ServiceType === 'All');
    }
    if (filterType === 'Clinic') {
      return matchesSearch && (service.ServiceType === 'Clinic' || service.ServiceType === 'All');
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028478]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-[#028478]">Service Management</h1>
        <button
          onClick={handleAddService}
          className="flex items-center gap-2 bg-[#028478] text-white px-4 py-2 rounded-md hover:bg-[#046a5b] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Service
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028478]"
        />
        <div className="flex items-center gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028478]"
          >
            <option value="all">All Services</option>
            <option value="Mobile">Mobile Services</option>
            <option value="Clinic">Clinic Appointments</option>
          </select>
          <RefreshButton onClick={fetchServices} />
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#028478] mb-4">
            {editingId ? 'Edit Service' : 'Add New Service'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.reason_name}
                onChange={(e) => setFormData(prev => ({ ...prev, reason_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028478]"
                placeholder="Enter service name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.ServiceType.mobile}
                    onChange={() => handleCheckboxChange('mobile')}
                    className="rounded border-gray-300 text-[#028478] focus:ring-[#028478]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mobile Service</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.ServiceType.clinic}
                    onChange={() => handleCheckboxChange('clinic')}
                    className="rounded border-gray-300 text-[#028478] focus:ring-[#028478]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Clinic Appointment</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveService}
                className="flex items-center gap-2 px-4 py-2 bg-[#028478] text-white rounded-md hover:bg-[#046a5b] transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update Service' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{service.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.reason_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {getServiceTypeBadge(service.ServiceType)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-[#028478] hover:text-[#046a5b] transition-colors"
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || filterType !== 'all' 
                      ? 'No services found matching your criteria' 
                      : 'No services available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600 text-center">
        Showing {filteredServices.length} of {services.length} services
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, serviceId: null })}
        type="delete"
      />
    </div>
  );
};

export default ServiceManagement; 