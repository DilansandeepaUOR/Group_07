"use client"

import { useState, useEffect } from "react"
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"
import { Button } from "../../Components/ui/button"

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
    status: 'In Stock',
    manufactureDate: '',
    expiryDate: ''
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    status: 'In Stock',
    manufactureDate: '',
    expiryDate: ''
  })
  const itemsPerPage = 4
  const [showDeleted, setShowDeleted] = useState(false);

  const getStockStatus = (stock) => {
    const stockCount = parseInt(stock);
    if (stockCount === 0) return "Out of Stock";
    if (stockCount > 0 && stockCount <= 15) return "Low Stock";
    return "In Stock";
  };

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

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}?search=${searchTerm}&page=${currentPage}&limit=${itemsPerPage}&showDeleted=${showDeleted}`
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
  }, [searchTerm, currentPage, itemsPerPage, showDeleted]);

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
      status: getStockStatus(medicine.stock),
      manufactureDate: medicine.manufactureDate ? new Date(medicine.manufactureDate).toISOString().split('T')[0] : '',
      expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : ''
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

    if (!editFormData.manufactureDate || !editFormData.expiryDate) {
      setError('Manufacture date and expiry date are required');
      return;
    }

    const manufactureDate = new Date(editFormData.manufactureDate);
    const expiryDate = new Date(editFormData.expiryDate);
    const today = new Date();

    if (manufactureDate > today) {
      setError('Manufacture date cannot be in the future');
      return;
    }

    if (expiryDate <= manufactureDate) {
      setError('Expiry date must be after manufacture date');
      return;
    }
    
    try {
      setLoading(true);
      const updatedData = {
        ...editFormData,
        price: parseFloat(editFormData.price),
        stock: parseInt(editFormData.stock),
        status: getStockStatus(editFormData.stock),
        manufactureDate: editFormData.manufactureDate,
        expiryDate: editFormData.expiryDate
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

    if (!addFormData.manufactureDate || !addFormData.expiryDate) {
      setError('Manufacture date and expiry date are required');
      return;
    }

    const manufactureDate = new Date(addFormData.manufactureDate);
    const expiryDate = new Date(addFormData.expiryDate);
    const today = new Date();

    if (manufactureDate > today) {
      setError('Manufacture date cannot be in the future');
      return;
    }

    if (expiryDate <= manufactureDate) {
      setError('Expiry date must be after manufacture date');
      return;
    }
    
    try {
      setLoading(true);
      const newMedicine = {
        ...addFormData,
        price: parseFloat(addFormData.price),
        stock: parseInt(addFormData.stock),
        status: getStockStatus(addFormData.stock),
        manufactureDate: addFormData.manufactureDate,
        expiryDate: addFormData.expiryDate
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
        status: 'In Stock',
        manufactureDate: '',
        expiryDate: ''
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
      status: 'In Stock',
      manufactureDate: '',
      expiryDate: ''
    })
  }

  const handleSoftDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this medicine?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${id}/soft`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to archive medicine');
      }
      
      // Update the medicine's status in the local state
      setMedicines(medicines.map(medicine => 
        medicine.id === id 
          ? { ...medicine, deleted_at: new Date().toISOString(), isDeleted: true }
          : medicine
      ));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error archiving medicine:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Are you sure you want to restore this medicine?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore medicine');
      }
      
      // Update the medicine's status in the local state
      setMedicines(medicines.map(medicine => 
        medicine.id === id 
          ? { ...medicine, deleted_at: null, isDeleted: false }
          : medicine
      ));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error restoring medicine:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Medicine Inventory</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showDeleted"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="rounded border-gray-300 text-[#71C9CE] focus:ring-[#71C9CE]"
              />
              <label htmlFor="showDeleted" className="text-sm text-gray-600">
                Show Archived
              </label>
            </div>
            <input
              type="text"
              placeholder="Search medicines..."
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#71C9CE]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
            <Button
              className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900 flex items-center"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus className="mr-2" /> Add Medicine
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white/30 backdrop-blur-md p-6 rounded-lg shadow-lg mb-6 border border-[#71C9CE]">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-[#028478]">Add New Medicine</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-2 border rounded-md"
                    value={addFormData.name}
                    onChange={(e) => handleFormChange(e, 'add')}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    className="w-full p-2 border rounded-md"
                    value={addFormData.category}
                    onChange={(e) => handleFormChange(e, 'add')}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Price (Rs)</label>
                  <input
                    type="number"
                    name="price"
                    className="w-full p-2 border rounded-md"
                    value={addFormData.price}
                    onChange={(e) => handleFormChange(e, 'add')}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    className="w-full p-2 border rounded-md"
                    value={addFormData.stock}
                    onChange={(e) => handleFormChange(e, 'add')}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Manufacture Date</label>
                  <input
                    type="date"
                    name="manufactureDate"
                    className="w-full p-2 border rounded-md"
                    value={addFormData.manufactureDate}
                    onChange={(e) => handleFormChange(e, 'add')}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    className="w-full p-2 border rounded-md"
                    value={addFormData.expiryDate}
                    onChange={(e) => handleFormChange(e, 'add')}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Status</label>
                  <select
                    name="status"
                    className="w-full p-2 border rounded-md"
                    value={addFormData.status}
                    onChange={(e) => handleFormChange(e, 'add')}
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div className="col-span-2 flex space-x-4 mt-4">
                  <Button
                    type="button"
                    className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
                    onClick={handleAddSubmit}
                  >
                    Add Medicine
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelAdd}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center p-10 text-[#71C9CE]">Loading medicines...</div>
        ) : (
          <>
            <div className="bg-white/30 backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#71C9CE] text-gray-900 sticky top-0">
                    <tr>
                      <th className="p-3 border-l-2">ID</th>
                      <th className="p-3 border-l-2">Name</th>
                      <th className="p-3 border-l-2">Category</th>
                      <th className="p-3 border-l-2">Price</th>
                      <th className="p-3 border-l-2">Stock</th>
                      <th className="p-3 border-l-2">Manufacture Date</th>
                      <th className="p-3 border-l-2">Expiry Date</th>
                      <th className="p-3 border-l-2">Status</th>
                      <th className="p-3 border-l-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.length > 0 ? (
                      medicines.map((medicine) => (
                        <tr key={medicine.id} className={`border-t hover:bg-gray-50/50 ${medicine.isDeleted ? 'bg-gray-100' : ''}`}>
                          <td className="p-3">{medicine.id}</td>
                          <td className="p-3">
                            {editingMedicine === medicine.id ? (
                              <input
                                type="text"
                                name="name"
                                className="w-full p-2 border rounded-md"
                                value={editFormData.name}
                                onChange={(e) => handleFormChange(e, 'edit')}
                                required
                              />
                            ) : (
                              <span className={medicine.isDeleted ? 'line-through text-gray-500' : ''}>
                                {medicine.name}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {editingMedicine === medicine.id ? (
                              <input
                                type="text"
                                name="category"
                                className="w-full p-2 border rounded-md"
                                value={editFormData.category}
                                onChange={(e) => handleFormChange(e, 'edit')}
                                required
                              />
                            ) : (
                              medicine.category
                            )}
                          </td>
                          <td className="p-3">
                            {editingMedicine === medicine.id ? (
                              <input
                                type="number"
                                name="price"
                                className="w-full p-2 border rounded-md"
                                value={editFormData.price}
                                onChange={(e) => handleFormChange(e, 'edit')}
                                step="0.01"
                                min="0"
                                required
                              />
                            ) : (
                              `Rs ${medicine.price}`
                            )}
                          </td>
                          <td className="p-3">
                            {editingMedicine === medicine.id ? (
                              <input
                                type="number"
                                name="stock"
                                className="w-full p-2 border rounded-md"
                                value={editFormData.stock}
                                onChange={(e) => handleFormChange(e, 'edit')}
                                min="0"
                                required
                              />
                            ) : (
                              medicine.stock
                            )}
                          </td>
                          <td className="p-3">
                            {editingMedicine === medicine.id ? (
                              <input
                                type="date"
                                name="manufactureDate"
                                className="w-full p-2 border rounded-md"
                                value={editFormData.manufactureDate}
                                onChange={(e) => handleFormChange(e, 'edit')}
                                required
                              />
                            ) : (
                              medicine.manufactureDate ? new Date(medicine.manufactureDate).toLocaleDateString() : 'N/A'
                            )}
                          </td>
                          <td className="p-3">
                            {editingMedicine === medicine.id ? (
                              <input
                                type="date"
                                name="expiryDate"
                                className="w-full p-2 border rounded-md"
                                value={editFormData.expiryDate}
                                onChange={(e) => handleFormChange(e, 'edit')}
                                required
                              />
                            ) : (
                              medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'
                            )}
                          </td>
                          <td className="p-3">
                            {editingMedicine === medicine.id ? (
                              <select
                                name="status"
                                className="w-full p-2 border rounded-md"
                                value={editFormData.status}
                                onChange={(e) => handleFormChange(e, 'edit')}
                              >
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                medicine.status === "In Stock" ? "bg-green-100 text-green-800" :
                                medicine.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {medicine.status}
                              </span>
                            )}
                          </td>
                          <td className="p-3 space-x-2">
                            {editingMedicine === medicine.id ? (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
                                  onClick={() => handleEditSubmit(medicine.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                {!medicine.isDeleted && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleEditClick(medicine)}
                                    >
                                      <FaEdit />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleSoftDelete(medicine.id)}
                                    >
                                      <FaTrash />
                                    </Button>
                                  </>
                                )}
                                {medicine.isDeleted && (
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => handleRestore(medicine.id)}
                                  >
                                    Restore
                                  </Button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center p-10 text-gray-500">
                          No medicines found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center items-center mt-6 space-x-4">
              <Button
                className={`${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#71C9CE] hover:bg-[#A6E3E9]'} text-gray-900`}
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className={`${currentPage === page ? 'bg-[#71C9CE] text-gray-900' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                className={`${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#71C9CE] hover:bg-[#A6E3E9]'} text-gray-900`}
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}