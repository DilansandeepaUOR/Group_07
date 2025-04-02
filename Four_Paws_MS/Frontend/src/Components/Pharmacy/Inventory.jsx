"use client"

import { useState, useEffect } from "react"

export default function ProductsSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addFormData, setAddFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    status: 'In Stock'
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    status: 'In Stock'
  })
  const itemsPerPage = 5

  // Fetch medicines from backend
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `http://localhost:5000/api/medicines?search=${searchTerm}&page=${currentPage}&limit=${itemsPerPage}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch medicines')
        }
        const data = await response.json()
        setMedicines(data.data || data) // Handle both formats
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error("Error fetching medicines:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMedicines()
  }, [searchTerm, currentPage])

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) {
      return
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/medicines/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete medicine')
      }
      
      // Refresh the medicines list after deletion
      setMedicines(medicines.filter(medicine => medicine.id !== id))
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error("Error deleting medicine:", err)
    }
  }

  // Handle edit click
  const handleEditClick = (medicine) => {
    setEditingMedicine(medicine.id)
    setEditFormData({
      name: medicine.name,
      category: medicine.category,
      price: medicine.price.toString().replace('$', ''),
      stock: medicine.stock.toString(),
      status: medicine.status
    })
  }

  // Handle form changes (for both add and edit)
  const handleFormChange = (e, formType) => {
    const { name, value } = e.target
    
    // Special handling for stock and price fields
    let processedValue = value
    if (name === 'stock' || name === 'price') {
      // Prevent negative numbers
      processedValue = Math.max(0, parseFloat(value) || 0).toString()
      if (isNaN(processedValue)) processedValue = '0'
    }

    if (formType === 'add') {
      setAddFormData({
        ...addFormData,
        [name]: processedValue
      })
    } else {
      setEditFormData({
        ...editFormData,
        [name]: processedValue
      })
    }
  }

  // Handle edit form submit
  const handleEditSubmit = async (id) => {
    // Final validation
    if (parseFloat(editFormData.stock) < 0 || parseFloat(editFormData.price) < 0) {
      setError('Stock and price cannot be negative');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/medicines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editFormData,
          price: parseFloat(editFormData.price),
          stock: parseInt(editFormData.stock)
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update medicine')
      }
      
      // Refresh the medicines list after update
      const updatedMedicines = medicines.map(medicine => 
        medicine.id === id ? { ...medicine, ...editFormData } : medicine
      )
      
      setMedicines(updatedMedicines)
      setEditingMedicine(null)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error("Error updating medicine:", err)
    }
  }

  // Handle add form submit
  const handleAddSubmit = async () => {
    // Final validation
    if (parseFloat(addFormData.stock) < 0 || parseFloat(addFormData.price) < 0) {
      setError('Stock and price cannot be negative');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...addFormData,
          price: parseFloat(addFormData.price),
          stock: parseInt(addFormData.stock)
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to add medicine')
      }
      
      const data = await response.json()
      
      // Refresh the medicines list
      setMedicines([...medicines, {
        id: data.id,
        ...addFormData,
        price: parseFloat(addFormData.price),
        stock: parseInt(addFormData.stock)
      }])
      
      // Reset form and hide it
      setAddFormData({
        name: '',
        category: '',
        price: '',
        stock: '',
        status: 'In Stock'
      })
      setShowAddForm(false)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error("Error adding medicine:", err)
    }
  }

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingMedicine(null)
  }

  // Cancel add
  const handleCancelAdd = () => {
    setShowAddForm(false)
    setAddFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      status: 'In Stock'
    })
  }

  // Calculate pagination
  const totalPages = Math.ceil(medicines.length / itemsPerPage)
  const paginatedMedicines = medicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="container">
      <h1 className="title">List Of Medicine</h1>

      {error && <div className="error">Error: {error}</div>}

      <div className="searchAddContainer">
        <input
          type="text"
          placeholder="Search medicines..."
          className="searchInput"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
        <button 
          className="primaryButton"
          onClick={() => setShowAddForm(true)}
        >
          Add Medicine
        </button>
      </div>

      {showAddForm && (
        <div className="addForm">
          <h2>Add New Medicine</h2>
          <div className="formGroup">
            <label className="formLabel">Name:</label>
            <input
              type="text"
              name="name"
              className="formInput"
              value={addFormData.name}
              onChange={(e) => handleFormChange(e, 'add')}
            />
          </div>
          <div className="formGroup">
            <label className="formLabel">Category:</label>
            <input
              type="text"
              name="category"
              className="formInput"
              value={addFormData.category}
              onChange={(e) => handleFormChange(e, 'add')}
            />
          </div>
          <div className="formGroup">
            <label className="formLabel">Price:</label>
            <input
              type="number"
              name="price"
              className="formInput"
              value={addFormData.price}
              onChange={(e) => handleFormChange(e, 'add')}
              step="0.01"
              min="0"
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                  e.preventDefault()
                }
              }}
            />
          </div>
          <div className="formGroup">
            <label className="formLabel">Stock:</label>
            <input
              type="number"
              name="stock"
              className="formInput"
              value={addFormData.stock}
              onChange={(e) => handleFormChange(e, 'add')}
              min="0"
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                  e.preventDefault()
                }
              }}
            />
          </div>
          <div className="formGroup">
            <label className="formLabel">Status:</label>
            <select
              name="status"
              className="formSelect"
              value={addFormData.status}
              onChange={(e) => handleFormChange(e, 'add')}
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
          <div className="formButtons">
            <button 
              className="primaryButton"
              onClick={handleAddSubmit}
            >
              Save
            </button>
            <button 
              className="actionButton deleteButton"
              onClick={handleCancelAdd}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading medicines...</div>
      ) : (
        <>
          <div className="tableWrapper">
            <table className="medicineTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMedicines.length > 0 ? (
                  paginatedMedicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td>{medicine.id}</td>
                      <td>
                        {editingMedicine === medicine.id ? (
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={(e) => handleFormChange(e, 'edit')}
                            className="formInput"
                          />
                        ) : (
                          medicine.name
                        )}
                      </td>
                      <td>
                        {editingMedicine === medicine.id ? (
                          <input
                            type="text"
                            name="category"
                            value={editFormData.category}
                            onChange={(e) => handleFormChange(e, 'edit')}
                            className="formInput"
                          />
                        ) : (
                          medicine.category
                        )}
                      </td>
                      <td>
                        {editingMedicine === medicine.id ? (
                          <input
                            type="number"
                            name="price"
                            value={editFormData.price}
                            onChange={(e) => handleFormChange(e, 'edit')}
                            step="0.01"
                            className="formInput"
                            min="0"
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault()
                              }
                            }}
                          />
                        ) : (
                          `$${medicine.price}`
                        )}
                      </td>
                      <td>
                        {editingMedicine === medicine.id ? (
                          <input
                            type="number"
                            name="stock"
                            value={editFormData.stock}
                            onChange={(e) => handleFormChange(e, 'edit')}
                            className="formInput"
                            min="0"
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault()
                              }
                            }}
                          />
                        ) : (
                          medicine.stock
                        )}
                      </td>
                      <td>
                        {editingMedicine === medicine.id ? (
                          <select
                            name="status"
                            value={editFormData.status}
                            onChange={(e) => handleFormChange(e, 'edit')}
                            className="formSelect"
                          >
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        ) : (
                          <span className={`statusBadge ${
                            medicine.status === "In Stock" ? 'inStock' :
                            medicine.status === "Low Stock" ? 'lowStock' :
                            'outOfStock'
                          }`}>
                            {medicine.status}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingMedicine === medicine.id ? (
                          <div className="editFormButtons">
                            <button 
                              className="actionButton editButton"
                              onClick={() => handleEditSubmit(medicine.id)}
                            >
                              Save
                            </button>
                            <button 
                              className="actionButton deleteButton"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              className="actionButton editButton"
                              onClick={() => handleEditClick(medicine)}
                            >
                              Edit
                            </button>
                            <button 
                              className="actionButton deleteButton"
                              onClick={() => handleDelete(medicine.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      No medicines found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          
        </>


      // css for page        
      )}
         <style jsx>{`
        .container {
          padding: 1.5rem;
          background-color: #f9fafb;
        }
        
        .title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1.25rem;
        }
        
        .searchAddContainer {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          gap: 1rem;
        }
        
        .searchInput {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          max-width: 24rem;
        }
        
        .primaryButton {
          background-color: #4f46e5;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .primaryButton:hover {
          background-color: #4338ca;
        }
        
        .primaryButton:disabled {
          background-color: #c7d2fe;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .tableWrapper {
          overflow-x: auto;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          background-color: white;
          padding: 1rem;
        }
        
        .medicineTable {
          width: 100%;
          border-collapse: collapse;
        }
        
        .medicineTable th {
          background-color: #f8fafc;
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .medicineTable td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }
        
        .statusBadge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .inStock {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .lowStock {
          background-color: #fef9c3;
          color: #854d0e;
        }
        
        .outOfStock {
          background-color: #fee2e2;
          color: #991b1b;
        }
        
        .actionButton {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          margin-right: 0.5rem;
        }
        
        .editButton {
          background-color: #e0f2fe;
          color: #0369a1;
        }
        
        .deleteButton {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .paginationContainer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.25rem;
          color: #3b79cf;
        }
        
        .paginationButtons {
          display: flex;
          gap: 0.5rem;
        }

        .paginationButton {
          background-color: #4f46e5;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .paginationButton:hover {
          background-color: #4338ca;
        }
        
        .paginationButton:disabled {
          background-color: #c7d2fe;
          cursor: not-allowed;
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }
        
        .error {
          color: #ef4444;
          padding: 1rem;
          background-color: #fee2e2;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }
        
        .addForm {
          background-color: #f8fafc;
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }
        
        .formGroup {
          margin-bottom: 1rem;
        }
        
        .formLabel {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #334155;
        }
        
        .formInput {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
        }
        
        .formSelect {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          background-color: white;
        }
        
        .formButtons {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
      `}</style>

    </div>
    
  )
}