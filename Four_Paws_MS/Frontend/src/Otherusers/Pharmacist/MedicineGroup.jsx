"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, Edit, Trash2, X, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  );
}, [medicineGroups, searchTerm]);


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
  
      const result = await response.json();
      
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
  
      //const data = await response.json()
      
      const fetchResponse = await fetch(
        `${API_BASE_URL}?search=${searchTerm}&page=${currentPage}&limit=${itemsPerPage}`
      )
      const fetchData = await fetchResponse.json()
      
      setMedicineGroups(fetchData.data || fetchData)
      
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
      
      const groupResponse = await fetch(`${API_BASE_URL}/${groupId}`)
      const updatedGroup = await groupResponse.json()
      
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
      
      const groupResponse = await fetch(`${API_BASE_URL}/${groupId}`)
      const updatedGroup = await groupResponse.json()
      
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Medicine Groups</h1>

        {error && (
          <div className="p-3 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search group..."
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#71C9CE] flex-1 max-w-md"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
          <Button
            className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 flex items-center"
            onClick={() => setShowCreateGroupModal(true)}
          >
            <Plus className="mr-2" /> Create Group
          </Button>
        </div>

        {loading ? (
          <div className="text-center p-10 text-[#71C9CE]">Loading medicine groups...</div>
        ) : (
          <>
            <div className="bg-white/30 backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#71C9CE] text-gray-900 sticky top-0">
                    <tr>
                      <th className="p-3 border-l-2">Group Name</th>
                      <th className="p-3 border-l-2">Medicines</th>
                      <th className="p-3 border-l-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.length > 0 ? (
                      filteredGroups.map((group) => (
                        <tr key={group.id} className="border-t hover:bg-gray-50/50">
                          <td className="p-3 font-medium">{group.name}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#71C9CE]/20 text-[#028478]">
                              {group.count || 0} items
                            </span>
                          </td>
                          <td className="p-3 space-x-2">
                            <Button
                              size="sm"
                              onClick={() => openViewGroup(group)}
                            >
                              <Eye className="mr-1" /> View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditGroup(group)}
                            >
                              <Edit className="mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
                              onClick={() => openAddMedicineModal(group)}
                            >
                              <Plus className="mr-1" /> Add Medicines
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (group.count > 0) {
                                  openRemoveItemModal(group)
                                } else {
                                  setSelectedGroup(group)
                                  setShowDeleteGroupModal(true)
                                }
                              }}
                            >
                              <Trash2 className="mr-1" />
                              {group.count > 0 ? 'Remove Items' : 'Delete Group'}
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center p-10 text-gray-500">
                          No medicine groups found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 text-sm">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredGroups.length)} of {filteredGroups.length} groups
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft size={16} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={currentPage === page ? 'bg-[#71C9CE] text-gray-900' : ''}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Create Group Modal */}
        {showCreateGroupModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/30 backdrop-blur-md p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-[#028478]">Create New Group</h2>
                  <button onClick={() => setShowCreateGroupModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Group Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter group name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Description</label>
                    <textarea
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      placeholder="Enter group description (optional)"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowCreateGroupModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
                    onClick={handleCreateGroup}
                  >
                    Create Group
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Group Modal */}
        {showViewGroupModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/30 backdrop-blur-md rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-auto">
              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-[#028478]">{selectedGroup.name} Details</h2>
                  <button onClick={() => setShowViewGroupModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  {selectedGroup.description || 'No description available'}
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#71C9CE]/20 text-[#028478] mb-6">
                  {selectedGroup.count} medicines
                </span>
                
                <h3 className="font-semibold text-lg mb-4">Medicines in this group</h3>
                <div className="overflow-x-auto bg-gray-50 rounded-md shadow-md">
                  <table className="w-full text-left">
                    <thead className="bg-[#71C9CE] text-gray-900">
                      <tr>
                        <th className="p-3 border-l-2">ID</th>
                        <th className="p-3 border-l-2">Name</th>
                        <th className="p-3 border-l-2">Dosage</th>
                        <th className="p-3 border-l-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroup.medicines && selectedGroup.medicines.length > 0 ? (
                        selectedGroup.medicines.map((medicine) => (
                          <tr key={medicine.id} className="border-t hover:bg-gray-100">
                            <td className="p-3">{medicine.id}</td>
                            <td className="p-3">{medicine.name}</td>
                            <td className="p-3">{medicine.dosage || 'N/A'}</td>
                            <td className="p-3">
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRemoveItem(selectedGroup.id, medicine.id)}
                              >
                                <Trash2 size={16} className="mr-1" /> Remove
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center p-6 text-gray-500">
                            No medicines in this group
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-6">
                  <Button 
                    className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
                    onClick={() => setShowViewGroupModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Group Modal */}
        {showEditGroupModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/30 backdrop-blur-md p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-[#028478]">Edit Group</h2>
                  <button onClick={() => setShowEditGroupModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Group Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Description</label>
                    <textarea
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      value={editGroupDescription}
                      onChange={(e) => setEditGroupDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowEditGroupModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
                    onClick={handleEditGroup}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Medicines Modal */}
        {showAddMedicineModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/30 backdrop-blur-md rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-auto">
              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-[#028478]">
                    Add Medicines to {selectedGroup.name}
                  </h2>
                  <button onClick={() => setShowAddMedicineModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="pl-10 w-full p-2 border rounded-md"
                    placeholder="Search medicines..."
                  />
                </div>
                
                <div className="overflow-x-auto bg-gray-50 rounded-md shadow-md">
                  <table className="w-full text-left">
                    <thead className="bg-[#71C9CE] text-gray-900">
                      <tr>
                        <th className="p-3 border-l-2">
                          <input 
                            type="checkbox" 
                            className="rounded"
                            checked={selectedMedicines.length === availableMedicines.length && availableMedicines.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="p-3 border-l-2">ID</th>
                        <th className="p-3 border-l-2">Name</th>
                        <th className="p-3 border-l-2">Dosage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableMedicines.length > 0 ? (
                        availableMedicines.map((medicine) => (
                          <tr key={`medicine-${medicine.id}`} className="border-t hover:bg-gray-100">
                            <td className="p-3">
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={selectedMedicines.includes(medicine.id)}
                                onChange={() => toggleSelectItem(medicine.id)}
                              />
                            </td>
                            <td className="p-3">{medicine.id}</td>
                            <td className="p-3">{medicine.name}</td>
                            <td className="p-3">{medicine.dosage || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center p-6 text-gray-500">
                            No medicines available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowAddMedicineModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
                    onClick={handleAddMedicines}
                    disabled={selectedMedicines.length === 0}
                  >
                    Add {selectedMedicines.length} Medicines
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Group Modal */}
        {showDeleteGroupModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/30 backdrop-blur-md p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-[#028478]">Delete Group</h2>
                  <button onClick={() => setShowDeleteGroupModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <p className="mb-4">
                  Are you sure you want to permanently delete the group "{selectedGroup.name}"?
                </p>
                <p className="text-red-500 mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowDeleteGroupModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteGroup}
                  >
                    Delete Group
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}