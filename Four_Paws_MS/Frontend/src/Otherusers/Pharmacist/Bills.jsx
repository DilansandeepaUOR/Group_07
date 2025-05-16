"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export default function PetShopBills() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewBillForm, setShowNewBillForm] = useState(false)
  const [showBillDetails, setShowBillDetails] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [products, setProducts] = useState([]) // Changed from medicines to products
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 5
  const { toast } = useToast()

  const [newBill, setNewBill] = useState({
    customerName: "",
    customerPhone: "",
    petDetails: "", // Added pet details field
    items: [],
    total: 0,
    discount: 0, // Added discount field
  })

  useEffect(() => {
    fetchBills()
    fetchProducts()
  }, [currentPage, searchTerm])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/petshop/bills?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      if (!response.ok) throw new Error("Failed to fetch bills")
      const data = await response.json()
      if (data && Array.isArray(data.bills)) {
        setBills(data.bills)
        setTotalPages(Math.ceil(data.total / itemsPerPage))
        setError(null)
      } else {
        throw new Error("Invalid data format received")
      }
    } catch (err) {
      setError(err.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch bills: " + err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/petshop/products", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      if (data && Array.isArray(data.products)) {
        setProducts(data.products)
      } else {
        throw new Error("Invalid products data format")
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch products: " + err.message,
      })
    }
  }

  const handleAddItem = (productId) => {
    const product = products.find((p) => p.id === Number.parseInt(productId))
    if (!product) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Product not found",
      })
      return
    }

    setNewBill((prev) => {
      const existingItem = prev.items.find((item) => item.productId === product.id)
      let updatedItems

      if (existingItem) {
        updatedItems = prev.items.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        updatedItems = [
          ...prev.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            category: product.category, // Added product category
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

  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = Number.parseInt(newQuantity) || 1
    if (quantity < 1) return

    setNewBill((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.productId === productId ? { ...item, quantity: quantity } : item,
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

  const handleRemoveItem = (productId) => {
    setNewBill((prev) => {
      const updatedItems = prev.items.filter((item) => item.productId !== productId)
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

      if (newBill.items.length === 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please add at least one item to the bill",
        })
        return
      }

      const billData = {
        ...newBill,
        customerName: newBill.customerName.trim(),
        customerPhone: newBill.customerPhone.trim(),
        petDetails: newBill.petDetails.trim(),
        items: newBill.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }

      const response = await fetch("/api/petshop/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(billData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create bill")
      }

      setShowNewBillForm(false)
      setNewBill({
        customerName: "",
        customerPhone: "",
        petDetails: "",
        items: [],
        total: 0,
        discount: 0,
      })
      await fetchBills()
      toast({
        title: "Success",
        description: "Bill created successfully",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create bill",
      })
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleViewBill = async (billId) => {
    try {
      const response = await fetch(`/api/petshop/bills/${billId}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) throw new Error("Failed to fetch bill details")
      const data = await response.json()
      if (data) {
        setSelectedBill(data)
        setShowBillDetails(true)
      } else {
        throw new Error("Invalid bill data received")
      }
    } catch (err) {
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
      const response = await fetch(`/api/petshop/bills/${billId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) throw new Error("Failed to delete bill")
      await fetchBills()
      setError(null)
      toast({
        title: "Success",
        description: "Bill deleted successfully",
      })
    } catch (err) {
      setError(err.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete bill: " + err.message,
      })
    }
  }

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
                  <tr className="border-b">
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
                        Loading bills...
                      </td>
                    </tr>
                  ) : bills.length > 0 ? (
                    bills.map((bill) => (
                      <tr key={bill.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">#{bill.id}</td>
                        <td className="py-3 px-4">{bill.customerName}</td>
                        <td className="py-3 px-4">{bill.petDetails || "N/A"}</td>
                        <td className="py-3 px-4">{new Date(bill.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(bill.total)}</td>
                        <td className="py-3 px-4 text-center">
                          <Button size="sm" variant="ghost" className="mr-2" onClick={() => handleViewBill(bill.id)}>
                            <FileText className="mr-1 h-4 w-4" /> View
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteBill(bill.id)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-6">
                        No bills found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4">
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Pet Shop Bill</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block font-medium mb-1">Customer Name*</label>
                <Input
                  value={newBill.customerName}
                  onChange={(e) => setNewBill((prev) => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Phone Number</label>
                <Input
                  value={newBill.customerPhone}
                  onChange={(e) => setNewBill((prev) => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium mb-1">Pet Details</label>
                <Input
                  value={newBill.petDetails}
                  onChange={(e) => setNewBill((prev) => ({ ...prev, petDetails: e.target.value }))}
                  placeholder="Enter pet species, breed, age, etc."
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Add Products</h3>
              <Select onValueChange={handleAddItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.category}) - {formatCurrency(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Bill Items</h3>
              <div className="border rounded-md p-4">
                {newBill.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium">Product</th>
                          <th className="text-left py-2 px-3 font-medium">Category</th>
                          <th className="text-left py-2 px-3 font-medium">Price</th>
                          <th className="text-left py-2 px-3 font-medium">Quantity</th>
                          <th className="text-left py-2 px-3 font-medium">Total</th>
                          <th className="text-left py-2 px-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newBill.items.map((item) => (
                          <tr key={item.productId} className="border-b">
                            <td className="py-2 px-3">{item.name}</td>
                            <td className="py-2 px-3">{item.category}</td>
                            <td className="py-2 px-3">{formatCurrency(item.price)}</td>
                            <td className="py-2 px-3">
                              <Input
                                type="number"
                                min="1"
                                className="w-20"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                              />
                            </td>
                            <td className="py-2 px-3">{formatCurrency(item.price * item.quantity)}</td>
                            <td className="py-2 px-3">
                              <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.productId)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-b">
                          <td colSpan={4} className="text-right py-2 px-3 font-medium">
                            Subtotal:
                          </td>
                          <td className="py-2 px-3 font-medium">
                            {formatCurrency(newBill.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                          </td>
                          <td></td>
                        </tr>
                        <tr className="border-b">
                          <td colSpan={4} className="text-right py-2 px-3 font-medium">
                            <div className="flex items-center justify-end gap-2">
                              Discount (%):
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                className="w-20"
                                value={newBill.discount}
                                onChange={handleDiscountChange}
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3 font-medium">
                            -
                            {formatCurrency(
                              newBill.items.reduce((sum, item) => sum + item.price * item.quantity, 0) *
                                (newBill.discount / 100),
                            )}
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-right py-2 px-3 font-medium">
                            Total:
                          </td>
                          <td className="py-2 px-3 font-medium">{formatCurrency(newBill.total)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No items added yet</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
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
                  })
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
                onClick={handleCreateBill}
                disabled={!newBill.customerName.trim() || newBill.items.length === 0}
              >
                Create Bill
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bill Details Dialog */}
        <Dialog open={showBillDetails} onOpenChange={setShowBillDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pet Shop Bill Details #{selectedBill?.id}</DialogTitle>
            </DialogHeader>

            {selectedBill && (
              <>
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
                          <th className="text-left py-2 px-3 font-medium">Product</th>
                          <th className="text-left py-2 px-3 font-medium">Category</th>
                          <th className="text-right py-2 px-3 font-medium">Price</th>
                          <th className="text-right py-2 px-3 font-medium">Quantity</th>
                          <th className="text-right py-2 px-3 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.items.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-3">{item.name}</td>
                            <td className="py-2 px-3">{item.category}</td>
                            <td className="py-2 px-3 text-right">{formatCurrency(item.price)}</td>
                            <td className="py-2 px-3 text-right">{item.quantity}</td>
                            <td className="py-2 px-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-b">
                          <td colSpan={4} className="text-right py-2 px-3 font-medium">
                            Subtotal:
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {formatCurrency(
                              selectedBill.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                            )}
                          </td>
                        </tr>
                        {selectedBill.discount > 0 && (
                          <tr className="border-b">
                            <td colSpan={4} className="text-right py-2 px-3 font-medium">
                              Discount ({selectedBill.discount}%):
                            </td>
                            <td className="py-2 px-3 text-right font-medium">
                              -
                              {formatCurrency(
                                selectedBill.items.reduce((sum, item) => sum + item.price * item.quantity, 0) *
                                  (selectedBill.discount / 100),
                              )}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan={4} className="text-right py-2 px-3 font-medium">
                            Total:
                          </td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(selectedBill.total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
