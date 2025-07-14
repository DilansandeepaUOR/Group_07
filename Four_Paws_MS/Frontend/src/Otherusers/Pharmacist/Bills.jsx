import React, { useState, useEffect } from "react"
import { Plus, Trash2, FileText } from "lucide-react"
import { Button } from "../../Components/ui/button"
import { Input } from "../../Components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../Components/ui/dialog"
import { useToast } from "../../Components/ui/use-toast"

const generatePDF = (bill) => {
  const printWindow = window.open('', '_blank');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bill #${bill.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #71C9CE;
          margin-bottom: 10px;
        }
        .bill-info {
          margin-bottom: 20px;
        }
        .customer-info {
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
        }
        .total-section {
          margin-top: 20px;
          text-align: right;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        @media print {
          body {
            margin: 0;
            padding: 20px;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Four Paws Pet Care Center</div>
        <div>Pharmacy Bill</div>
      </div>

      <div class="bill-info">
        <strong>Bill No:</strong> #${bill.id}<br>
        <strong>Date:</strong> ${new Date(bill.createdAt).toLocaleString()}<br>
      </div>

      <div class="customer-info">
        <strong>Customer Name:</strong> ${bill.customerName}<br>
        ${bill.customerPhone ? `<strong>Phone:</strong> ${bill.customerPhone}<br>` : ''}
        ${bill.petDetails ? `<strong>Pet Details:</strong> ${bill.petDetails}<br>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${bill.items.map(item => `
            <tr>
              <td>${item.medicineName || item.name}</td>
              <td>Rs. ${item.price.toFixed(2)}</td>
              <td>${item.quantity}</td>
              <td>Rs. ${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <p><strong>Subtotal:</strong> Rs. ${(bill.total / (1 - bill.discount/100)).toFixed(2)}</p>
        <p><strong>Discount (${bill.discount}%):</strong> Rs. ${(bill.total / (1 - bill.discount/100) * (bill.discount/100)).toFixed(2)}</p>
        <p><strong>Total:</strong> Rs. ${bill.total.toFixed(2)}</p>
        <p><strong>Amount Paid:</strong> Rs. ${bill.amountPaid.toFixed(2)}</p>
        <p><strong>Balance:</strong> Rs. ${bill.balance.toFixed(2)}</p>
      </div>

      <div class="footer">
        <p>Thank you for choosing Four Paws Pet Care Center!</p>
        <p>For any queries, please contact us at: support@fourpaws.com</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export default function PetShopBills() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewBillForm, setShowNewBillForm] = useState(false)
  const [showBillDetails, setShowBillDetails] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 5
  const { toast } = useToast()

  const [newBill, setNewBill] = useState({
    customerName: "",
    customerPhone: "",
    petDetails: "",
    items: [],
    total: 0,
    discount: 0,
    amountPaid: 0,
    balance: 0
  })

  const [medicineSearch, setMedicineSearch] = useState("")
  const [filteredMedicines, setFilteredMedicines] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBills()
    fetchMedicines()
  }, [currentPage, searchTerm])

  useEffect(() => {
    if (medicines.length > 0) {
      setFilteredMedicines(medicines)
    }
  }, [medicines])

  const fetchBills = async () => {
    try {
      setLoading(true)
      console.log('Fetching bills...');
      const response = await fetch(
        `http://localhost:3001/pharmacy/api/pharmacy/bills?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log('Bills response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch bills: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received bills data:', data);
      
      if (data && Array.isArray(data.bills)) {
        // Process the bills to ensure all required fields are present
        const processedBills = data.bills.map(bill => ({
          ...bill,
          total: Number(bill.total),
          discount: Number(bill.discount),
          amountPaid: Number(bill.amountPaid),
          balance: Number(bill.balance),
          items: Array.isArray(bill.items) ? bill.items : []
        }));
        
        setBills(processedBills);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
        setError(null);
      } else {
        console.error('Invalid data format:', data);
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      console.error('Error in fetchBills:', err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch bills: " + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

 const fetchMedicines = async () => {
  try {
      setIsLoading(true);
      setError(null);
      console.log('Starting to fetch medicines...');
      
      // First, check if the server is running
      const response = await fetch("http://localhost:3001/pharmacy/api/medicines?limit=100", {
        method: 'GET',
        credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(
          response.status === 404 
            ? 'API endpoint not found. Please check if the server is running.' 
            : `Failed to fetch medicines (${response.status})`
        );
      }

      const data = await response.json();
      console.log('Received data:', data);

      if (!data || !data.data) {
        throw new Error('Invalid data format received from server');
      }

      const availableMedicines = data.data
        .filter(med => !med.deleted_at && med.stock > 0)
        .map(med => ({
          id: med.id,
          name: med.name,
          category: med.category,
          price: parseFloat(med.price),
          stock: parseInt(med.stock),
          expiryDate: med.expiryDate,
          status: getStockStatus(med.stock)
        }));

      console.log('Available medicines:', availableMedicines);
      setMedicines(availableMedicines);
      setFilteredMedicines(availableMedicines);
      setError(null);
    } catch (error) {
      console.error('Error in fetchMedicines:', error);
      setError(error.message);
    toast({
      variant: "destructive",
        title: "Error Fetching Medicines",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine stock status
  const getStockStatus = (stock) => {
    const stockNum = parseInt(stock);
    if (stockNum === 0) return "Out of Stock";
    if (stockNum <= 5) return "Low Stock";
    return "In Stock";
  };

  // Make sure we fetch medicines when component mounts
  useEffect(() => {
    fetchMedicines()
  }, [])

  const handleMedicineSearch = (searchTerm) => {
    console.log('Searching with term:', searchTerm)
    console.log('Current medicines:', medicines)
    
    setMedicineSearch(searchTerm)
    
    if (!searchTerm.trim()) {
      console.log('Empty search, showing all medicines:', medicines)
      setFilteredMedicines(medicines)
      return
    }

    const searchLower = searchTerm.toLowerCase()
  const filtered = medicines.filter(medicine => 
      medicine.name.toLowerCase().includes(searchLower) ||
      medicine.category.toLowerCase().includes(searchLower)
    )
    
    console.log('Filtered results:', filtered)
    setFilteredMedicines(filtered)
  }

  const handleAddItem = (medicineId) => {
    const medicine = medicines.find((m) => m.id === Number.parseInt(medicineId))
    if (!medicine) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Medicine not found",
      })
      return
    }

    if (medicine.stock <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Medicine is out of stock",
      })
      return
    }

    setNewBill((prev) => {
      const existingItem = prev.items.find((item) => item.medicineId === medicine.id)
      let updatedItems

      if (existingItem) {
        // Check if adding one more would exceed available stock
        if (existingItem.quantity + 1 > medicine.stock) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Only ${medicine.stock} units available`,
          })
          return prev
        }
        updatedItems = prev.items.map((item) =>
          item.medicineId === medicine.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        updatedItems = [
          ...prev.items,
          {
            medicineId: medicine.id,
            name: medicine.name,
            price: medicine.price,
            quantity: 1,
            category: medicine.category,
            stock: medicine.stock,
          },
        ]
      }

      const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const total = subtotal - subtotal * (prev.discount / 100)

      return {
        ...prev,
        items: updatedItems,
        total: total,
      }
    })
  }

  const handleQuantityChange = (medicineId, newQuantity) => {
    const quantity = Number.parseInt(newQuantity) || 1
    if (quantity < 1) return

    const medicine = medicines.find((m) => m.id === medicineId)
    if (!medicine) return

    if (quantity > medicine.stock) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Only ${medicine.stock} units available`,
      })
      return
    }

    setNewBill((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.medicineId === medicineId ? { ...item, quantity: quantity } : item,
      )

      const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const total = subtotal - subtotal * (prev.discount / 100)

      return {
        ...prev,
        items: updatedItems,
        total: total,
      }
    })
  }

  const handleRemoveItem = (medicineId) => {
    setNewBill((prev) => {
      const updatedItems = prev.items.filter((item) => item.medicineId !== medicineId)
      const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const total = subtotal - subtotal * (prev.discount / 100)

      return {
        ...prev,
        items: updatedItems,
        total: total,
      }
    })
  }

  const handleDiscountChange = (e) => {
    const discount = Number.parseFloat(e.target.value) || 0
    if (discount < 0 || discount > 100) return

    setNewBill((prev) => {
      const subtotal = prev.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const total = subtotal - subtotal * (discount / 100)

      return {
        ...prev,
        discount: discount,
        total: total,
      }
    })
  }

  const handleAmountPaidChange = (amount) => {
    const paid = Number.parseFloat(amount) || 0
    setNewBill(prev => ({
      ...prev,
      amountPaid: paid,
      balance: paid - prev.total
    }))
  }

  const handleCreateBill = async () => {
    try {
      if (!newBill.customerName.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please enter customer name",
        })
        return
      }

      // Phone number validation: must be 10 digits if provided
      if (newBill.customerPhone.trim() && !/^\d{10}$/.test(newBill.customerPhone.trim())) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Enter a valid phone number.",
        })
        return
      }

      if (newBill.items.length === 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please add at least one item to the bill",
        })
        return
      }

      if (newBill.amountPaid < newBill.total) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Amount paid must be equal to or greater than total amount",
        })
        return
      }

      // Calculate final values with exact decimal precision
      const subtotal = Number(newBill.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2))
      const discountAmount = Number((subtotal * (newBill.discount / 100)).toFixed(2))
      const total = Number((subtotal - discountAmount).toFixed(2))
      const amountPaid = Number(newBill.amountPaid.toFixed(2))
      const balance = Number((amountPaid - total).toFixed(2))

      // Create bill data matching MySQL table structure
      const billData = {
        customerName: newBill.customerName.trim(),
        customerPhone: newBill.customerPhone.trim() || null,
        petDetails: newBill.petDetails.trim() || null,
        total: total,
        discount: Number(newBill.discount.toFixed(2)),
        amountPaid: amountPaid,
        balance: balance,
        status: 'COMPLETED',
        items: newBill.items.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: Number(item.price.toFixed(2))
        }))
      }

      console.log('Attempting to create bill with data:', billData);

      const response = await fetch("http://localhost:3001/pharmacy/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(billData),
      })

      console.log('Create bill response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error creating bill:', errorText);
        throw new Error(`Failed to create bill: ${response.status} - ${errorText}`);
      }

      const data = await response.json()
      console.log('Create bill success response:', data);

      // Reset form
      setShowNewBillForm(false)
      setNewBill({
        customerName: "",
        customerPhone: "",
        petDetails: "",
        items: [],
        total: 0,
        discount: 0,
        amountPaid: 0,
        balance: 0
      })
      setMedicineSearch("")
      setFilteredMedicines([])
      
      toast({
        title: "Success",
        description: "Bill created successfully",
      })
      
      // Refresh data
      await Promise.all([
        fetchBills(),
        fetchMedicines()
      ])

    } catch (err) {
      console.error('Error in handleCreateBill:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create bill",
      })
    }
  }

  // Removed unused formatCurrency function

  const handleViewBill = async (billId) => {
    try {
      console.log('Viewing bill with ID:', billId);
      const response = await fetch(`http://localhost:3001/pharmacy/api/pharmacy/bills/${billId}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error viewing bill:', errorText);
        throw new Error("Failed to fetch bill details");
      }
      
      const data = await response.json()
      console.log('Received bill data:', data);
      
      if (data) {
        // Ensure all required fields are present and properly formatted
        const processedBill = {
          ...data,
          total: Number(data.total),
          discount: Number(data.discount),
          amountPaid: Number(data.amountPaid),
          balance: Number(data.balance),
          items: Array.isArray(data.items) ? data.items.map(item => ({
            ...item,
            price: Number(item.price),
            quantity: Number(item.quantity)
          })) : []
        };
        console.log('Processed bill data:', processedBill);
        setSelectedBill(processedBill);
        setShowBillDetails(true);
      } else {
        throw new Error("Invalid bill data received")
      }
    } catch (err) {
      console.error('Error in handleViewBill:', err);
      setError(err.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch bill details: " + err.message,
      })
    }
  }

  const handleDeleteBill = async (billId) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return

    try {
      const response = await fetch(`http://localhost:3001/pharmacy/api/bills/${billId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error deleting bill:', errorText);
        throw new Error("Failed to delete bill");
      }
      
      await fetchBills()
      setError(null)
      toast({
        title: "Success",
        description: "Bill deleted successfully",
      })
    } catch (err) {
      console.error('Error in handleDeleteBill:', err);
      setError(err.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete bill: " + err.message,
      })
    }
  }

  const medicineSearchSection = (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Medicine
        </label>
        <Input
          type="text"
          placeholder="Type medicine name or category..."
          value={medicineSearch}
          onChange={(e) => handleMedicineSearch(e.target.value)}
          className="w-full"
          disabled={isLoading}
        />
      </div>

      <div className="mt-4 max-h-60 overflow-y-auto border rounded-md">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading medicines...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error: {error}</p>
            <button 
              onClick={fetchMedicines}
              className="mt-2 text-blue-500 hover:text-blue-700 underline"
            >
              Try again
            </button>
          </div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No medicines available in stock</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No medicines found matching "{medicineSearch}"
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredMedicines.map((medicine) => (
              <button
                key={medicine.id}
                onClick={() => handleAddItem(medicine.id)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex flex-col"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{medicine.name}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    Rs. {medicine.price}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-500">{medicine.category}</span>
                  <span className={`text-sm font-medium ${
                    medicine.stock > 10 
                      ? 'text-green-600' 
                      : medicine.stock > 5 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                  }`}>
                    Stock: {medicine.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Pet Shop Pharmacy Bills</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Search bills..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900" onClick={() => setShowNewBillForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Bill
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bills List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium">Bill ID</th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Pet Details</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center p-6">
                        <div className="flex justify-center items-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#71C9CE]"></div>
                          <span>Loading bills...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="text-center p-6 text-red-500">
                        Error: {error}
                      </td>
                    </tr>
                  ) : bills.length > 0 ? (
                    bills.map((bill) => (
                      <tr key={bill.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">#{bill.id}</td>
                        <td className="py-3 px-4">{bill.customerName}</td>
                        <td className="py-3 px-4">{bill.petDetails || "N/A"}</td>
                        <td className="py-3 px-4">
                          {new Date(bill.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">Rs. {bill.total.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="mr-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={() => handleViewBill(bill.id)}
                          >
                            <FileText className="mr-1 h-4 w-4" /> View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => handleDeleteBill(bill.id)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-6 text-gray-500">
                        No bills found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Bill Dialog */}
        <Dialog open={showNewBillForm} onOpenChange={setShowNewBillForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Pharmacy Bill</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer Details Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Customer Name*</label>
                    <Input
                      value={newBill.customerName}
                      onChange={(e) => setNewBill((prev) => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter customer name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Phone Number</label>
                    <Input
                      value={newBill.customerPhone}
                      onChange={(e) => setNewBill((prev) => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="Enter phone number"
                      className="w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-medium mb-1">Pet Details</label>
                    <Input
                      value={newBill.petDetails}
                      onChange={(e) => setNewBill((prev) => ({ ...prev, petDetails: e.target.value }))}
                      placeholder="Enter pet species, breed, age, etc."
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Medicine Search Section */}
              {medicineSearchSection}

              {/* Bill Items Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Bill Items</h3>
                <div className="border rounded-md">
                  {newBill.items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-100">
                            <th className="text-left py-2 px-3 font-medium">Medicine</th>
                            <th className="text-right py-2 px-3 font-medium">Price</th>
                            <th className="text-right py-2 px-3 font-medium">Quantity</th>
                            <th className="text-right py-2 px-3 font-medium">Total</th>
                            <th className="text-center py-2 px-3 font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {newBill.items.map((item) => (
                            <tr key={item.medicineId} className="border-b">
                              <td className="py-2 px-3">{item.name}</td>
                              <td className="py-2 px-3 text-right">Rs {item.price}</td>
                              <td className="py-2 px-3 text-right">
                                <Input
                                  type="number"
                                  min="1"
                                  max={item.stock}
                                  className="w-20"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.medicineId, e.target.value)}
                                />
                              </td>
                              <td className="py-2 px-3 text-right">Rs {item.price * item.quantity}</td>
                              <td className="py-2 px-3 text-center">
                                <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.medicineId)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No items added yet</p>
                  )}
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Payment Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subtotal:</span>
                    <span>Rs {newBill.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Discount (%):</span>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        className="w-20"
                        value={newBill.discount}
                        onChange={handleDiscountChange}
                      />
                    </div>
                    <span>- Rs {newBill.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * (newBill.discount / 100)}</span>
                  </div>

                  <div className="flex justify-between items-center font-medium">
                    <span>Total Amount:</span>
                    <span>Rs {newBill.total}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Amount Paid:</span>
                      <Input
                        type="number"
                        min="0"
                        className="w-32"
                        value={newBill.amountPaid}
                        onChange={(e) => handleAmountPaidChange(e.target.value)}
                      />
                    </div>
                    <span>Rs {newBill.amountPaid}</span>
                  </div>

                  <div className="flex justify-between items-center font-medium text-lg">
                    <span>Balance:</span>
                    <span className={newBill.balance < 0 ? "text-red-500" : "text-green-500"}>
                      Rs {Math.abs(newBill.balance)} {newBill.balance < 0 ? "(Due)" : "(Change)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewBillForm(false)
                  setNewBill({
                    customerName: "",
                    customerPhone: "",
                    petDetails: "",
                    items: [],
                    total: 0,
                    discount: 0,
                    amountPaid: 0,
                    balance: 0
                  })
                  setMedicineSearch("")
                  setFilteredMedicines([])
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
                onClick={handleCreateBill}
                disabled={!newBill.customerName.trim() || newBill.items.length === 0 || newBill.amountPaid < newBill.total}
              >
                Create Bill
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bill Details Dialog */}
        <Dialog 
          open={showBillDetails} 
          onOpenChange={(open) => {
            console.log('Dialog open state changing to:', open);
            setShowBillDetails(open);
            if (!open) {
              setSelectedBill(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Pet Shop Bill Details #{selectedBill?.id}</DialogTitle>
            </DialogHeader>

            {selectedBill && (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-medium">Customer Name</p>
                    <p>{selectedBill.customerName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Phone Number</p>
                    <p>{selectedBill.customerPhone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Pet Details</p>
                    <p>{selectedBill.petDetails || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Date</p>
                    <p>{new Date(selectedBill.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium">Medicine</th>
                          <th className="text-right py-2 px-3 font-medium">Price</th>
                          <th className="text-right py-2 px-3 font-medium">Quantity</th>
                          <th className="text-right py-2 px-3 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.items.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-3">{item.name}</td>
                            <td className="py-2 px-3 text-right">Rs. {item.price.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right">{item.quantity}</td>
                            <td className="py-2 px-3 text-right">Rs. {(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-b">
                          <td colSpan={3} className="text-right py-2 px-3 font-medium">
                            Subtotal:
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            Rs. {(selectedBill.total / (1 - selectedBill.discount/100)).toFixed(2)}
                          </td>
                        </tr>
                        {selectedBill.discount > 0 && (
                          <tr className="border-b">
                            <td colSpan={3} className="text-right py-2 px-3 font-medium">
                              Discount ({selectedBill.discount}%):
                            </td>
                            <td className="py-2 px-3 text-right font-medium">
                              Rs. {(selectedBill.total / (1 - selectedBill.discount/100) * (selectedBill.discount/100)).toFixed(2)}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan={3} className="text-right py-2 px-3 font-medium">
                            Total:
                          </td>
                          <td className="py-2 px-3 text-right font-medium">Rs. {selectedBill.total.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-right py-2 px-3 font-medium">
                            Amount Paid:
                          </td>
                          <td className="py-2 px-3 text-right font-medium">Rs. {selectedBill.amountPaid.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-right py-2 px-3 font-medium">
                            Balance:
                          </td>
                          <td className="py-2 px-3 text-right font-medium">Rs. {selectedBill.balance.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" onClick={() => setShowBillDetails(false)}>
                    Close
                  </Button>
                  <Button 
                    className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
                    onClick={() => generatePDF(selectedBill)}
                  >
                    Print Bill
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}