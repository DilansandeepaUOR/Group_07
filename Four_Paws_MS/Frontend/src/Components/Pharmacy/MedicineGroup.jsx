"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, Edit, Trash2, X, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react"

export default function MedicineGroupSection() {
  const API_BASE_URL = "http://localhost:3001/pharmacy/api/medicine-groups";
  const MEDICINES_API_URL = "http://localhost:3001/pharmacy/api/medicines";
  
  // Color scheme
  const colors = {
    darkBackground: 'rgba(34,41,47,255)',
    tealAccent: 'rgba(59,205,191,255)',
    yellowAccent: '#FFD700',
    lightText: '#f3f4f6',
    darkText: '#111827',
    cardBackground: 'rgba(44,51,57,255)',
    warningRed: '#ef4444',
    successGreen: '#10b981',
    borderColor: 'rgba(255,255,255,0.1)'
  };

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
    <td style={{ padding: "12px 16px" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            border: `1px solid ${colors.borderColor}`,
            backgroundColor: colors.cardBackground,
            accentColor: colors.tealAccent
          }}
          checked={selectedMedicines.includes(medicine.id)}
          onChange={() => toggleSelectItem(medicine.id)}
          disabled={loading}
          id={`medicine-${medicine.id}`}
        />
        <label htmlFor={`medicine-${medicine.id}`} style={{ display: "none" }}>
          Select {medicine.name}
        </label>
      </div>
    </td>
  ), [selectedMedicines, loading, toggleSelectItem, colors])

  return (
    <div style={{
      padding: "24px",
      backgroundColor: colors.darkBackground,
      minHeight: "100vh"
    }}>
      <h1 style={{ 
        fontSize: "1.5rem", 
        fontWeight: "bold", 
        marginBottom: "24px",
        color: colors.yellowAccent
      }}>
        Medicine Groups
      </h1>

      {error && (
        <div style={{
          color: colors.warningRed,
          padding: "12px",
          backgroundColor: "rgba(239,68,68,0.1)",
          borderRadius: "6px",
          marginBottom: "16px",
          border: `1px solid ${colors.warningRed}`
        }}>
          Error: {error}
        </div>
      )}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "24px",
        gap: "16px",
        flexWrap: "wrap"
      }}>
        <input
          type="text"
          placeholder="Search group..."
          style={{
            flex: 1,
            padding: "10px 16px",
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.borderColor}`,
            borderRadius: "6px",
            color: colors.lightText,
            maxWidth: "400px",
            minWidth: "250px"
          }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
        <button 
          style={{
            backgroundColor: colors.tealAccent,
            color: colors.darkText,
            padding: "10px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
            ':hover': {
              opacity: 0.9
            }
          }}
          onClick={() => setShowCreateGroupModal(true)}
          disabled={loading}
        >
          <Plus size={16} />
          Create Group
        </button>
      </div>

      {loading ? (
        <div style={{ 
          textAlign: "center",
          padding: "40px",
          color: colors.tealAccent
        }}>
          Loading medicine groups...
        </div>
      ) : (
        <>
          <div style={{ 
            overflowX: "auto",
            borderRadius: "8px",
            backgroundColor: colors.cardBackground,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}>
            <table style={{ 
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "800px"
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: "rgba(59,205,191,0.1)",
                  borderBottom: `1px solid ${colors.borderColor}`
                }}>
                  <th style={{ 
                    padding: "14px 20px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: colors.tealAccent
                  }}>Group Name</th>
                  <th style={{ 
                    padding: "14px 20px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: colors.tealAccent
                  }}>Medicines</th>
                  <th style={{ 
                    padding: "14px 20px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: colors.tealAccent
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <tr key={group.id} style={{ 
                      borderBottom: `1px solid ${colors.borderColor}`,
                      ':hover': {
                        backgroundColor: "rgba(255,255,255,0.05)"
                      }
                    }}>
                      <td style={{ 
                        padding: "12px 20px",
                        color: colors.lightText,
                        fontWeight: "500"
                      }}>{group.name}</td>
                      <td style={{ padding: "12px 20px" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "4px 12px",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          backgroundColor: "rgba(59,205,191,0.2)",
                          color: colors.tealAccent
                        }}>{group.count || 0} items</span>
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <div style={{ 
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap"
                        }}>
                          <button
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "rgba(59,205,191,0.2)",
                              color: colors.tealAccent,
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "0.875rem",
                              transition: "all 0.2s",
                              ':hover': {
                                backgroundColor: "rgba(59,205,191,0.3)"
                              }
                            }}
                            onClick={() => openViewGroup(group)}
                            disabled={loading}
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "rgba(255,215,0,0.2)",
                              color: colors.yellowAccent,
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "0.875rem",
                              transition: "all 0.2s",
                              ':hover': {
                                backgroundColor: "rgba(255,215,0,0.3)"
                              }
                            }}
                            onClick={() => openEditGroup(group)}
                            disabled={loading}
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "rgba(59,205,191,0.2)",
                              color: colors.tealAccent,
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "0.875rem",
                              transition: "all 0.2s",
                              ':hover': {
                                backgroundColor: "rgba(59,205,191,0.3)"
                              }
                            }}
                            onClick={() => openAddMedicineModal(group)}
                            disabled={loading}
                          >
                            <Plus size={16} />
                            Add Medicines
                          </button>
                          <button
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "rgba(239,68,68,0.2)",
                              color: colors.warningRed,
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "0.875rem",
                              transition: "all 0.2s",
                              ':hover': {
                                backgroundColor: "rgba(239,68,68,0.3)"
                              }
                            }}
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
                            <Trash2 size={16} />
                            {group.count > 0 ? 'Remove Items' : 'Delete Group'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ 
                      textAlign: 'center', 
                      padding: '2rem',
                      color: colors.lightText
                    }}>
                      No medicine groups found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ 
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
            color: colors.lightText,
            fontSize: "0.875rem"
          }}>
            <div>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredGroups.length)} of {filteredGroups.length} groups</div>
            <div style={{ 
              display: "flex",
              gap: "8px"
            }}>
              <button 
                style={{
                  padding: "8px",
                  backgroundColor: currentPage === 1 ? "rgba(255,255,255,0.1)" : colors.tealAccent,
                  color: currentPage === 1 ? colors.lightText : colors.darkText,
                  border: "none",
                  borderRadius: "6px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  opacity: currentPage === 1 ? 0.7 : 1
                }}
                onClick={goToPrevPage}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: currentPage === page ? colors.tealAccent : colors.cardBackground,
                    color: currentPage === page ? colors.darkText : colors.lightText,
                    border: currentPage === page ? "none" : `1px solid ${colors.borderColor}`,
                    borderRadius: "6px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    ':hover': {
                      backgroundColor: currentPage === page ? colors.tealAccent : "rgba(255,255,255,0.1)"
                    }
                  }}
                  onClick={() => goToPage(page)}
                  disabled={loading}
                >
                  {page}
                </button>
              ))}
              <button 
                style={{
                  padding: "8px",
                  backgroundColor: currentPage === totalPages ? "rgba(255,255,255,0.1)" : colors.tealAccent,
                  color: currentPage === totalPages ? colors.lightText : colors.darkText,
                  border: "none",
                  borderRadius: "6px",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  opacity: currentPage === totalPages ? 0.7 : 1
                }}
                onClick={goToNextPage}
                disabled={currentPage === totalPages || loading}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 50,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: colors.cardBackground,
            borderRadius: "8px",
            width: "100%",
            maxWidth: "32rem",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              borderBottom: `1px solid ${colors.borderColor}`
            }}>
              <h2 style={{ 
                fontSize: "1.125rem",
                fontWeight: "600",
                color: colors.lightText
              }}>
                Create New Group
              </h2>
              <button 
                style={{
                  color: colors.lightText,
                  transition: "color 0.2s",
                  ':hover': {
                    color: colors.tealAccent
                  }
                }}
                onClick={() => setShowCreateGroupModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <label style={{ 
                display: "block",
                marginBottom: "8px",
                color: colors.lightText,
                fontSize: "0.875rem",
                fontWeight: "500"
              }}>
                Group Name
              </label>
              <input
                type="text"
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  backgroundColor: colors.darkBackground,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "6px",
                  color: colors.lightText,
                  marginBottom: "16px"
                }}
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                disabled={loading}
              />
              <label style={{ 
                display: "block",
                marginBottom: "8px",
                color: colors.lightText,
                fontSize: "0.875rem",
                fontWeight: "500"
              }}>
                Description
              </label>
              <textarea
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  backgroundColor: colors.darkBackground,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "6px",
                  color: colors.lightText,
                  marginBottom: "16px",
                  minHeight: "100px"
                }}
                placeholder="Enter group description (optional)"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                disabled={loading}
              />
            </div>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "20px 24px",
              borderTop: `1px solid ${colors.borderColor}`,
              gap: "12px"
            }}>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: colors.cardBackground,
                  color: colors.lightText,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  ':hover': {
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }
                }}
                onClick={() => setShowCreateGroupModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: colors.tealAccent,
                  color: colors.darkText,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  ':hover': {
                    opacity: 0.9
                  }
                }}
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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 50,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: colors.cardBackground,
            borderRadius: "8px",
            width: "100%",
            maxWidth: "48rem",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              borderBottom: `1px solid ${colors.borderColor}`
            }}>
              <h2 style={{ 
                fontSize: "1.125rem",
                fontWeight: "600",
                color: colors.lightText
              }}>
                {selectedGroup.name} Details
              </h2>
              <button 
                style={{
                  color: colors.lightText,
                  transition: "color 0.2s",
                  ':hover': {
                    color: colors.tealAccent
                  }
                }}
                onClick={() => setShowViewGroupModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ 
                color: "#9ca3af",
                marginBottom: "16px"
              }}>
                {selectedGroup.description || 'No description available'}
              </p>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: "500",
                backgroundColor: "rgba(59,205,191,0.2)",
                color: colors.tealAccent
              }}>
                {selectedGroup.count} medicines
              </span>
              
              <h3 style={{ 
                fontWeight: "600",
                margin: "24px 0 16px",
                color: colors.lightText
              }}>
                Medicines in this group
              </h3>
              <div style={{ 
                overflowX: "auto",
                borderRadius: "8px",
                backgroundColor: colors.darkBackground,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }}>
                <table style={{ 
                  width: "100%",
                  borderCollapse: "collapse"
                }}>
                  <thead>
                    <tr style={{ 
                      backgroundColor: "rgba(59,205,191,0.1)",
                      borderBottom: `1px solid ${colors.borderColor}`
                    }}>
                      <th style={{ 
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: colors.tealAccent
                      }}>ID</th>
                      <th style={{ 
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: colors.tealAccent
                      }}>Name</th>
                      <th style={{ 
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: colors.tealAccent
                      }}>Dosage</th>
                      <th style={{ 
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: colors.tealAccent
                      }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGroup.medicines && selectedGroup.medicines.length > 0 ? (
                      selectedGroup.medicines.map((medicine) => (
                        <tr key={medicine.id} style={{ 
                          borderBottom: `1px solid ${colors.borderColor}`,
                          ':hover': {
                            backgroundColor: "rgba(255,255,255,0.05)"
                          }
                        }}>
                          <td style={{ 
                            padding: "12px 16px",
                            color: colors.lightText
                          }}>{medicine.id}</td>
                          <td style={{ 
                            padding: "12px 16px",
                            color: colors.lightText
                          }}>{medicine.name}</td>
                          <td style={{ 
                            padding: "12px 16px",
                            color: colors.lightText
                          }}>{medicine.dosage || 'N/A'}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <button
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "rgba(239,68,68,0.2)",
                                color: colors.warningRed,
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "500",
                                transition: "all 0.2s",
                                ':hover': {
                                  backgroundColor: "rgba(239,68,68,0.3)"
                                }
                              }}
                              onClick={() => handleRemoveItem(selectedGroup.id, medicine.id)}
                              disabled={loading}
                            >
                              <Trash2 size={16} style={{ marginRight: "4px" }} />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ 
                          textAlign: "center", 
                          padding: "1rem",
                          color: colors.lightText
                        }}>
                          No medicines in this group
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "20px 24px",
              borderTop: `1px solid ${colors.borderColor}`
            }}>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: colors.tealAccent,
                  color: colors.darkText,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  ':hover': {
                    opacity: 0.9
                  }
                }}
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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 50,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: colors.cardBackground,
            borderRadius: "8px",
            width: "100%",
            maxWidth: "32rem",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              borderBottom: `1px solid ${colors.borderColor}`
            }}>
              <h2 style={{ 
                fontSize: "1.125rem",
                fontWeight: "600",
                color: colors.lightText
              }}>
                Edit Group
              </h2>
              <button 
                style={{
                  color: colors.lightText,
                  transition: "color 0.2s",
                  ':hover': {
                    color: colors.tealAccent
                  }
                }}
                onClick={() => setShowEditGroupModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <label style={{ 
                display: "block",
                marginBottom: "8px",
                color: colors.lightText,
                fontSize: "0.875rem",
                fontWeight: "500"
              }}>
                Group Name
              </label>
              <input
                type="text"
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  backgroundColor: colors.darkBackground,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "6px",
                  color: colors.lightText,
                  marginBottom: "16px"
                }}
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                disabled={loading}
              />
              
              <label style={{ 
                display: "block",
                marginBottom: "8px",
                color: colors.lightText,
                fontSize: "0.875rem",
                fontWeight: "500"
              }}>
                Description
              </label>
              <textarea
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  backgroundColor: colors.darkBackground,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "6px",
                  color: colors.lightText,
                  minHeight: "100px"
                }}
                value={editGroupDescription}
                onChange={(e) => setEditGroupDescription(e.target.value)}
                disabled={loading}
              />
            </div>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "20px 24px",
              borderTop: `1px solid ${colors.borderColor}`,
              gap: "12px"
            }}>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: colors.cardBackground,
                  color: colors.lightText,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  ':hover': {
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }
                }}
                onClick={() => setShowEditGroupModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: colors.tealAccent,
                  color: colors.darkText,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  ':hover': {
                    opacity: 0.9
                  }
                }}
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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 50,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: colors.cardBackground,
            borderRadius: "8px",
            width: "100%",
            maxWidth: "48rem",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              borderBottom: `1px solid ${colors.borderColor}`
            }}>
              <h2 style={{ 
                fontSize: "1.125rem",
                fontWeight: "600",
                color: colors.lightText
              }}>
                Add Medicines to {selectedGroup.name}
              </h2>
              <button 
                style={{
                  color: colors.lightText,
                  transition: "color 0.2s",
                  ':hover': {
                    color: colors.tealAccent
                  }
                }}
                onClick={() => setShowAddMedicineModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 16px",
                backgroundColor: colors.darkBackground,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: "6px",
                marginBottom: "24px"
              }}>
                <Search size={16} color="#9ca3af" style={{ marginRight: "12px" }} />
                <input
                  type="text"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    color: colors.lightText
                  }}
                  placeholder="Search medicines..."
                  disabled={loading}
                />
              </div>
              
              <div style={{ 
                overflowX: "auto",
                borderRadius: "8px",
                backgroundColor: colors.darkBackground,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }}>
                <table style={{ 
                  width: "100%",
                  borderCollapse: "collapse"
                }}>
                  <thead>
                    <tr style={{ 
                      backgroundColor: "rgba(59,205,191,0.1)",
                      borderBottom: `1px solid ${colors.borderColor}`
                    }}>
                      <th style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <input 
                            type="checkbox" 
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "4px",
                              border: `1px solid ${colors.borderColor}`,
                              backgroundColor: colors.cardBackground,
                              accentColor: colors.tealAccent
                            }}
                            checked={selectedMedicines.length === availableMedicines.length && availableMedicines.length > 0}
                            onChange={toggleSelectAll}
                            disabled={loading || availableMedicines.length === 0}
                            id="select-all-medicines"
                          />
                          <label htmlFor="select-all-medicines" style={{ display: "none" }}>
                            Select all medicines
                          </label>
                        </div>
                      </th>
                      <th style={{ 
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: colors.tealAccent
                      }}>ID</th>
                      <th style={{ 
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: colors.tealAccent
                      }}>Name</th>
                      <th style={{ 
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: colors.tealAccent
                      }}>Dosage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableMedicines.length > 0 ? (
                      availableMedicines.map((medicine) => (
                        <tr key={`medicine-${medicine.id}`} style={{ 
                          borderBottom: `1px solid ${colors.borderColor}`,
                          ':hover': {
                            backgroundColor: "rgba(255,255,255,0.05)"
                          }
                        }}>
                          {renderMedicineCheckbox(medicine)}
                          <td style={{ 
                            padding: "12px 16px",
                            color: colors.lightText
                          }}>{medicine.id}</td>
                          <td style={{ 
                            padding: "12px 16px",
                            color: colors.lightText
                          }}>{medicine.name}</td>
                          <td style={{ 
                            padding: "12px 16px",
                            color: colors.lightText
                          }}>{medicine.dosage || 'N/A'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ 
                          textAlign: "center", 
                          padding: "1rem",
                          color: colors.lightText
                        }}>
                          No medicines available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "20px 24px",
              borderTop: `1px solid ${colors.borderColor}`,
              gap: "12px"
            }}>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: colors.cardBackground,
                  color: colors.lightText,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  ':hover': {
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }
                }}
                onClick={() => setShowAddMedicineModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: colors.tealAccent,
                  color: colors.darkText,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  ':hover': {
                    opacity: 0.9
                  }
                }}
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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 50,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: colors.cardBackground,
            borderRadius: "8px",
            width: "100%",
            maxWidth: "32rem",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              borderBottom: `1px solid ${colors.borderColor}`
            }}>
              <h2 style={{ 
                fontSize: "1.125rem",
                fontWeight: "600",
                color: colors.lightText
              }}>
                Delete Group
              </h2>
              <button 
                style={{
                  color: colors.lightText,
                  transition: "color 0.2s",
                  ':hover': {
                    color: colors.tealAccent
                  }
                }}
                onClick={() => setShowDeleteGroupModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ color: colors.lightText }}>
                Are you sure you want to permanently delete the group "{selectedGroup.name}"?
              </p>
              <p style={{ 
                color: colors.warningRed,
                marginTop: "8px"
              }}>
                This action cannot be undone.
              </p>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "20px 24px",
              borderTop: `1px solid ${colors.borderColor}`,
              gap: "12px"
            }}>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: colors.cardBackground,
                  color: colors.lightText,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  ':hover': {
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }
                }}
                onClick={() => setShowDeleteGroupModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: colors.warningRed,
                  color: colors.lightText,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  ':hover': {
                    opacity: 0.9
                  }
                }}
                onClick={handleDeleteGroup}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}