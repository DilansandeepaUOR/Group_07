"use client"

import { useState, useEffect } from "react"

export default function ProductsSection() {
  const API_BASE_URL = "http://localhost:3001/pharmacy/api/medicines";
  const [searchTerm, setSearchTerm] = useState("")
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
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
  const itemsPerPage = 4

  const getStockStatus = (stock) => {
    const stockCount = parseInt(stock);
    if (stockCount === 0) return "Out of Stock";
    if (stockCount > 0 && stockCount <= 15) return "Low Stock";
    return "In Stock";
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Fetch medicines from backend
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}?search=${searchTerm}&page=${currentPage}&limit=${itemsPerPage}`
        );
        if (!response.ok) throw new Error('Failed to fetch medicines');
        
        const data = await response.json();
        const medicinesData = data.data || data;
        const totalCount = data.totalCount || medicinesData.length;
        
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
        
        const processedMedicines = medicinesData.map(medicine => ({
          ...medicine,
          status: getStockStatus(medicine.stock)
        }));
        
        setMedicines(processedMedicines);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching medicines:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedicines();
  }, [searchTerm, currentPage, itemsPerPage]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) {
      return
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete medicine')
      }
      
      setMedicines(medicines.filter(medicine => medicine.id !== id))
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error("Error deleting medicine:", err)
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (medicine) => {
    setEditingMedicine(medicine.id)
    setEditFormData({
      name: medicine.name,
      category: medicine.category,
      price: medicine.price.toString().replace('Rs ', ''),
      stock: medicine.stock.toString(),
      status: getStockStatus(medicine.stock)
    })
  }

  const handleFormChange = (e, formType) => {
    const { name, value } = e.target
    
    let processedValue = value
    if (name === 'stock' || name === 'price') {
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

  const handleEditSubmit = async (id) => {
    if (parseFloat(editFormData.stock) < 0 || parseFloat(editFormData.price) < 0) {
      setError('Stock and price cannot be negative');
      return;
    }
    
    try {
      setLoading(true);
      const updatedData = {
        ...editFormData,
        price: parseFloat(editFormData.price),
        stock: parseInt(editFormData.stock),
        status: getStockStatus(editFormData.stock)
      };
  
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) throw new Error('Failed to update medicine');
      
      const updatedMedicines = medicines.map(medicine => 
        medicine.id === id ? { ...medicine, ...updatedData } : medicine
      );
      
      setMedicines(updatedMedicines);
      setEditingMedicine(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error updating medicine:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddSubmit = async () => {
    if (!addFormData.name || !addFormData.category) {
      setError('Name and category are required');
      return;
    }
    
    if (parseFloat(addFormData.stock) < 0 || parseFloat(addFormData.price) < 0) {
      setError('Stock and price cannot be negative');
      return;
    }
    
    try {
      setLoading(true);
      const newMedicine = {
        ...addFormData,
        price: parseFloat(addFormData.price),
        stock: parseInt(addFormData.stock),
        status: getStockStatus(addFormData.stock)
      };
  
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedicine)
      });
      
      if (!response.ok) throw new Error('Failed to add medicine');
      
      const data = await response.json();
      setMedicines([...medicines, { id: data.id, ...newMedicine }]);
      
      setAddFormData({
        name: '',
        category: '',
        price: '',
        stock: '',
        status: 'In Stock'
      });
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error adding medicine:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCancelEdit = () => {
    setEditingMedicine(null)
  }

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
              required
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
              required
            />
          </div>
          <div className="formGroup">
            <label className="formLabel">Price (Rs):</label>
            <input
              type="number"
              name="price"
              className="formInput"
              value={addFormData.price}
              onChange={(e) => handleFormChange(e, 'add')}
              step="0.01"
              min="0"
              required
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
              required
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
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button 
              className="actionButton deleteButton"
              onClick={handleCancelAdd}
              disabled={loading}
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
                {medicines.length > 0 ? (
                  medicines.map((medicine) => (
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
                            required
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
                            required
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
                            required
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault()
                              }
                            }}
                          />
                        ) : (
                          `Rs ${medicine.price}`
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
                            required
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
                              disabled={loading}
                            >
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              className="actionButton deleteButton"
                              onClick={handleCancelEdit}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              className="actionButton editButton"
                              onClick={() => handleEditClick(medicine)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button 
                              className="actionButton deleteButton"
                              onClick={() => handleDelete(medicine.id)}
                              disabled={loading}
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

          {/* Pagination controls */}
          <div className="paginationControls">
            <button
              className={`paginationButton ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={goToPrevPage}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </button>
            
            <div className="pageNumbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pageNumber ${currentPage === page ? 'active' : ''}`}
                  onClick={() => goToPage(page)}
                  disabled={loading}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              className={`paginationButton ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={goToNextPage}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </button>
          </div>
        </>
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

        .paginationControls {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 1.5rem;
          padding: 1rem;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          gap: 1rem;
        }
        
        .paginationButton {
          background-color: #4f46e5;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
        }
        
        .paginationButton:hover:not(.disabled) {
          background-color: #4338ca;
        }
        
        .paginationButton.disabled {
          background-color: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
        }
        
        .pageNumbers {
          display: flex;
          gap: 0.5rem;
        }
        
        .pageNumber {
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          background-color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .pageNumber:hover {
          background-color: #f1f5f9;
        }
        
        .pageNumber.active {
          background-color: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }
      `}</style>
    </div>
  )
}