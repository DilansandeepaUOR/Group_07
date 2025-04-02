"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, X, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react"

export default function MedicineGroupSection() {
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showViewGroupModal, setShowViewGroupModal] = useState(false)
  const [showEditGroupModal, setShowEditGroupModal] = useState(false)
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [editGroupName, setEditGroupName] = useState("")
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState([])

  // Sample data
  const medicineGroups = [
    {
      id: 1,
      name: "Pain Relief",
      count: 2,
      description: "Medications for pain management",
      medicines: [
        { id: 1, name: "Paracetamol", dosage: "500mg" },
        { id: 2, name: "Ibuprofen", dosage: "400mg" },
      ],
    },
    {
      id: 2,
      name: "Antibiotics",
      count: 1,
      description: "Medications that kill or stop the growth of bacteria",
      medicines: [
        { id: 3, name: "Amoxicillin", dosage: "500mg" },
      ],
    },
    {
      id: 3,
      name: "Cardiovascular",
      count: 3,
      description: "Medications for heart conditions",
      medicines: [
        { id: 4, name: "Atorvastatin", dosage: "20mg" },
        { id: 5, name: "Metoprolol", dosage: "50mg" },
        { id: 6, name: "Lisinopril", dosage: "10mg" },
      ],
    },
  ]

  const filteredGroups = medicineGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateGroup = () => {
    // In a real app, you would call an API here
    console.log("Creating group:", newGroupName)
    setShowCreateGroupModal(false)
    setNewGroupName("")
  }

  const handleEditGroup = () => {
    // In a real app, you would call an API here
    console.log("Editing group:", editGroupName)
    setShowEditGroupModal(false)
  }

  const handleRemoveItem = (medicineId) => {
    // In a real app, you would call an API here
    console.log("Removing medicine:", medicineId)
  }

  const handleRemoveSelected = () => {
    // In a real app, you would call an API here
    console.log("Removing selected items:", selectedItems)
    setShowRemoveItemModal(false)
    setSelectedItems([])
  }

  const toggleSelectItem = (medicineId) => {
    setSelectedItems(prev => 
      prev.includes(medicineId)
        ? prev.filter(id => id !== medicineId)
        : [...prev, medicineId]
    )
  }

  const openViewGroup = (group) => {
    setSelectedGroup(group)
    setShowViewGroupModal(true)
  }

  const openEditGroup = (group) => {
    setSelectedGroup(group)
    setEditGroupName(group.name)
    setShowEditGroupModal(true)
  }

  const openRemoveItemModal = (group) => {
    setSelectedGroup(group)
    setShowRemoveItemModal(true)
  }

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
      `}</style>

      <div className="container">
        <div className="sectionHeader">
          <h1 className="sectionTitle">Medicine Groups</h1>
        </div>

        <div className="searchAddContainer">
          <input
            type="text"
            placeholder="Search group..."
            className="searchInput"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="primaryButton"
            onClick={() => setShowCreateGroupModal(true)}
          >
            <Plus size={16} className="buttonIcon" />
            Create Group
          </button>
        </div>

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
              {filteredGroups.map((group) => (
                <tr key={group.id}>
                  <td className="font-medium">{group.name}</td>
                  <td>
                    <span className="countBadge">{group.count} items</span>
                  </td>
                  <td>
                    <div className="actionButtons">
                      <button
                        className="primaryButton viewButton"
                        onClick={() => openViewGroup(group)}
                      >
                        <Eye size={16} className="buttonIcon" />
                        View
                      </button>
                      <button
                        className="primaryButton editButton"
                        onClick={() => openEditGroup(group)}
                      >
                        <Edit size={16} className="buttonIcon" />
                        Edit
                      </button>
                      <button
                        className="primaryButton deleteButton"
                        onClick={() => openRemoveItemModal(group)}
                      >
                        <Trash2 size={16} className="buttonIcon" />
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="paginationContainer">
          <div>Showing 1 to {filteredGroups.length} of {filteredGroups.length} groups</div>
          <div className="paginationButtons">
            <button className="paginationButton" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="paginationButton" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
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
              />
            </div>
            <div className="modalFooter">
              <button
                className="secondaryButton"
                onClick={() => setShowCreateGroupModal(false)}
              >
                Cancel
              </button>
              <button
                className="primaryButton"
                onClick={handleCreateGroup}
              >
                Create Group
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
              >
                <X size={20} />
              </button>
            </div>
            <div className="modalBody">
              <p className="text-gray-600 mb-4">{selectedGroup.description}</p>
              <span className="countBadge">{selectedGroup.count} medicines</span>
              
              <h3 className="font-semibold mt-6 mb-4">Medicines in this group</h3>
              <div className="tableContainer">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Dosage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGroup.medicines.map((medicine) => (
                      <tr key={medicine.id}>
                        <td>{medicine.id}</td>
                        <td>{medicine.name}</td>
                        <td>{medicine.dosage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modalFooter">
              <button
                className="primaryButton"
                onClick={() => setShowViewGroupModal(false)}
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
              />
              
              <label className="modalLabel">Description</label>
              <textarea
                className="modalInput"
                rows={3}
                defaultValue={selectedGroup.description}
              />
            </div>
            <div className="modalFooter">
              <button
                className="secondaryButton"
                onClick={() => setShowEditGroupModal(false)}
              >
                Cancel
              </button>
              <button
                className="primaryButton"
                onClick={handleEditGroup}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Items Modal */}
      {showRemoveItemModal && selectedGroup && (
        <div className="modalOverlay">
          <div className="modalContent largeModal">
            <div className="modalHeader">
              <h2 className="modalTitle">Remove Items from {selectedGroup.name}</h2>
              <button 
                className="modalCloseButton"
                onClick={() => setShowRemoveItemModal(false)}
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
                />
              </div>
              
              <div className="tableContainer">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox" 
                          className="checkbox"
                          checked={selectedItems.length === selectedGroup.medicines.length}
                          onChange={() => {
                            if (selectedItems.length === selectedGroup.medicines.length) {
                              setSelectedItems([])
                            } else {
                              setSelectedItems(selectedGroup.medicines.map(m => m.id))
                            }
                          }}
                        />
                      </th>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Dosage</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGroup.medicines.map((medicine) => (
                      <tr key={medicine.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedItems.includes(medicine.id)}
                            onChange={() => toggleSelectItem(medicine.id)}
                          />
                        </td>
                        <td>{medicine.id}</td>
                        <td>{medicine.name}</td>
                        <td>{medicine.dosage}</td>
                        <td>
                          <button
                            className="primaryButton deleteButton"
                            onClick={() => handleRemoveItem(medicine.id)}
                          >
                            <Trash2 size={16} className="buttonIcon" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modalFooter">
              <button
                className="secondaryButton"
                onClick={() => setShowRemoveItemModal(false)}
              >
                Cancel
              </button>
              <button
                className="primaryButton dangerButton"
                onClick={handleRemoveSelected}
                disabled={selectedItems.length === 0}
              >
                <Trash2 size={16} className="buttonIcon" />
                Remove Selected ({selectedItems.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}