import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Save, Plus, X } from 'lucide-react';
import { message, Switch } from 'antd';
import ConfirmDialog from '../../Components/ui/ConfirmDialog';
import {convertTimeFormat} from "../../Components/Appointment/utils";

const API_URL = 'http://localhost:3001/api/appointments/managetime';

const ServiceTimeManagement = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTime, setFormTime] = useState('');
  const [formStatus, setFormStatus] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, slotId: null });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setSlots(res.data || []);
    } catch {
      message.error('Failed to fetch time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowAddForm(true);
    setEditingId(null);
    setFormTime('');
    setFormStatus(true);
  };

  const handleEdit = (slot) => {
    setEditingId(slot.id);
    setShowAddForm(false);
    setFormTime(slot.time_slot);
    setFormStatus(slot.enabled === 1);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormTime('');
    setFormStatus(true);
  };

  const handleSave = async () => {
    if (!formTime.trim()) {
      message.error('Time is required');
      return;
    }
    try {
      const data = { time_slot: formTime, enabled: formStatus ? 1 : 0 };
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, data);
        message.success('Time slot updated');
      } else {
        await axios.post(API_URL, data);
        message.success('Time slot added');
      }
      handleCancel();
      fetchSlots();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save time slot');
    }
  };

  const handleDelete = (slotId) => setDeleteDialog({ open: true, slotId });

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteDialog.slotId}`);
      message.success('Time slot deleted');
      setDeleteDialog({ open: false, slotId: null });
      fetchSlots();
    } catch {
      message.error('Failed to delete time slot');
    }
  };

  const handleToggle = async (slot) => {
    try {
      await axios.put(`${API_URL}/${slot.id}`, { ...slot, enabled: slot.enabled ? 0 : 1 });
      fetchSlots();
    } catch {
      message.error('Failed to update slot status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-[#028478]">Service Time Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#028478] text-white px-4 py-2 rounded-md hover:bg-[#046a5b] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Time Slot
        </button>
      </div>

      {(showAddForm || editingId) && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#028478] mb-4">
            {editingId ? 'Edit Time Slot' : 'Add New Time Slot'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time (HH:MM, 24h) *</label>
              <input
                type="time"
                value={formTime}
                onChange={e => setFormTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028478]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enabled</label>
              <Switch checked={formStatus} onChange={setFormStatus} />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-[#028478] text-white rounded-md hover:bg-[#046a5b] transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update Slot' : 'Add Slot'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {slots.length > 0 ? slots.map(slot => (
                <tr key={slot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{slot.id}</td>
                  <td className="px-6 py-4">{convertTimeFormat(slot.time_slot)}</td>
                  <td className="px-6 py-4">
                    <Switch checked={!!slot.enabled} onChange={() => handleToggle(slot)} />
                    <span className={`ml-2 text-xs font-semibold ${slot.enabled ? 'text-green-600' : 'text-red-500'}`}>
                      {slot.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(slot)}
                        className="text-[#028478] hover:text-[#046a5b] transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No time slots found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Time Slot"
        description="Are you sure you want to delete this time slot? This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, slotId: null })}
        type="delete"
      />
    </div>
  );
};

export default ServiceTimeManagement;