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
        Medicine Inventory
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
          placeholder="Search medicines..."
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
          onClick={() => setShowAddForm(true)}
        >
          Add Medicine
        </button>
      </div>

      {showAddForm && (
        <div style={{
          backgroundColor: colors.cardBackground,
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "24px",
          border: `1px solid ${colors.tealAccent}`
        }}>
          <h2 style={{ 
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "16px",
            color: colors.lightText
          }}>
            Add New Medicine
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ 
                display: "block",
                marginBottom: "8px",
                color: colors.lightText,
                fontSize: "0.875rem"
              }}>
                Name:
              </label>
              <input
                type="text"
                name="name"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: colors.darkBackground,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "4px",
                  color: colors.lightText
                }}
                value={addFormData.name}
                onChange={(e) => handleFormChange(e, 'add')}
                required
              />
            </div>
            <div>
              <label style={{ 
                display: "block",
                marginBottom: "8px",
                color: colors.lightText,
                fontSize: "0.875rem"
              }}>
                Category:
              </label>
              <input
                type="text"
                name="category"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: colors.darkBackground,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "4px",
                  color: colors.lightText
                }}
                value={addFormData.category}
                onChange={(e) => handleFormChange(e, 'add')}
                required
              />
            </div>
            <div>
              <label style={{ 
                display: "block",
                marginBottom: "8px",
                color: colors.lightText,
                fontSize: "0.875rem"
              }}>
                Price (Rs):
              </label>
              <input
                type="number"
                name="price"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: colors.darkBackground,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "4px",
                  color: colors.lightText
                }}
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
            <div>
              <label style={{ 
                display: "block",
                marginBottom: "8px",
                color: colors.lightText,
                fontSize: "0.875rem"
              }}>
                Stock:
              </label>
              <input
                type="number"
                name="stock"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: colors.darkBackground,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "4px",
                  color: colors.lightText
                }}
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
            <div>
              <label style={{ 
                display: "block",
                marginBottom: "8px",
                color: colors.lightText,
                fontSize: "0.875rem"
              }}>
                Status:
              </label>
              <select
                name="status"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: colors.darkBackground,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: "4px",
                  color: colors.lightText
                }}
                value={addFormData.status}
                onChange={(e) => handleFormChange(e, 'add')}
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
          <div style={{ 
            display: "flex",
            gap: "12px",
            marginTop: "20px"
          }}>
            <button 
              style={{
                padding: "8px 16px",
                backgroundColor: colors.tealAccent,
                color: colors.darkText,
                border: "none",
                borderRadius: "6px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                ':hover': {
                  opacity: 0.9
                }
              }}
              onClick={handleAddSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button 
              style={{
                padding: "8px 16px",
                backgroundColor: colors.cardBackground,
                color: colors.lightText,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: "6px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                ':hover': {
                  backgroundColor: "rgba(255,255,255,0.1)"
                }
              }}
              onClick={handleCancelAdd}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ 
          textAlign: "center",
          padding: "40px",
          color: colors.tealAccent
        }}>
          Loading medicines...
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
                  }}>Category</th>
                  <th style={{ 
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: colors.tealAccent
                  }}>Price</th>
                  <th style={{ 
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: colors.tealAccent
                  }}>Stock</th>
                  <th style={{ 
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: colors.tealAccent
                  }}>Status</th>
                  <th style={{ 
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: colors.tealAccent
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.length > 0 ? (
                  medicines.map((medicine) => (
                    <tr key={medicine.id} style={{ 
                      borderBottom: `1px solid ${colors.borderColor}`,
                      ':hover': {
                        backgroundColor: "rgba(255,255,255,0.05)"
                      }
                    }}>
                      <td style={{ 
                        padding: "12px 16px",
                        color: colors.lightText
                      }}>
                        {medicine.id}
                      </td>
                      <td style={{ 
                        padding: "12px 16px",
                        color: colors.lightText
                      }}>
                        {editingMedicine === medicine.id ? (
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={(e) => handleFormChange(e, 'edit')}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              backgroundColor: colors.darkBackground,
                              border: `1px solid ${colors.borderColor}`,
                              borderRadius: "4px",
                              color: colors.lightText
                            }}
                            required
                          />
                        ) : (
                          medicine.name
                        )}
                      </td>
                      <td style={{ 
                        padding: "12px 16px",
                        color: colors.lightText
                      }}>
                        {editingMedicine === medicine.id ? (
                          <input
                            type="text"
                            name="category"
                            value={editFormData.category}
                            onChange={(e) => handleFormChange(e, 'edit')}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              backgroundColor: colors.darkBackground,
                              border: `1px solid ${colors.borderColor}`,
                              borderRadius: "4px",
                              color: colors.lightText
                            }}
                            required
                          />
                        ) : (
                          medicine.category
                        )}
                      </td>
                      <td style={{ 
                        padding: "12px 16px",
                        color: colors.lightText
                      }}>
                        {editingMedicine === medicine.id ? (
                          <input
                            type="number"
                            name="price"
                            value={editFormData.price}
                            onChange={(e) => handleFormChange(e, 'edit')}
                            step="0.01"
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              backgroundColor: colors.darkBackground,
                              border: `1px solid ${colors.borderColor}`,
                              borderRadius: "4px",
                              color: colors.lightText
                            }}
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
                      <td style={{ 
                        padding: "12px 16px",
                        color: colors.lightText
                      }}>
                        {editingMedicine === medicine.id ? (
                          <input
                            type="number"
                            name="stock"
                            value={editFormData.stock}
                            onChange={(e) => handleFormChange(e, 'edit')}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              backgroundColor: colors.darkBackground,
                              border: `1px solid ${colors.borderColor}`,
                              borderRadius: "4px",
                              color: colors.lightText
                            }}
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
                      <td style={{ 
                        padding: "12px 16px",
                        color: colors.lightText
                      }}>
                        {editingMedicine === medicine.id ? (
                          <select
                            name="status"
                            value={editFormData.status}
                            onChange={(e) => handleFormChange(e, 'edit')}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              backgroundColor: colors.darkBackground,
                              border: `1px solid ${colors.borderColor}`,
                              borderRadius: "4px",
                              color: colors.lightText
                            }}
                          >
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        ) : (
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            backgroundColor:
                              medicine.status === "In Stock" ? "rgba(16,185,129,0.2)" :
                              medicine.status === "Low Stock" ? "rgba(234,179,8,0.2)" :
                              "rgba(239,68,68,0.2)",
                            color:
                              medicine.status === "In Stock" ? colors.successGreen :
                              medicine.status === "Low Stock" ? colors.yellowAccent :
                              colors.warningRed
                          }}>
                            {medicine.status}
                          </span>
                        )}
                      </td>
                      <td style={{ 
                        padding: "12px 16px",
                        color: colors.lightText
                      }}>
                        {editingMedicine === medicine.id ? (
                          <div style={{ 
                            display: "flex",
                            gap: "8px"
                          }}>
                            <button 
                              style={{
                                padding: "6px 12px",
                                backgroundColor: colors.tealAccent,
                                color: colors.darkText,
                                border: "none",
                                borderRadius: "4px",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                ':hover': {
                                  opacity: 0.9
                                }
                              }}
                              onClick={() => handleEditSubmit(medicine.id)}
                              disabled={loading}
                            >
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              style={{
                                padding: "6px 12px",
                                backgroundColor: colors.cardBackground,
                                color: colors.lightText,
                                border: `1px solid ${colors.borderColor}`,
                                borderRadius: "4px",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                ':hover': {
                                  backgroundColor: "rgba(255,255,255,0.1)"
                                }
                              }}
                              onClick={handleCancelEdit}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ 
                            display: "flex",
                            gap: "8px"
                          }}>
                            <button 
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "rgba(59,205,191,0.2)",
                                color: colors.tealAccent,
                                border: "none",
                                borderRadius: "4px",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                ':hover': {
                                  backgroundColor: "rgba(59,205,191,0.3)"
                                }
                              }}
                              onClick={() => handleEditClick(medicine)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button 
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "rgba(239,68,68,0.2)",
                                color: colors.warningRed,
                                border: "none",
                                borderRadius: "4px",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                ':hover': {
                                  backgroundColor: "rgba(239,68,68,0.3)"
                                }
                              }}
                              onClick={() => handleDelete(medicine.id)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ 
                      textAlign: "center", 
                      padding: "40px",
                      color: colors.lightText
                    }}>
                      No medicines found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div style={{ 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "24px",
            padding: "16px",
            backgroundColor: colors.cardBackground,
            borderRadius: "8px",
            gap: "16px"
          }}>
            <button
              style={{
                padding: "8px 16px",
                backgroundColor: currentPage === 1 ? "rgba(255,255,255,0.1)" : colors.tealAccent,
                color: currentPage === 1 ? colors.lightText : colors.darkText,
                border: "none",
                borderRadius: "6px",
                fontWeight: "500",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: currentPage === 1 ? 0.7 : 1
              }}
              onClick={goToPrevPage}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </button>
            
            <div style={{ 
              display: "flex",
              gap: "8px"
            }}>
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
            </div>
            
            <button
              style={{
                padding: "8px 16px",
                backgroundColor: currentPage === totalPages ? "rgba(255,255,255,0.1)" : colors.tealAccent,
                color: currentPage === totalPages ? colors.lightText : colors.darkText,
                border: "none",
                borderRadius: "6px",
                fontWeight: "500",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: currentPage === totalPages ? 0.7 : 1
              }}
              onClick={goToNextPage}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}