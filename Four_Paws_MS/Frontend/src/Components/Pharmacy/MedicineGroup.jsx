"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, Edit, Trash2, X, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react"

export default function MedicineGroupSection() {
  const API_BASE_URL = "http://localhost:3001/pharmacy/api/medicine-groups";
  const MEDICINES_API_URL = "http://localhost:3001/pharmacy/api/medicines";
  
  // State declarations
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showViewGroupModal, setShowViewGroupModal] = useState(false)
  const [showEditGroupModal, setShowEditGroupModal] = useState(false)
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false)
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false)
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false)
  
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")
  const [editGroupName, setEditGroupName] = useState("")
  const [editGroupDescription, setEditGroupDescription] = useState("")
  
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedMedicines, setSelectedMedicines] = useState([])
  
  const [medicineGroups, setMedicineGroups] = useState([])
  const [availableMedicines, setAvailableMedicines] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 5

  // Memoized filtered groups
  const filteredGroups = useMemo(() => {
    return medicineGroups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [medicineGroups, searchTerm])

  // Fetch medicine groups
  useEffect(() => {
    const fetchMedicineGroups = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `${API_BASE_URL}?search=${searchTerm}&page=${currentPage}&limit=${itemsPerPage}`
        )
        
        if (!response.ok) throw new Error('Failed to fetch medicine groups')
        
        const data = await response.json()
        setTotalPages(Math.ceil(data.totalCount / itemsPerPage))
        setMedicineGroups(data.data)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error("Error fetching medicine groups:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMedicineGroups()
  }, [searchTerm, currentPage, itemsPerPage])

  // Fetch available medicines
  const fetchAvailableMedicines = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/${selectedGroup.id}/available-medicines`)
      const data = await response.json()
      setAvailableMedicines(data)
    } catch (err) {
      console.error("Error fetching available medicines:", err)
    }
  }, [selectedGroup])

  const handleAddMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${selectedGroup.id}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineIds: selectedMedicines })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add medicines to group');
      }
  
      // Get the updated group data from the response
      const result = await response.json();
      
      // Update the groups list with the new count
      setMedicineGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === selectedGroup.id 
            ? { 
                ...group, 
                count: group.count + selectedMedicines.length,
                medicines: [...(group.medicines || []), ...(result.addedMedicines || [])]
              } 
            : group
        )
      );
      
      // Also update the selectedGroup if the view modal is open
      if (showViewGroupModal) {
        setSelectedGroup(prev => ({
          ...prev,
          count: prev.count + selectedMedicines.length,
          medicines: [...(prev.medicines || []), ...(result.addedMedicines || [])]
        }));
      }
      
      setShowAddMedicineModal(false);
      setSelectedMedicines([]);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error adding medicines:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, selectedMedicines, showViewGroupModal]);

  // Pagination handlers
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  const goToPage = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }, [totalPages])

  // Group handlers
  const handleCreateGroup = useCallback(async () => {
    if (!newGroupName) {
      setError('Group name is required')
      return
    }
    
    try {
      setLoading(true)
      const newGroup = {
        name: newGroupName,
        description: newGroupDescription,
        medicines: []
      }
  
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create group')
      }
  
      const data = await response.json()
      
      // Refresh the groups list
      const fetchResponse = await fetch(
        `${API_BASE_URL}?search=${searchTerm}&page=${currentPage}&limit=${itemsPerPage}`
      )
      const fetchData = await fetchResponse.json()
      
      setMedicineGroups(fetchData.data || fetchData)
      
      // Reset form
      setNewGroupName("")
      setNewGroupDescription("")
      setShowCreateGroupModal(false)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error("Error creating group:", err)
    } finally {
      setLoading(false)
    }
  }, [newGroupName, newGroupDescription, searchTerm, currentPage])

  const handleEditGroup = useCallback(async () => {
    if (!editGroupName) {
      setError('Group name is required')
      return
    }
    
    try {
      setLoading(true)
      const updatedGroup = {
        ...selectedGroup,
        name: editGroupName,
        description: editGroupDescription
      }

      const response = await fetch(`${API_BASE_URL}/${selectedGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGroup)
      })
      
      if (!response.ok) throw new Error('Failed to update group')
      
      const updatedGroups = medicineGroups.map(group => 
        group.id === selectedGroup.id ? {
          ...updatedGroup,
          count: group.count
        } : group
      )
      
      setMedicineGroups(updatedGroups)
      setShowEditGroupModal(false)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error("Error updating group:", err)
    } finally {
      setLoading(false)
    }
  }, [editGroupName, editGroupDescription, selectedGroup, medicineGroups])

  const handleRemoveItem = useCallback(async (groupId, medicineId) => {
    if (!window.confirm('Are you sure you want to remove this medicine from the group?')) {
      return
    }
    
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/${groupId}/medicines/${medicineId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to remove medicine from group')
      
      // Refresh the group data
      const groupResponse = await fetch(`${API_BASE_URL}/${groupId}`)
      const updatedGroup = await groupResponse.json()
      
      // Update in the groups list
      const updatedGroups = medicineGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...updatedGroup,
            count: updatedGroup.medicines?.length || 0
          }
        }
        return group
      })
      
      setMedicineGroups(updatedGroups)
      setSelectedItems(selectedItems.filter(id => id !== medicineId))
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error("Error removing medicine from group:", err)
    } finally {
      setLoading(false)
    }
  }, [medicineGroups, selectedItems])

  const handleRemoveSelected = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to remove ${selectedItems.length} medicines from this group?`)) {
      return
    }
    
    try {
      setLoading(true)
      const groupId = selectedGroup.id
      
      await Promise.all(selectedItems.map(medicineId => 
        fetch(`${API_BASE_URL}/${groupId}/medicines/${medicineId}`, {
          method: 'DELETE'
        })
      ))
      
      // Refresh the group data
      const groupResponse = await fetch(`${API_BASE_URL}/${groupId}`)
      const updatedGroup = await groupResponse.json()
      
      // Update in the groups list
      const updatedGroups = medicineGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...updatedGroup,
            count: updatedGroup.medicines?.length || 0
          }
        }
        return group
      })
      
      setMedicineGroups(updatedGroups)
      setShowRemoveItemModal(false)
      setSelectedItems([])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error("Error removing selected medicines:", err)
    } finally {
      setLoading(false)
    }
  }, [selectedGroup, selectedItems, medicineGroups])

  const handleDeleteGroup = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/${selectedGroup.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete group')
      
      setMedicineGroups(medicineGroups.filter(group => group.id !== selectedGroup.id))
      setShowDeleteGroupModal(false)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error("Error deleting group:", err)
    } finally {
      setLoading(false)
    }
  }, [selectedGroup, medicineGroups])

  // Toggle functions
  const toggleSelectItem = useCallback((medicineId) => {
    setSelectedMedicines(prev => 
      prev.includes(medicineId)
        ? prev.filter(id => id !== medicineId)
        : [...prev, medicineId]
    )
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedMedicines.length === availableMedicines.length) {
      setSelectedMedicines([])
    } else {
      setSelectedMedicines(availableMedicines.map(m => m.id))
    }
  }, [selectedMedicines, availableMedicines])

  // View/Edit handlers
  const openViewGroup = useCallback(async (group) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/${group.id}`)
      if (!response.ok) throw new Error('Failed to fetch group details')
      
      const fullGroupDetails = await response.json()
      setSelectedGroup({
        ...fullGroupDetails,
        count: fullGroupDetails.medicines?.length || 0
      })
      setShowViewGroupModal(true)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching group details:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const openEditGroup = useCallback((group) => {
    setSelectedGroup(group)
    setEditGroupName(group.name)
    setEditGroupDescription(group.description || '')
    setShowEditGroupModal(true)
  }, [])

  const openRemoveItemModal = useCallback((group) => {
    setSelectedGroup(group)
    setSelectedItems([])
    setShowRemoveItemModal(true)
  }, [])

  const openAddMedicineModal = useCallback(async (group) => {
    try {
      setLoading(true)
      setSelectedGroup(group)
      await fetchAvailableMedicines()
      setShowAddMedicineModal(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetchAvailableMedicines])

  // Render checkbox for medicine selection
  const renderMedicineCheckbox = useCallback((medicine) => (
    <td className="px-4 py-2">
      <div className="flex items-center">
        <input
          type="checkbox"
          className="checkbox h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={selectedMedicines.includes(medicine.id)}
          onChange={() => toggleSelectItem(medicine.id)}
          disabled={loading}
          id={`medicine-${medicine.id}`}
        />
        <label htmlFor={`medicine-${medicine.id}`} className="sr-only">
          Select {medicine.name}
        </label>
      </div>
    </td>
  ), [selectedMedicines, loading, toggleSelectItem])

  return (
    <>
      <style jsx>{`
        /* Base Styles */
        .container {
          background-color: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        /* Header Styles */
        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .sectionTitle {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1.25rem;
        }
        
        /* Search and Action Styles */
        .searchAddContainer {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          gap: 1rem;
        }
        
        .searchInput {
          flex: 1;
          max-width: 300px;
          padding: 0.625rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .searchInput:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
        
        /* Button Styles */
        .primaryButton {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #4f46e5;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 0.875rem;
        }
        
        .primaryButton:hover {
          background-color: #4338ca;
        }
        
        .viewButton {
          background-color: #4f46e5;
          color: white;
        }
        
        .viewButton:hover {
          background-color: #4338ca;
        }
        
        .editButton {
          background-color: #10b981;
          color: white;
        }
        
        .editButton:hover {
          background-color: #059669;
        }
        
        .deleteButton {
          background-color: #ef4444;
          color: white;
        }
        
        .deleteButton:hover {
          background-color: #dc2626;
        }
        
        .secondaryButton {
          background-color: white;
          color: #4f46e5;
          border: 1px solid #4f46e5;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }
        
        .secondaryButton:hover {
          background-color: #f5f3ff;
        }
        
        .dangerButton {
          background-color: #ef4444;
          color: white;
        }
        
        .dangerButton:hover {
          background-color: #dc2626;
        }
        
        .buttonIcon {
          margin-right: 0.25rem;
        }
        
        /* Table Styles */
        .tableContainer {
          overflow-x: auto;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }
        
        .table th {
          background-color: #f9fafb;
          padding: 0.875rem 1.25rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .table tr:last-child td {
          border-bottom: none;
        }
        
        /* Badge Styles */
        .countBadge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          background-color: #eef2ff;
          color: #4f46e5;
        }
        
        /* Action Buttons Container */
        .actionButtons {
          display: flex;
          gap: 0.5rem;
        }
        
        /* Pagination Styles */
        .paginationContainer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .paginationButtons {
          display: flex;
          gap: 0.5rem;
        }
        
        .paginationButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
          background-color: white;
          transition: all 0.2s;
        }
        
        .paginationButton:hover:not(:disabled) {
          background-color: #f9fafb;
          border-color: #d1d5db;
        }
        
        .paginationButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .active {
          background-color: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }
        
        /* Modal Styles */
        .modalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 50;
          padding: 1rem;
        }
        
        .modalContent {
          background-color: white;
          border-radius: 0.5rem;
          width: 100%;
          max-width: 32rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .largeModal {
          max-width: 48rem;
          max-height: 80vh;
          overflow: auto;
        }
        
        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modalTitle {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }
        
        .modalCloseButton {
          color: #6b7280;
          transition: color 0.2s;
        }
        
        .modalCloseButton:hover {
          color: #111827;
        }
        
        .modalBody {
          padding: 1.5rem;
        }
        
        .modalFooter {
          display: flex;
          justify-content: flex-end;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          gap: 0.75rem;
        }
        
        .modalInput {
          width: 100%;
          padding: 0.625rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .modalInput:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
        
        .modalLabel {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .searchContainer {
          display: flex;
          align-items: center;
          padding: 0.625rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .searchIcon {
          color: #9ca3af;
          margin-right: 0.75rem;
        }
        
        .searchField {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.875rem;
        }
        
        .checkbox {
          width: 1rem;
          height: 1rem;
          border-radius: 0.25rem;
          border: 1px solid #d1d5db;
          accent-color: #6366f1;
        }

        .error {
          color: #ef4444;
          padding: 1rem;
          background-color: #fee2e2;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }

        .text-gray-600 {
          color: #4b5563;
        }

        .text-red-500 {
          color: #ef4444;
        }

        .mt-2 {
          margin-top: 0.5rem;
        }

        .mt-4 {
          margin-top: 1rem;
        }

        .mt-6 {
          margin-top: 1.5rem;
        }

        .mb-4 {
          margin-bottom: 1rem;
        }

        .font-medium {
          font-weight: 500;
        }

        .font-semibold {
          font-weight: 600;
        }
      `}</style>

      <div className="container">
        <div className="sectionHeader">
          <h1 className="sectionTitle">Medicine Groups</h1>
        </div>

        {error && <div className="error">Error: {error}</div>}

        <div className="searchAddContainer">
          <input
            type="text"
            placeholder="Search group..."
            className="searchInput"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
          <button 
            className="primaryButton"
            onClick={() => setShowCreateGroupModal(true)}
            disabled={loading}
          >
            <Plus size={16} className="buttonIcon" />
            Create Group
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading medicine groups...</div>
        ) : (
          <>
            <div className="tableContainer">
              <table className="table">
                <thead>
                  <tr>
                    <th>Group Name</th>
                    <th>Medicines</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                      <tr key={group.id}>
                        <td className="font-medium">{group.name}</td>
                        <td>
                          <span className="countBadge">{group.count || 0} items</span>
                        </td>
                        <td>
                          <div className="actionButtons">
                            <button
                              className="primaryButton viewButton"
                              onClick={() => openViewGroup(group)}
                              disabled={loading}
                            >
                              <Eye size={16} className="buttonIcon" />
                              View
                            </button>
                            <button
                              className="primaryButton editButton"
                              onClick={() => openEditGroup(group)}
                              disabled={loading}
                            >
                              <Edit size={16} className="buttonIcon" />
                              Edit
                            </button>
                            <button
                              className="primaryButton"
                              onClick={() => openAddMedicineModal(group)}
                              disabled={loading}
                            >
                              <Plus size={16} className="buttonIcon" />
                              Add Medicines
                            </button>
                            <button
                              className="primaryButton deleteButton"
                              onClick={() => {
                                if (group.count > 0) {
                                  openRemoveItemModal(group)
                                } else {
                                  setSelectedGroup(group)
                                  setShowDeleteGroupModal(true)
                                }
                              }}
                              disabled={loading}
                            >
                              <Trash2 size={16} className="buttonIcon" />
                              {group.count > 0 ? 'Remove Items' : 'Delete Group'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                        No medicine groups found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="paginationContainer">
              <div>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredGroups.length)} of {filteredGroups.length} groups</div>
              <div className="paginationButtons">
                <button 
                  className="paginationButton" 
                  onClick={goToPrevPage}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`paginationButton ${currentPage === page ? 'active' : ''}`}
                    onClick={() => goToPage(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className="paginationButton" 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <div className="modalHeader">
              <h2 className="modalTitle">Create New Group</h2>
              <button 
                className="modalCloseButton"
                onClick={() => setShowCreateGroupModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modalBody">
              <label className="modalLabel">Group Name</label>
              <input
                type="text"
                className="modalInput"
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                disabled={loading}
              />
              <label className="modalLabel">Description</label>
              <textarea
                className="modalInput"
                placeholder="Enter group description (optional)"
                rows={3}
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="modalFooter">
              <button
                className="secondaryButton"
                onClick={() => setShowCreateGroupModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="primaryButton"
                onClick={handleCreateGroup}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Group Modal */}
      {showViewGroupModal && selectedGroup && (
        <div className="modalOverlay">
          <div className="modalContent largeModal">
            <div className="modalHeader">
              <h2 className="modalTitle">{selectedGroup.name} Details</h2>
              <button 
                className="modalCloseButton"
                onClick={() => setShowViewGroupModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modalBody">
              <p className="text-gray-600 mb-4">{selectedGroup.description || 'No description available'}</p>
              <span className="countBadge">{selectedGroup.count} medicines</span>
              
              <h3 className="font-semibold mt-6 mb-4">Medicines in this group</h3>
              <div className="tableContainer">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Dosage</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGroup.medicines && selectedGroup.medicines.length > 0 ? (
                      selectedGroup.medicines.map((medicine) => (
                        <tr key={medicine.id}>
                          <td>{medicine.id}</td>
                          <td>{medicine.name}</td>
                          <td>{medicine.dosage || 'N/A'}</td>
                          <td>
                            <button
                              className="primaryButton deleteButton"
                              onClick={() => handleRemoveItem(selectedGroup.id, medicine.id)}
                              disabled={loading}
                            >
                              <Trash2 size={16} className="buttonIcon" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                          No medicines in this group
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modalFooter">
              <button
                className="primaryButton"
                onClick={() => setShowViewGroupModal(false)}
                disabled={loading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditGroupModal && selectedGroup && (
        <div className="modalOverlay">
          <div className="modalContent">
            <div className="modalHeader">
              <h2 className="modalTitle">Edit Group</h2>
              <button 
                className="modalCloseButton"
                onClick={() => setShowEditGroupModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modalBody">
              <label className="modalLabel">Group Name</label>
              <input
                type="text"
                className="modalInput"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                disabled={loading}
              />
              
              <label className="modalLabel">Description</label>
              <textarea
                className="modalInput"
                rows={3}
                value={editGroupDescription}
                onChange={(e) => setEditGroupDescription(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="modalFooter">
              <button
                className="secondaryButton"
                onClick={() => setShowEditGroupModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="primaryButton"
                onClick={handleEditGroup}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Medicines Modal */}
      {showAddMedicineModal && selectedGroup && (
        <div className="modalOverlay">
          <div className="modalContent largeModal">
            <div className="modalHeader">
              <h2 className="modalTitle">Add Medicines to {selectedGroup.name}</h2>
              <button 
                className="modalCloseButton"
                onClick={() => setShowAddMedicineModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modalBody">
              <div className="searchContainer">
                <Search size={16} className="searchIcon" />
                <input
                  type="text"
                  className="searchField"
                  placeholder="Search medicines..."
                  disabled={loading}
                />
              </div>
              
              <div className="tableContainer">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="checkbox h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selectedMedicines.length === availableMedicines.length && availableMedicines.length > 0}
                            onChange={toggleSelectAll}
                            disabled={loading || availableMedicines.length === 0}
                            id="select-all-medicines"
                          />
                          <label htmlFor="select-all-medicines" className="sr-only">
                            Select all medicines
                          </label>
                        </div>
                      </th>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Dosage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableMedicines.length > 0 ? (
                      availableMedicines.map((medicine) => (
                        <tr key={`medicine-${medicine.id}`}>
                          {renderMedicineCheckbox(medicine)}
                          <td>{medicine.id}</td>
                          <td>{medicine.name}</td>
                          <td>{medicine.dosage || 'N/A'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                          No medicines available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modalFooter">
              <button
                className="secondaryButton"
                onClick={() => setShowAddMedicineModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="primaryButton"
                onClick={handleAddMedicines}
                disabled={loading || selectedMedicines.length === 0}
              >
                {loading ? 'Adding...' : `Add ${selectedMedicines.length} Medicines`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Modal */}
      {showDeleteGroupModal && selectedGroup && (
        <div className="modalOverlay">
          <div className="modalContent">
            <div className="modalHeader">
              <h2 className="modalTitle">Delete Group</h2>
              <button 
                className="modalCloseButton"
                onClick={() => setShowDeleteGroupModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modalBody">
              <p>Are you sure you want to permanently delete the group "{selectedGroup.name}"?</p>
              <p className="text-red-500 mt-2">This action cannot be undone.</p>
            </div>
            <div className="modalFooter">
              <button
                className="secondaryButton"
                onClick={() => setShowDeleteGroupModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="primaryButton dangerButton"
                onClick={handleDeleteGroup}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}